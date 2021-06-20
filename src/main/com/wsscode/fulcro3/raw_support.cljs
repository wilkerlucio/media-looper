(ns com.wsscode.fulcro3.raw-support
  (:require
    [com.fulcrologic.fulcro.algorithms.tx-processing :as txn]
    [com.fulcrologic.fulcro.data-fetch :as df]
    [com.fulcrologic.fulcro.inspect.inspect-client :as inspect-client]
    [com.fulcrologic.fulcro.inspect.websocket-preload]
    [com.fulcrologic.fulcro.raw.components :as rc]
    [com.fulcrologic.fulcro.react.hooks :as f.hooks]
    [com.wsscode.misc.coll :as coll]
    [edn-query-language.core :as eql]
    [promesa.core :as p]))

(defn pathom-remote [interface]
  {:transmit! (fn transmit! [_ {::txn/keys [ast result-handler]}]
                (let [ok-handler    (fn [result]
                                      (try
                                        (result-handler (assoc result :status-code 200))
                                        (catch :default e
                                          (js/console.error e "Result handler for remote failed with an exception."))))
                      error-handler (fn [error-result]
                                      (try
                                        (result-handler (merge error-result {:status-code 500}))
                                        (catch :default e
                                          (js/console.error e "Error handler for remote failed with an exception."))))]
                  (-> (p/let [res (interface {:pathom/ast ast})]
                        (ok-handler {:transaction (eql/ast->query ast)
                                     :body        res}))
                      (p/catch (fn [e] (error-handler {:body e}))))))})

(defn app-started!
  "Register the application with Inspect, if it is available."
  [app]
  (let [networking (inspect-client/remotes app)
        state*     (inspect-client/state-atom app)
        app-uuid   (inspect-client/fulcro-app-id app)]
    (swap! inspect-client/apps* assoc app-uuid app)
    (inspect-client/record-history-entry! app @state*)
    (swap! state* assoc inspect-client/app-uuid-key app-uuid)
    (inspect-client/post-message :fulcro.inspect.client/init-app {inspect-client/app-uuid-key          app-uuid
                                                                  :fulcro.inspect.core/app-id          (inspect-client/app-id app)
                                                                  :fulcro.inspect.client/remotes       (sort-by (juxt #(not= :remote %) str) (keys networking))
                                                                  :fulcro.inspect.client/initial-state @state*})
    (add-watch state* app-uuid #(inspect-client/db-changed! app %3 %4))))

(defn load-remote [app component {:keys [load-remote]}]
  (f.hooks/use-effect
    (fn []
      (if load-remote
        (let [state (rc/get-initial-state component {})
              ident (rc/ident component state)
              query (rc/query component)]
          (df/load! app ident component))))
    [load-remote]))

(defn use-component [app component options]
  (let [props (f.hooks/use-component app component options)]
    (load-remote app component options)
    (vary-meta props assoc :fulcro/app app :fulcro/component component)))

(defn prop-component? [x]
  (and (map? x)
       (some-> x meta :fulcro/component)))

(defn transact!
  ([app-or-component tx] (transact! app-or-component tx {}))
  ([app-or-component tx options]
   (let [options (merge {:initialize?    true
                         :keep-existing? true} options)]
     (if prop-component?
       (let [{:fulcro/keys [app component]} (meta app-or-component)]
         (rc/transact! app tx (coll/merge-defaults options {:ref (rc/ident component app-or-component)})))
       (rc/transact! app-or-component tx options)))))

(ns com.wsscode.fulcro3.raw-support
  (:require
    [com.fulcrologic.fulcro.algorithms.tx-processing :as txn]
    [com.fulcrologic.fulcro.data-fetch :as df]
    [com.fulcrologic.fulcro.inspect.inspect-client :as inspect-client]
    [com.fulcrologic.fulcro.raw.components :as rc]
    [com.fulcrologic.fulcro.react.hooks :as f.hooks]
    [com.wsscode.misc.coll :as coll]
    [edn-query-language.core :as eql]
    [promesa.core :as p]
    [cljs.spec.alpha :as s]))

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
                                          (js/console.error e "Error handler for remote failed with an exception."))))
                      key           (-> ast :children first :key)
                      entity        (some-> ast :children first :query meta :pathom/entity)
                      ident-ent     {key (conj entity key)}]
                  (-> (p/let [res (interface
                                    (cond-> {:pathom/ast ast}
                                      entity (assoc :pathom/entity ident-ent)))]
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

(s/def ::load-remote any?)

(defn load-component! [app component entity-props {::keys [entity-data]}]
  (let [ident (rc/ident component entity-props)]
    (df/load! app ident component
      {:update-query (fn [query]
                       (cond-> query
                         entity-data
                         (vary-meta assoc :pathom/entity entity-data)))})))

(defn load-remote
  [app component entity-props options]
  (let [ident (rc/ident component entity-props)
        load? (some-> entity-props meta ::load-remote)]
    (f.hooks/use-effect
      (fn []
        (if load?
          (load-component! app component entity-props options)))
      [load? (hash ident)])))

(defn use-entity [app entity-props {::keys [query] :as options}]
  (let [options   (merge {:initialize?    true
                          :keep-existing? true} options)
        component (f.hooks/use-memo #(rc/nc query {:initial-state (fn [] entity-props)})
                    [(hash query) (hash entity-props)])
        props     (f.hooks/use-component app component options)]
    (load-remote app component entity-props options)
    (vary-meta props assoc ::fulcro-app app ::fulcro-component component
      ::entity-props entity-props ::entity-options options)))

(defn prop-component? [x]
  (and (map? x)
       (some-> x meta ::fulcro-component)))

(defn refresh! [x]
  (let [{::keys [fulcro-app fulcro-component entity-props entity-options]} (meta x)]
    (load-component! fulcro-app fulcro-component entity-props entity-options)))

(defn transact!
  ([app-or-component tx] (transact! app-or-component tx {}))
  ([app-or-component tx options]
   (if (prop-component? app-or-component)
     (let [{::keys [fulcro-app fulcro-component]} (meta app-or-component)]
       (rc/transact! fulcro-app tx (coll/merge-defaults options {:ref (rc/ident fulcro-component app-or-component)})))
     (rc/transact! app-or-component tx options))))

(defn load [props]
  (vary-meta props assoc ::load-remote true))

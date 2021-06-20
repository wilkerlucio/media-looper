(ns com.wsscode.fulcro-raw.playground
  "Let's do some data playing!"
  (:require
    ["react-dom" :as rdom]
    [com.fulcrologic.fulcro.inspect.websocket-preload]
    [helix.core :as h]
    [helix.dom :as dom]
    [helix.hooks :as hooks]
    [com.fulcrologic.fulcro.mutations :as fm]
    [com.fulcrologic.fulcro.raw.components :as rc]
    [com.fulcrologic.fulcro.raw.application :as rapp]
    [com.wsscode.pathom3.connect.operation :as pco]
    [com.wsscode.pathom3.connect.indexes :as pci]
    [com.wsscode.pathom3.interface.async.eql :as p.a.eql]
    [promesa.core :as p]
    [com.wsscode.fulcro3.raw-support :as frs]))

; region pathom

(defonce counters
  (atom {1 {:counter/count 10}}))

(pco/defresolver counter-data [{:keys [counter/id]}]
  {::pco/output [:counter/count]}
  (get @counters id))

(pco/defmutation server-update-counter! [{:keys [counter/id counter/count] :as counter}]
  {::pco/op-name `update-counter!}
  (swap! counters assoc-in [id :counter/count] count)
  counter)

(def env
  (-> (pci/register
        [counter-data server-update-counter!])))

(def pathom (p.a.eql/boundary-interface env))

(comment
  (p/let [res (pathom [{[:counter/id 1]
                        [:counter/count]}])]
    (js/console.log "!! res" res)))

; endregion

(def app
  (doto (rapp/fulcro-app
          {:batch-notifications (fn [render!] (rdom/unstable_batchedUpdates render!))
           :remotes             {:remote (frs/pathom-remote pathom)}})
    (frs/app-started!)))

(fm/defmutation update-counter! [{:keys [counter/count]}]
  (action [{:keys [state ref]}]
    (swap! state update-in ref assoc :counter/count count))
  (remote [_] true))

(h/defnc Main []
  (let [counter
        (frs/use-entity app
          (frs/load {:counter/id 1 :counter/count 0})
          {::frs/query [:counter/id :counter/count]})]
    (dom/div "Hello World"
      (pr-str counter)
      (dom/button {:on-click #(frs/transact! counter [(update-counter! (update counter :counter/count inc))])} "Inc"))))

(defn ^:dev/after-load render! []
  (rdom/render (h/$ Main) (js/document.getElementById "app")))

(render!)

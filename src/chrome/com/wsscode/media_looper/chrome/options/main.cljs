(ns com.wsscode.media-looper.chrome.options.main
  (:require
    ["react-dom" :as rdom]
    [com.fulcrologic.fulcro.raw.application :as rapp]
    [com.wsscode.media-looper.model :as mlm]
    [com.wsscode.fulcro3.raw-support :as frs]
    [com.wsscode.media-looper.data :as data]
    [com.fulcrologic.fulcro.inspect.preload]
    [helix.core :as h]
    [helix.dom :as dom]
    [helix.hooks :as hooks]))

(def app
  (doto (rapp/fulcro-app
          {:batch-notifications (fn [render!] (rdom/unstable_batchedUpdates render!))
           :remotes             {:remote (frs/pathom-remote data/request)}})
    (frs/app-started!)))

(h/defnc Main []
  (let [data
        (frs/use-entity app
          (frs/load {:component.singleton/id ::app})
          {::frs/query [:component.singleton/id
                        {:media-looper/all-sources
                         [::mlm/storage-id
                          ::mlm/view-url
                          ::mlm/loops-count]}]})]
    (js/console.log "!! data" data)
    (dom/div {:class "container mx-auto"}
      (dom/h1 {:class "text-5xl"} "Youtube Looper Admin")
      (dom/hr {:class "my-4"})
      (dom/h2 {:class "text-3xl"} "Loops")
      (dom/div
        (for [{::mlm/keys [storage-id view-url loops-count]} (:media-looper/all-sources data)]
          (dom/div {:key storage-id}
            (dom/a {:href view-url :target "_blank"} storage-id) ", " loops-count " loops"))))))

(defn ^:dev/after-load render! []
  (rdom/render (h/$ Main) (js/document.getElementById "app")))

(render!)

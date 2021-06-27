(ns com.wsscode.media-looper.data
  (:require [com.wsscode.chrome.storage :as cs]
            [com.wsscode.media-looper.model :as mlm]
            [com.wsscode.media-looper.time :as time]
            [com.wsscode.pathom3.connect.indexes :as pci]
            [com.wsscode.pathom3.connect.operation :as pco]
            [com.wsscode.pathom3.connect.planner :as pcp]
            [com.wsscode.pathom3.interface.async.eql :as p.a.eql]
            [goog.dom :as gdom]
            [promesa.core :as p]
            [com.wsscode.pathom3.connect.built-in.plugins :as pbip]
            [com.wsscode.pathom3.plugin :as p.plugin]))

(defn markers-data []
  (->> (js/document.querySelectorAll ".ytd-macro-markers-list-renderer ytd-macro-markers-list-item-renderer #details")
       (mapv (fn [node]
               {::marker-title (gdom/getTextContent (.querySelector node "h4"))
                ::marker-time  (gdom/getTextContent (.querySelector node "#time"))}))))

(defn markers->loops [markers video-duration]
  (if (seq markers)
    (->> (conj markers {::marker-title "END"
                        ::marker-time  (time/seconds->time video-duration)})
         (partition 2 1)
         (mapv (fn [[a b]]
                 {::mlm/loop-id     (random-uuid)
                  ::mlm/loop-title  (::marker-title a)
                  ::mlm/loop-start  (time/time->seconds (::marker-time a))
                  ::mlm/loop-finish (time/time->seconds (::marker-time b))})))))

(defn async-retry-transform [config]
  (update config ::pco/resolve
    (fn [resolve]
      (fn [env input]
        (p/let [result (resolve env input)]
          (if-not result
            (p/delay 500))
          (or result (resolve env input)))))))

(pco/defresolver loops-from-markers [{::keys [video-duration]}]
  {::pco/output
   [{::markers-loops
     [::mlm/loop-id
      ::mlm/loop-title
      ::mlm/loop-start
      ::mlm/loop-finish]}]

   ::pco/transform
   async-retry-transform}
  (when-let [loops (markers->loops (markers-data) video-duration)]
    {::markers-loops
     loops}))

(pco/defresolver youtube-storage-id [{:keys [youtube.video/id]}]
  {::mlm/storage-id (str "media-looper:youtube:" id)})

(pco/defresolver media-data [{::mlm/keys [storage-id]}]
  {::pco/output
   [{::mlm/loops
     [::mlm/loop-id
      ::mlm/loop-title
      ::mlm/loop-start
      ::mlm/loop-finish]}]}
  (p/let [loops (cs/sync-get storage-id [])]
    {::mlm/loops loops}))

(pco/defmutation server-update-loops [{::mlm/keys [storage-id loops] :as entry}]
  {::pco/op-name 'media-looper/update-loops}
  (p/do!
    (cs/sync-set storage-id loops)
    entry))

(def plan-cache* (atom {}))

(def env
  (-> (pci/register
        [loops-from-markers
         youtube-storage-id media-data server-update-loops])
      (pcp/with-plan-cache plan-cache*)
      (p.plugin/register pbip/mutation-resolve-params)))

(def request (p.a.eql/boundary-interface env))

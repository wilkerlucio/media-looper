(ns com.wsscode.media-looper.data
  (:require [com.wsscode.media-looper.model :as mlm]
            [com.wsscode.media-looper.time :as time]
            [com.wsscode.pathom3.connect.indexes :as pci]
            [com.wsscode.pathom3.connect.operation :as pco]
            [com.wsscode.pathom3.connect.planner :as pcp]
            [com.wsscode.pathom3.interface.eql :as p.eql]
            [com.wsscode.pathom3.interface.async.eql :as p.a.eql]
            [goog.dom :as gdom]
            [promesa.core :as p]))

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
            (p/delay 2000))
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

(def plan-cache* (atom {}))

(def env
  (-> (pci/register
        [loops-from-markers])
      (pcp/with-plan-cache plan-cache*)))

(defn request [data tx]
  (p.a.eql/process env data tx))

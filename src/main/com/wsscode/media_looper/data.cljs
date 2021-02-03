(ns com.wsscode.media-looper.data
  (:require [com.wsscode.media-looper.model :as mlm]
            [com.wsscode.media-looper.time :as time]
            [com.wsscode.pathom3.connect.indexes :as pci]
            [com.wsscode.pathom3.connect.operation :as pco]
            [com.wsscode.pathom3.connect.planner :as pcp]
            [com.wsscode.pathom3.interface.eql :as p.eql]
            [goog.dom :as gdom]))

(pco/defresolver loops-for-source [{::keys [source-id]}]
  [{::pco/output
    [{::mlm/loops
      [::mlm/loop-id
       ::mlm/loop-start
       ::mlm/loop-finish]}]}]
  {})

(defn markers-data []
  (->> (js/document.querySelectorAll ".ytd-macro-markers-list-renderer ytd-macro-markers-list-item-renderer #details")
       (mapv (fn [node]
               {::marker-title (gdom/getTextContent (.querySelector node "h4"))
                ::marker-time  (gdom/getTextContent (.querySelector node "#time"))}))))

(pco/defresolver loops-from-markers [{::keys [video-duration]}]
  {::pco/output
   [{::markers-loops
     [::mlm/loop-id
      ::mlm/loop-title
      ::mlm/loop-start
      ::mlm/loop-finish]}]}
  (let [markers (markers-data)]
    (if (seq markers)
      (let [loops (->> (conj markers {::marker-title "END"
                                      ::marker-time  (time/seconds->time video-duration)})
                       (partition 2 1)
                       (mapv (fn [[a b]]
                               {::mlm/loop-id     (random-uuid)
                                ::mlm/loop-title  (::marker-title a)
                                ::mlm/loop-start  (time/time->seconds (::marker-time a))
                                ::mlm/loop-finish (time/time->seconds (::marker-time b))})))]
        {::markers-loops loops}))))

(def plan-cache* (atom {}))

(def env
  (-> (pci/register
        [loops-for-source
         loops-from-markers])
      (pcp/with-plan-cache plan-cache*)))

(defn request [data tx]
  (p.eql/process env data tx))

(ns com.wsscode.media-looper.chrome.content-script.main
  (:require [com.wsscode.media-looper.integration.youtube :as youtube]
            [com.wsscode.amplitude :as amplitude]
            [clojure.string :as str]
            [goog.object :as gobj]
            [com.wsscode.media-looper.local-storage :as ls]
            [promesa.core :as p]
            [com.wsscode.chrome.storage :as cs]))

(defn migrate! []
  (when-not (ls/get ::migrated-to-sync?)
    (let [item-keys (->> (js/Object.keys js/localStorage)
                         (filter #(str/starts-with? % "\"youtube:")))
          out       (js-obj)]
      (doseq [k item-keys]
        (gobj/set out
          (-> "media-looper:"
              (str (ls/safe-read k))
              pr-str)
          (js/localStorage.getItem k)))

      (cs/sync-set-raw! out))

    (ls/set ::migrated-to-sync? true)))

(defn init []
  (amplitude/init "a252b7def7525ff7a88e3172423510c0")
  (p/do!
    (migrate!)
    (youtube/integrate-looper)))

(init)

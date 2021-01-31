(ns com.wsscode.media-looper.chrome.content-script.main
  (:require [com.wsscode.media-looper.integration.youtube :as youtube]
            ["react-dom" :as rdom]))

(defn init []
  (youtube/integrate-looper))

(init)

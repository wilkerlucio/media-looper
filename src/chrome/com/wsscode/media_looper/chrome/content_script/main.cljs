(ns com.wsscode.media-looper.chrome.content-script.main
  (:require [com.wsscode.media-looper.integration.youtube :as youtube]
            ["react-dom" :as rdom]
            [com.wsscode.amplitude :as amplitude]))

(defn init []
  (amplitude/init "a252b7def7525ff7a88e3172423510c0")
  (youtube/integrate-looper))

(init)

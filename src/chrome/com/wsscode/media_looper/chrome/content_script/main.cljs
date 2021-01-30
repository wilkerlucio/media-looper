(ns com.wsscode.media-looper.chrome.content-script.main
  (:require [com.wsscode.media-looper.integration.youtube :as youtube]
            [helix.core :as h]
            [helix.dom :as dom]
            [goog.dom :as gdom]
            ["react-dom" :as rdom]))

(defn init []
  (youtube/integrate-looper))

(init)

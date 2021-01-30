(ns com.wsscode.media-looper.integration.youtube
  (:require [com.wsscode.dom :as wdom]
            [helix.core :as h]
            [helix.dom :as dom]
            [helix.hooks :as hooks]
            [goog.dom :as gdom]
            [goog.object :as gobj]
            [goog.style :as gstyle]
            ["react-dom" :as rdom]))

(def player-icon
  "data:image/png;base64,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")

(defn $ [sel]
  (js/document.querySelector sel))

(defn video-player-node []
  ($ "video"))

(defn video-controls-node []
  ($ ".ytp-right-controls"))

(defn progress-bar-container-node []
  ($ ".ytp-progress-bar-container"))

(defn video-player-container-node []
  ($ ".html5-video-player"))

(defn add-control [control]
  (gdom/insertChildAt
    (video-controls-node)
    control 0))

(defn create-looper-button [popup]
  (wdom/el "button"
    {:class   "ytp-button"
     :onclick (fn [e]
                (let [display (gobj/getValueByKeys popup "style" "display")]
                  (if (= "none" display)
                    (gstyle/setStyle popup "display" "")
                    (gstyle/setStyle popup "display" "none"))))}
    (wdom/el "img"
      {:src   player-icon
       :style {:height        "20px"
               :margin-bottom "11px"}})))

(h/defnc LooperControl []
  (let [video (hooks/use-memo [] (video-player-node))
        [speed set-speed!] (hooks/use-state 100)]
    (hooks/use-effect [speed]
      (gobj/set video "playbackRate" (/ speed 100)))

    (dom/div {:style {:width "300px"}}

      (dom/div {:style {:display    "flex"
                        :alignItems "center"}}
        (dom/div {:onClick #(set-speed! 100)}
          "Speed")
        (dom/input {:type     "range"
                    :onChange #(set-speed! (js/parseInt (.. % -target -value)))
                    :style    {:margin "0 6px"}
                    :min      10
                    :max      200
                    :value    speed})
        (str speed "%")))))

(defn create-popup-container []
  (let [container (wdom/el "div" {:class "ytp-popup ytp-settings-menu"
                                  :style {:display "none"}})]
    (rdom/render (h/$ LooperControl) container)
    container))

(defn integrate-looper []
  (let [popup (create-popup-container)]
    (gdom/insertChildAt (video-player-container-node) popup)
    (add-control (create-looper-button popup))))

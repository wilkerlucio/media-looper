(ns com.wsscode.media-looper.integration.youtube
  (:require
    ["react-dom" :as rdom]
    [clojure.string :as str]
    [com.fulcrologic.fulcro.mutations :as fm]
    [com.fulcrologic.fulcro.raw.application :as rapp]
    [com.wsscode.amplitude :as amplitude]
    [com.wsscode.dom :as wdom]
    [com.wsscode.fulcro3.raw-support :as frs]
    [com.wsscode.media-looper.data :as data]
    [com.wsscode.media-looper.local-storage :as ls]
    [com.wsscode.media-looper.model :as mlm]
    [com.wsscode.media-looper.time :as time]
    [com.wsscode.media-looper.event.tree :as event-tree]
    [goog.dom :as gdom]
    [goog.events :as gevents]
    [goog.object :as gobj]
    [goog.style :as gstyle]
    [helix.core :as h]
    [helix.dom :as dom]
    [helix.hooks :as hooks]
    [promesa.core :as p]
    [com.wsscode.chrome.storage :as cs]))

(def app
  (doto (rapp/fulcro-app
          {:batch-notifications (fn [render!] (rdom/unstable_batchedUpdates render!))
           :remotes             {:remote (frs/pathom-remote data/request)}})
    (frs/app-started!)))

(defn make-remote [{:keys [ast ref]} name]
  (cond-> (assoc ast :key name :dispatch-key name)
    ref
    (update :params conj ref)))

(fm/defmutation update-loops [{::mlm/keys [loops]}]
  (action [{:keys [state ref]}]
    (swap! state update-in ref assoc ::mlm/loops loops))
  (remote [env]
    (make-remote env 'media-looper/update-loops)))

(defn create-portal [child container]
  (rdom/createPortal child container))

(defn mount [comp container]
  (rdom/render comp container))

(defn unmount [container]
  (rdom/unmountComponentAtNode container))

(deftype ReactFnState [value set-value!]
  IDeref
  (-deref [_] value)

  IFn
  (-invoke [_ x] (set-value! x)))

(defn use-fstate [initial-value]
  (let [[value set-value!] (hooks/use-state initial-value)]
    (->ReactFnState value set-value!)))

(defn use-persistent-state [store-key initial-value]
  (let [[value set-value!] (hooks/use-state (ls/get store-key initial-value))
        set-persistent! (fn [x]
                          (ls/set store-key x)
                          (doto x set-value!))]
    (->ReactFnState value set-persistent!)))

(defn use-event-listener
  ([element event-name handler]
   (let [save-handler* (hooks/use-ref nil)]
     (hooks/use-effect [handler]
       (reset! save-handler* handler))

     (hooks/use-effect [element event-name]
       (let [listener (fn [e]
                        (if-let [f @save-handler*]
                          (f e)))]
         (gevents/listen element event-name listener)
         #(gevents/unlisten element event-name listener))))))

(def player-icon
  "data:image/png;base64,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")

(defn $ [sel]
  (js/document.querySelector sel))

(defn video-id []
  (if-let [[_ vid] (re-find #"watch.+v=([^&]+)" js/location.href)]
    vid))

(defn source-id []
  (str "youtube:" (video-id)))

(defn video-player-node []
  ($ "video"))

(defn video-controls-node []
  ($ ".ytp-right-controls"))

(defn progress-bar-container-node []
  ($ ".ytp-progress-bar-container"))

(defn video-player-container-node []
  ($ ".html5-video-player"))

(defn video-progress-bar-node []
  ($ ".ytp-progress-bar"))

(defn add-control [control]
  (gdom/insertChildAt
    (video-controls-node)
    control 0))

(defn log
  ([event] (log event {}))
  ([event details]
   (amplitude/log event (merge details {:source-id (source-id)}))))

(defn create-progress-bar
  [{::mlm/keys [loop-start loop-finish]} duration]
  (let [offset (-> (/ loop-start duration)
                   (* 100))
        size   (-> (- loop-finish loop-start)
                   (/ duration)
                   (* 100))]
    (wdom/el "div" {:style
                    {:position   "absolute"
                     :height     "3px"
                     :background "#00ff0085"
                     :top        "1px"
                     :z-index    "100"

                     :left       (str offset "%")
                     :width      (str size "%")}})))

(defn create-looper-button [popup]
  (wdom/el "button"
    {:class   "ytp-button"
     :onclick (fn [_]
                (let [display (gobj/getValueByKeys popup "style" "display")]
                  (if (= "none" display)
                    (gstyle/setStyle popup "display" "")
                    (gstyle/setStyle popup "display" "none"))))}
    (wdom/el "img"
      {:src   player-icon
       :style {:height        "20px"
               :margin-bottom "11px"}})))

(defn use-playback-rate-property [video]
  (let [[rate set-rate!] (hooks/use-state
                           (-> (gobj/get video "playbackRate")
                               (* 100)))]
    (hooks/use-effect [rate]
      (gobj/set video "playbackRate" (/ rate 100)))
    [rate set-rate!]))

(defn video-current-time [video]
  (gobj/get video "currentTime"))

(defn video-seek-to! [video time]
  (gobj/set video "currentTime" time))

(defn video-duration [video]
  (gobj/get video "duration"))

(defn icon
  ([ico]
   (icon ico {}))
  ([ico props]
   (let [props (update props :style merge {:cursor    "pointer"
                                           :font-size "18px"
                                           :padding   "0 4px"})]
     (dom/i {:className (str "fa fa-" ico)
             :&         props}))))

(h/defnc SpeedControl [{:keys [video]}]
  (let [[rate set-rate!] (use-playback-rate-property video)]
    (dom/div {:style {:display    "flex"
                      :alignItems "center"
                      :marginTop  "6px"}}
      (dom/div
        (dom/a {:href    "https://www.patreon.com/wsscode"
                :onClick #(log "Click support link")
                :target  "_blank"}
          "Support My Work"))
      (dom/div {:style {:flex "1"}})
      (dom/div {:style {:cursor "pointer"}
                :title "Reset speed to 100%"
                :onClick #(set-rate! 100)} "Speed")
      (icon "minus-circle"
        {:style   {:margin "0 3px"}
         :onClick #(set-rate! (max 10 (- rate (if (.-shiftKey %) 1 10))))})
      (dom/input {:type     "range"
                  :onChange #(set-rate! (js/parseInt (.. % -target -value)))
                  :min      10
                  :max      200
                  :value    rate})
      (icon "plus-circle"
        {:style   {:margin "0 3px"}
         :onClick #(set-rate! (min 200 (+ rate (if (.-shiftKey %) 1 10))))})
      (dom/div {:style {:width "35px"}} (str rate "%")))))

(defn ensure-loop-direction
  [{::mlm/keys [loop-start loop-finish] :as loop}]
  (if (< loop-start loop-finish)
    loop
    (assoc loop
      ::mlm/loop-start loop-finish
      ::mlm/loop-finish loop-start)))

(h/defnc CreateLoop
  [{:keys [video
           on-loop-record-start
           on-loop-record-finish]
    :or   {on-loop-record-start  identity
           on-loop-record-finish identity}}]
  (let [start-time! (use-fstate nil)]
    (dom/div {:style (cond-> {:display    "flex"
                              :alignItems "center"
                              :padding    "4px 0"}
                       @start-time!
                       (assoc :background "#ff000085"))}
      (if @start-time!
        (h/<>
          (icon "stop-circle"
            {:onClick (fn []
                        (let [finish (video-current-time video)]
                          (let [start @start-time!
                                loop  (ensure-loop-direction
                                        {::mlm/loop-start  start
                                         ::mlm/loop-finish finish})]
                            (on-loop-record-finish loop))
                          (start-time! nil)))})
          "Stop recording [" (time/seconds->time @start-time! 3) "]")
        (h/<>
          (icon "plus-circle"
            {:onClick (fn [e]
                        (let [start (video-current-time video)]
                          (start-time! start)
                          (on-loop-record-start {::mlm/loop-start start} e)))})
          "Start new loop")))))

(h/defnc EditableText [{:keys [text label onChange style]}]
  (let [!current-value (use-fstate nil)]
    (if @!current-value
      (dom/input {:value     @!current-value
                  :style     (merge {:fontSize   "11px"
                                     :padding    "1px 2px"
                                     :boxSizing "border-box"
                                     :width      "100%"
                                     :background "transparent"
                                     :border     "none"
                                     :color      "#fff"}
                               style)
                  :autoFocus true
                  :onBlur    #(!current-value nil)
                  :onKeyDown (fn [e]
                               (.stopPropagation e)
                               (let [code (gobj/get e "keyCode")]
                                 (case code
                                   13
                                   (do
                                     (onChange @!current-value)
                                     (!current-value nil))

                                   27
                                   (!current-value nil)

                                   nil)))
                  :onChange  #(!current-value (.. % -target -value))})
      (dom/div {:onClick #(!current-value text)
                :style   {:cursor       "pointer"
                          :textOverflow "ellipsis"}}
        (or label text)))))

(defn dec-fine [x] (- x 0.1))

(defn inc-fine [x] (+ x 0.1))

(defn inject-font-awesome-css []
  (gdom/appendChild
    ($ "head")
    (wdom/el "link"
      {:rel  "stylesheet"
       :href "//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css"})))

(def SHIFT_KEY 16)

(defn use-shift-track []
  (let [!active? (use-fstate false)]
    (use-event-listener js/document.body "keydown"
      (fn [e]
        (if (= (.-keyCode e) SHIFT_KEY)
          (!active? true))))

    (use-event-listener js/document.body "keyup"
      (fn [e]
        (if (= (.-keyCode e) SHIFT_KEY)
          (!active? false))))

    @!active?))

(defn pd [f]
  (fn [^js e]
    (.preventDefault e)
    (f e)))

(h/defnc LoopEntry [{:keys [loop on-set on-update on-delete on-cut on-duplicate current]}]
  (let [{::mlm/keys [loop-title loop-start loop-finish children]} loop
        precise-time? (use-shift-track)
        selected      (= (::mlm/loop-id current)
                         (::mlm/loop-id loop))]
    (h/<>
      (dom/div {:style (cond-> {:display    "flex"
                                :alignItems "center"
                                :padding    "4px 0"}
                         selected
                         (assoc :background "#ff000085"))}
        (icon (if selected
                "stop-circle"
                "play-circle")
          {:onClick #(on-set (if selected nil loop)
                       (if (.-shiftKey %) 3 0))})
        (dom/div {:style {:flex "1"}}
          (if on-update
            (h/$ EditableText {:text     (str loop-title)
                               :onChange (fn [loop-title]
                                           (log "Update loop title"
                                             {:title  loop-title
                                              :start  (time/seconds->time (::mlm/loop-start loop))
                                              :finish (time/seconds->time (::mlm/loop-finish loop))})
                                           (on-update (assoc loop ::mlm/loop-title loop-title)))})
            (dom/div loop-title)))
        (if on-update
          (icon "minus-circle"
            {:onClick #(on-update (update loop ::mlm/loop-start
                                    (if (.-shiftKey %)
                                      dec-fine
                                      dec)))}))
        (if on-update
          (h/$ EditableText {:text     (time/seconds->time loop-start 3)
                             :label    (time/seconds->time loop-start (if precise-time? 3 0))
                             :style    {:width "60px"}
                             :onChange (fn [new-time]
                                         (when-let [time (time/time->seconds new-time)]
                                           (on-update (assoc loop ::mlm/loop-start time))))})
          (dom/div (time/seconds->time loop-start (if precise-time? 3 0))))
        (if on-update
          (icon "plus-circle"
            {:onClick #(on-update (update loop ::mlm/loop-start
                                    (if (.-shiftKey %)
                                      inc-fine
                                      inc)))}))
        (dom/div "/")
        (if on-update
          (icon "minus-circle"
            {:onClick #(on-update (update loop ::mlm/loop-finish
                                    (if (.-shiftKey %)
                                      dec-fine
                                      dec)))}))
        (if on-update
          (h/$ EditableText {:text     (time/seconds->time loop-finish 3)
                             :label    (time/seconds->time loop-finish (if precise-time? 3 0))
                             :style    {:width "60px"}
                             :onChange (fn [new-time]
                                         (when-let [time (time/time->seconds new-time)]
                                           (on-update (assoc loop ::mlm/loop-finish time))))})
          (dom/div (time/seconds->time loop-finish (if precise-time? 3 0))))
        (if on-update
          (icon "plus-circle"
            {:onClick #(on-update (update loop ::mlm/loop-finish
                                    (if (.-shiftKey %)
                                      inc-fine
                                      inc)))}))

        (dom/div {:class "looper-dropdown"}
          (icon "ellipsis-h")
          (dom/div {:class "looper-dropdown-content"}
            (if on-duplicate
              (dom/a {:href     "#"
                      :on-click (pd #(on-duplicate loop))}
                "Duplicate"))
            (if on-cut
              (dom/a {:href     "#"
                      :on-click (pd #(on-cut loop))}
                "Split"))
            (if on-delete
              (dom/a {:href     "#"
                      :on-click (pd #(on-delete loop))}
                "Delete")))))

      (if (seq children)
        (dom/div {:style {:margin-left "13px"}}
          (for [loop children]
            (h/$ LoopEntry {:key          (::mlm/loop-id loop)
                            :current      current
                            :loop         loop
                            :on-set       on-set
                            :on-duplicate on-duplicate
                            :on-cut       on-cut
                            :on-update    on-update
                            :on-delete    on-delete})))))))

(defn use-loop [video loop]
  (let [{::mlm/keys [loop-finish loop-start]} loop
        callback (hooks/use-callback [(hash loop)]
                   (fn [_]
                     (let [time (video-current-time video)]
                       (when (> time loop-finish)
                         (video-seek-to! video loop-start)))))]
    (use-event-listener video "timeupdate" callback)))

(h/defnc ActiveLoop [{:keys [loop video]}]
  (let [duration (video-duration video)
        el       (create-progress-bar loop duration)]
    (hooks/use-effect [(hash loop) duration]
      (gdom/appendChild (video-progress-bar-node)
        el)
      #(gdom/removeNode el))
    (use-loop video loop)
    nil))

(defn same-loop? [l1 l2]
  (= (::mlm/loop-id l1)
     (::mlm/loop-id l2)))

(defn update-media-loops! [media f]
  (frs/transact! media [(update-loops {::mlm/loops (f (::mlm/loops media))})]))

(defn create-loop! [media set-current! loop]
  (log "Create Loop"
    {:start  (time/seconds->time (::mlm/loop-start loop))
     :finish (time/seconds->time (::mlm/loop-finish loop))})

  (let [loop' (assoc loop ::mlm/loop-id (random-uuid)
                          ::mlm/loop-title "New loop")]
    (update-media-loops! media #(conj % loop'))
    (set-current! loop')))

(defn duplicate-loop! [media loop]
  (let [new-loop (assoc loop ::mlm/loop-id (random-uuid))]
    (update-media-loops! media #(conj % new-loop))))

(defn cut-loop! [media loop cut-at]
  (if (and (> cut-at (::mlm/loop-start loop))
           (< cut-at (::mlm/loop-finish loop)))
    (let [left  (assoc loop ::mlm/loop-finish cut-at)
          right (assoc loop ::mlm/loop-start cut-at ::mlm/loop-id (random-uuid))]
      (update-media-loops! media
        (fn [loops]
          (-> (remove #(same-loop? % loop) loops)
              (conj left right)))))
    (js/console.log "!! Invalid cut")))

(defn update-loop! [media !current updated-loop]
  (let [updated-loop (ensure-loop-direction updated-loop)]
    (update-media-loops! media
      #(into []
             (map
               (fn [loop]
                 (if (same-loop? loop updated-loop)
                   updated-loop
                   loop)))
             %))
    (if (and @!current
             (same-loop? @!current updated-loop))
      (!current updated-loop))))

(defn remove-loop! [media !current loop]
  (log "Remove Loop" {:title (::mlm/loop-title loop)})
  (update-media-loops! media
    (fn [loops] (into []
                      (remove #(same-loop? % loop))
                      loops)))
  (if (and @!current
           (same-loop? @!current loop))
    (!current nil)))

(defn set-current! [!current video loop offset]
  (!current loop)
  (when-let [start (::mlm/loop-start loop)]
    (video-seek-to! video (- start (or offset 0)))))

(defn toggle-loop! [set-current! loop offset]
  (if loop
    (log "Start Loop" {:title  (::mlm/loop-title loop)
                       :start  (time/seconds->time (::mlm/loop-start loop))
                       :finish (time/seconds->time (::mlm/loop-finish loop))})
    (log "Stop Loop"))

  (set-current! loop offset))

(defn export-loops [media]
  (let [content  (pr-str media)
        filename (str (:youtube.video/id media) "-loops.edn")
        blob     (js/Blob. #js [content] #js {:type "text/plain"})
        ^js link (js/document.createElement "a")]
    (.setAttribute link "download" filename)
    (.setAttribute link "href" (js/window.URL.createObjectURL blob))
    (.click link)
    nil))

(defn pick-file []
  (p/create
    (fn [resolve reject]
      (let [^js input (js/document.createElement "input")]
        (gobj/set input "type" "file")
        (gobj/set input "accept" ".edn")
        (gobj/set input "onchange"
          (fn [^js e]
            (resolve (-> e .-target .-files (aget 0)))))
        (.click input)))))

(defn read-text [file]
  (p/create
    (fn [resolve reject]
      (let [reader (js/FileReader.)]
        (gobj/set reader "onload"
          (fn [^js e]
            (resolve (-> e .-target .-result))))
        (.readAsText reader file "UTF-8")))))

(defn import-loops [media]
  (p/let [file (pick-file)
          s    (read-text file)
          {::mlm/keys [loops]} (ls/safe-read s)]
    (update-media-loops! media (fn [_] loops))))

(defn use-storage-change-listener [f]
  (hooks/use-effect [f]
    (cs/change-listener f)
    #(cs/remove-listener f)))

(h/defnc LooperControl [{:keys [props]}]
  (let [video                 (hooks/use-memo [] (video-player-node))
        {::mlm/keys [loops] ::data/keys [markers-loops] :as media}
        (frs/use-entity app
          (assoc props ::mlm/loops [])
          {::frs/query       [:youtube.video/id
                              {::mlm/loops
                               [::mlm/loop-id
                                ::mlm/loop-title
                                ::mlm/loop-start
                                ::mlm/loop-finish]}
                              {::data/markers-loops
                               [::mlm/loop-id
                                ::mlm/loop-title
                                ::mlm/loop-start
                                ::mlm/loop-finish]}]
           ::frs/entity-data {::data/video-duration (video-duration (video-player-node))}})
        !current              (use-fstate nil)
        set-current!          (hooks/use-callback [video] #(set-current! !current video % %2))
        set-current-with-log! (hooks/use-callback [set-current!] #(toggle-loop! set-current! % %2))
        duplicate-loop!       (hooks/use-callback [(hash loops)] #(duplicate-loop! media %))
        cut-loop!             (hooks/use-callback [(hash loops)] #(cut-loop! media % (video-current-time (video-player-node))))
        update-loop!          (hooks/use-callback [(hash loops)] #(update-loop! media !current %))
        remove-loop!          (hooks/use-callback [(hash loops)] #(remove-loop! media !current %))
        create-loop!          (hooks/use-callback [(hash loops)] #(create-loop! media set-current! %))]
    (dom/div {:style {:width          "500px"
                      :height         "100%"
                      :box-sizing     "border-box"
                      :display        "flex"
                      :flex-direction "column"
                      :padding        "10px"}}
      (if @!current
        (h/$ ActiveLoop {:video video
                         :loop  @!current}))
      (h/$ CreateLoop {:video                 video
                       :on-loop-record-start  #(set-current! nil)
                       :on-loop-record-finish create-loop!})

      (dom/div {:style {:flex     "1"
                        :overflow "auto"}}
        (for [loop (event-tree/loop-tree loops)]
          (h/$ LoopEntry {:key          (::mlm/loop-id loop)
                          :current      @!current
                          :loop         loop
                          :on-set       set-current-with-log!
                          :on-duplicate duplicate-loop!
                          :on-cut       cut-loop!
                          :on-update    update-loop!
                          :on-delete    remove-loop!}))
        (for [loop (event-tree/loop-tree markers-loops)]
          (h/$ LoopEntry {:key          (::mlm/loop-id loop)
                          :current      @!current
                          :loop         loop
                          :on-set       set-current-with-log!
                          :on-duplicate duplicate-loop!
                          :on-cut       cut-loop!})))

      (dom/div {:style {:display "flex" :margin "3px 0"}}
        (dom/div {:style {:flex "1"}})
        (dom/div
          {:on-click #(import-loops media)}
          "Import loops")
        (dom/div
          {:style    {:margin-left "10px"}
           :on-click #(export-loops media)}
          "Export loops"))
      (h/$ SpeedControl {:video video}))))

(h/defnc LooperWrapper []
  (h/$ LooperControl {:props (frs/load {:youtube.video/id (video-id)})}))

(defn listen-url-changes [cb]
  (let [url*  (atom nil)
        timer (js/setInterval
                (fn []
                  (let [new-url js/location.href]
                    (when (not= new-url @url*)
                      (cb new-url)
                      (reset! url* new-url))))
                500)]
    #(js/clearInterval timer)))

(defn create-popup-container []
  (wdom/el "div" {:class "ytp-popup ytp-settings-menu"
                  :style {:display  "none"
                          :height   "calc(100% - 64px)"
                          :overflow "hidden"}}))

(h/defnc YoutubeLooper []
  (let [popup   (hooks/use-memo [] (create-popup-container))
        control (hooks/use-memo [] (create-looper-button popup))]
    (hooks/use-effect []
      (gdom/insertChildAt (video-player-container-node) popup)
      #(gdom/removeNode popup))

    (hooks/use-effect []
      (add-control control)
      #(gdom/removeNode control))

    (create-portal #js [(h/$ LooperWrapper)] popup)))

(defn integrate-looper []
  (inject-font-awesome-css)

  (let [app-node (wdom/el "div" {:class "media-looper-container"})]
    (gdom/appendChild js/document.body app-node)
    (listen-url-changes
      (fn [_]
        (unmount app-node)

        (when (video-id)
          (mount (h/$ YoutubeLooper) app-node))))))

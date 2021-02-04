(ns com.wsscode.media-looper.time)

(defn seconds->time
  ([seconds] (seconds->time seconds 0))
  ([seconds precision]
   (let [minutes (->> (/ seconds 60)
                      (.floor js/Math))
         seconds (mod seconds 60)]
     (if (> precision 0)
       (goog.string/format (str "%02d:%0" (+ 3 precision) "." precision "f") minutes seconds)
       (goog.string/format "%02d:%02d" minutes seconds)))))

(defn time->seconds [time]
  (let [[_ hours minutes seconds] (re-find #"^(?:(\d{1,2}):)?(\d{1,2}):(\d{1,2}(?:\.\d+)?)$" time)]
    (+
      (if hours (* (js/parseInt hours) 3600) 0)
      (* (js/parseInt minutes) 60)
      (js/parseFloat seconds))))

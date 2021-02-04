(ns com.wsscode.media-looper.time)

#_(defn seconds->time
    ([seconds] (seconds->time seconds 0))
    ([seconds precision]
     (let [minutes (->> (/ seconds 60)
                        (.floor js/Math))
           seconds (mod seconds 60)]
       (if (> precision 0)
         (goog.string/format (str "%02d:%0" (+ 3 precision) "." precision "f") minutes seconds)
         (goog.string/format "%02d:%02d" minutes seconds)))))

(defn zero-nan [x]
  (if (js/isNaN x)
    0
    x))

(defn seconds->time
  ([seconds] (seconds->time seconds 0))
  ([seconds precision]
   (let [hours   (->> (/ seconds 3600)
                      zero-nan
                      (.floor js/Math))
         minutes (->> (/ seconds 60)
                      (.floor js/Math))
         minutes (cond-> minutes
                   (pos? minutes)
                   (mod 60))
         seconds (mod seconds 60)]
     (cond-> ""
       ; hours
       (pos? hours)
       (str (goog.string/format "%02d:" hours))

       ; minutes
       true
       (str (goog.string/format (str "%02d:") minutes))

       ; precise seconds
       (pos? precision)
       (str (goog.string/format (str "%0" (+ 3 precision) "." precision "f") seconds))

       ; round seconds
       (zero? precision)
       (str (goog.string/format "%02d" seconds))))))

(defn time->seconds [time]
  (when-let [[_ hours minutes seconds] (re-find #"^(?:(\d{1,2}):)?(\d{1,2}):(\d{1,2}(?:\.\d+)?)$" time)]
    (+
      (if hours (* (js/parseInt hours) 3600) 0)
      (* (js/parseInt minutes) 60)
      (js/parseFloat seconds))))

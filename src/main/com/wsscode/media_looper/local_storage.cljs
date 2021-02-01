(ns com.wsscode.media-looper.local-storage
  (:refer-clojure :exclude [get set])
  (:require [cljs.reader :refer [read-string]]))

(defn safe-read [s]
  (try
    (read-string s)
    (catch :default _ nil)))

(defn get
  ([k]
   (safe-read (js/localStorage.getItem (pr-str k))))
  ([k initial]
   (or (safe-read (js/localStorage.getItem (pr-str k)))
       initial)))

(defn set [k v]
  (js/localStorage.setItem (pr-str k) (pr-str v)))

(ns com.wsscode.chrome.storage
  (:refer-clojure :exclude [get set])
  (:require [cljs.reader :refer [read-string]]
            [goog.object :as gobj]
            [promesa.core :as p]))

(defn safe-read [s]
  (try
    (read-string s)
    (catch :default _ nil)))

(defn sync-get
  [k initial]
  (p/create
    (fn [resolve reject]
      (js/chrome.storage.sync.get (pr-str k)
        (fn [items]
          (if-let [err js/chrome.runtime.lastError]
            (reject err)
            (let [response (or (-> items (gobj/get (pr-str k)) (safe-read)) initial)]
              (resolve response))))))))

(defn sync-set-raw! [js-obj]
  (p/create
    (fn [resolve reject]
      (js/chrome.storage.sync.set js-obj
        (fn []
          (if-let [err js/chrome.runtime.lastError]
            (reject err)
            (resolve true)))))))

(defn sync-set [k v]
  (sync-set-raw! (js-obj (pr-str k) (pr-str v))))

(defn change-listener [f]
  (js/chrome.storage.sync.onChanged.addListener f))

(defn remove-listener [f]
  (js/chrome.storage.sync.onChanged.removeListener f))

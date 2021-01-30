(ns com.wsscode.dom
  (:require
    [goog.dom :as gdom]
    [goog.style :as gstyle]))

(defn el [tag props & children]
  (let [el (js/document.createElement tag)]
    (gdom/setProperties el (clj->js (dissoc props :style)))
    (doseq [[k v] (:style props)]
      (gstyle/setStyle el (name k) v))
    (doseq [child children]
      (gdom/appendChild el child))
    el))

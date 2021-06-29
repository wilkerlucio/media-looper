(ns com.wsscode.media-looper.event.tree
  (:require [com.wsscode.media-looper.model :as mlm]))

(defn iterate-break [[{::mlm/keys [loop-finish] :as first} & rest]]
  (if first
    (let [[children others] (split-with #(<= (- (::mlm/loop-finish %) 0.001) loop-finish) rest)]
      (into
        [(cond-> first
           (seq children)
           (assoc ::mlm/children (iterate-break children)))]
        (iterate-break others)))
    []))

(defn loop-tree
  [loops]
  (->> loops
       (sort-by (juxt ::mlm/loop-start (comp #(* -1 %) ::mlm/loop-finish)))
       iterate-break))

(defn l [s f]
  {::mlm/loop-start  s
   ::mlm/loop-finish f})

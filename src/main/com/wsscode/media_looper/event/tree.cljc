(ns com.wsscode.media-looper.event.tree
  (:require [com.wsscode.media-looper.model :as mlm]))

(defn iterate-break [[{::mlm/keys [loop-finish] :as first} & rest]]
  (if first
    (let [[children others] (split-with #(<= (::mlm/loop-finish %) loop-finish) rest)]
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

(comment

  (sort-by (juxt ::mlm/loop-start (comp #(* -1 %) ::mlm/loop-finish))
    [(l 1 2)
     (l 1 3)
     (l 2 4)])

  (loop-tree
    [{:com.wsscode.media-looper.model/loop-id #uuid "cfe1d132-9977-4b8b-9493-f3760e3aed53", :com.wsscode.media-looper.model/loop-title "Intro 1/2", :com.wsscode.media-looper.model/loop-start 279.954931, :com.wsscode.media-looper.model/loop-finish 293.029286} {:com.wsscode.media-looper.model/loop-id #uuid "110aa4b8-c97c-412c-bbcd-c880ad2e524e", :com.wsscode.media-looper.model/loop-title "Intro 2/2", :com.wsscode.media-looper.model/loop-start 392.957844, :com.wsscode.media-looper.model/loop-finish 406.123377} {:com.wsscode.media-looper.model/loop-id #uuid "76e324be-45ed-40a0-b923-0bbb91739e83", :com.wsscode.media-looper.model/loop-title "Intro", :com.wsscode.media-looper.model/loop-start 233.534814, :com.wsscode.media-looper.model/loop-finish 246.421785} {:com.wsscode.media-looper.model/loop-id #uuid "8f44ccc3-5ac0-4981-afbc-209a0e61e4f5", :com.wsscode.media-looper.model/loop-title "Primeira parte tabs", :com.wsscode.media-looper.model/loop-start 478.008836, :com.wsscode.media-looper.model/loop-finish 526.152738} {:com.wsscode.media-looper.model/loop-id #uuid "fdc142c4-4c5e-491e-9a8e-21d6505d3a2e", :com.wsscode.media-looper.model/loop-title "Primeira parte", :com.wsscode.media-looper.model/loop-start 447.539325, :com.wsscode.media-looper.model/loop-finish 473.791614} {:com.wsscode.media-looper.model/loop-id #uuid "8b03ce60-aea0-402e-8522-abf7a48b109d", :com.wsscode.media-looper.model/loop-title "Segunda Parte", :com.wsscode.media-looper.model/loop-start 656.688495, :com.wsscode.media-looper.model/loop-finish 682.915161} {:com.wsscode.media-looper.model/loop-id #uuid "b7b9bbd0-4810-4847-bc1f-22dca7b04fcf", :com.wsscode.media-looper.model/loop-title "Segunda parte tabs", :com.wsscode.media-looper.model/loop-start 686.479066, :com.wsscode.media-looper.model/loop-finish 733.077305} {:com.wsscode.media-looper.model/loop-id #uuid "b80ffb65-cdee-4260-b99f-f9f61df91db9", :com.wsscode.media-looper.model/loop-title "Am6 -> A", :com.wsscode.media-looper.model/loop-start 704.169195, :com.wsscode.media-looper.model/loop-finish 709.2191699999998} {:com.wsscode.media-looper.model/loop-id #uuid "e2d4def5-c723-4807-aab9-78f6c22f3c9a", :com.wsscode.media-looper.model/loop-title "Terceira parte tabs", :com.wsscode.media-looper.model/loop-start 997.646315, :com.wsscode.media-looper.model/loop-finish 1044.499928} {:com.wsscode.media-looper.model/loop-id #uuid "01a7bc4a-ae95-4383-b914-afca1fba0acd", :com.wsscode.media-looper.model/loop-title "Terceira parte", :com.wsscode.media-looper.model/loop-start 966.659068, :com.wsscode.media-looper.model/loop-finish 993.0151799999999} {:com.wsscode.media-looper.model/loop-id #uuid "6afef9bf-8c3e-41d4-9fea-dea4f176cb6e", :com.wsscode.media-looper.model/loop-title "Musica Inteira", :com.wsscode.media-looper.model/loop-start 4.833714, :com.wsscode.media-looper.model/loop-finish 138.40545} {:com.wsscode.media-looper.model/loop-id #uuid "db1e786f-c74a-48a7-86d1-033d3de47539", :com.wsscode.media-looper.model/loop-title "Terceira parte tabs 1/4", :com.wsscode.media-looper.model/loop-start 997.646315, :com.wsscode.media-looper.model/loop-finish 1009.37304} {:com.wsscode.media-looper.model/loop-id #uuid "c312e8d6-a01a-4ffc-a0c2-450bcb58c029", :com.wsscode.media-looper.model/loop-title "Intro Completa", :com.wsscode.media-looper.model/loop-start 279.954, :com.wsscode.media-looper.model/loop-finish 406.123}])

  (loop-tree
    [(l 1 3)
     (l 1 2)
     (l 2 4)])

  (loop-tree
    [(l 1 10)
     (l 1 8)
     (l 2 4)])

  (loop-tree
    [{:com.wsscode.media-looper.model/loop-id #uuid "cfe1d132-9977-4b8b-9493-f3760e3aed53", :com.wsscode.media-looper.model/loop-title "Intro 1/2", :com.wsscode.media-looper.model/loop-start 279.954931, :com.wsscode.media-looper.model/loop-finish 293.029286} {:com.wsscode.media-looper.model/loop-id #uuid "110aa4b8-c97c-412c-bbcd-c880ad2e524e", :com.wsscode.media-looper.model/loop-title "Intro 2/2", :com.wsscode.media-looper.model/loop-start 392.957844, :com.wsscode.media-looper.model/loop-finish 406.123377} {:com.wsscode.media-looper.model/loop-id #uuid "76e324be-45ed-40a0-b923-0bbb91739e83", :com.wsscode.media-looper.model/loop-title "Intro", :com.wsscode.media-looper.model/loop-start 233.534814, :com.wsscode.media-looper.model/loop-finish 246.421785} {:com.wsscode.media-looper.model/loop-id #uuid "8f44ccc3-5ac0-4981-afbc-209a0e61e4f5", :com.wsscode.media-looper.model/loop-title "Primeira parte tabs", :com.wsscode.media-looper.model/loop-start 478.008836, :com.wsscode.media-looper.model/loop-finish 526.152738} {:com.wsscode.media-looper.model/loop-id #uuid "fdc142c4-4c5e-491e-9a8e-21d6505d3a2e", :com.wsscode.media-looper.model/loop-title "Primeira parte", :com.wsscode.media-looper.model/loop-start 447.539325, :com.wsscode.media-looper.model/loop-finish 473.791614} {:com.wsscode.media-looper.model/loop-id #uuid "8b03ce60-aea0-402e-8522-abf7a48b109d", :com.wsscode.media-looper.model/loop-title "Segunda Parte", :com.wsscode.media-looper.model/loop-start 656.688495, :com.wsscode.media-looper.model/loop-finish 682.915161} {:com.wsscode.media-looper.model/loop-id #uuid "b7b9bbd0-4810-4847-bc1f-22dca7b04fcf", :com.wsscode.media-looper.model/loop-title "Segunda parte tabs", :com.wsscode.media-looper.model/loop-start 686.479066, :com.wsscode.media-looper.model/loop-finish 733.077305} {:com.wsscode.media-looper.model/loop-id #uuid "b80ffb65-cdee-4260-b99f-f9f61df91db9", :com.wsscode.media-looper.model/loop-title "Am6 -> A", :com.wsscode.media-looper.model/loop-start 704.169195, :com.wsscode.media-looper.model/loop-finish 709.2191699999998} {:com.wsscode.media-looper.model/loop-id #uuid "e2d4def5-c723-4807-aab9-78f6c22f3c9a", :com.wsscode.media-looper.model/loop-title "Terceira parte tabs", :com.wsscode.media-looper.model/loop-start 997.646315, :com.wsscode.media-looper.model/loop-finish 1044.499928} {:com.wsscode.media-looper.model/loop-id #uuid "01a7bc4a-ae95-4383-b914-afca1fba0acd", :com.wsscode.media-looper.model/loop-title "Terceira parte", :com.wsscode.media-looper.model/loop-start 966.659068, :com.wsscode.media-looper.model/loop-finish 993.0151799999999} {:com.wsscode.media-looper.model/loop-id #uuid "6afef9bf-8c3e-41d4-9fea-dea4f176cb6e", :com.wsscode.media-looper.model/loop-title "Musica Inteira", :com.wsscode.media-looper.model/loop-start 4.833714, :com.wsscode.media-looper.model/loop-finish 138.40545} {:com.wsscode.media-looper.model/loop-id #uuid "db1e786f-c74a-48a7-86d1-033d3de47539", :com.wsscode.media-looper.model/loop-title "Terceira parte tabs 1/4", :com.wsscode.media-looper.model/loop-start 997.646315, :com.wsscode.media-looper.model/loop-finish 1009.37304} {:com.wsscode.media-looper.model/loop-id #uuid "c312e8d6-a01a-4ffc-a0c2-450bcb58c029", :com.wsscode.media-looper.model/loop-title "Intro Completa", :com.wsscode.media-looper.model/loop-start 279.954, :com.wsscode.media-looper.model/loop-finish 406.123}]))

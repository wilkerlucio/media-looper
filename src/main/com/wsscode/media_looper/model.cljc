(ns com.wsscode.media-looper.model
  (:require [com.fulcrologic.guardrails.core :refer [<- => >def >defn >fdef ? |]]
            [clojure.spec.alpha :as s]))

(>def ::time-unit "Unit of time, in seconds."
  (s/and number? pos?))

(>def ::loop-id uuid?)
(>def ::loop-title string?)

(>def ::loop-start ::time-unit)
(>def ::loop-finish ::time-unit)

(>def ::loops (s/coll-of (s/keys)))

(>def ::storage-id string?)


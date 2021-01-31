(ns com.wsscode.media-looper.model
  (:require [com.fulcrologic.guardrails.core :refer [<- => >def >defn >fdef ? |]]
            [clojure.spec.alpha :as s]))

(>def ::time-unit "Unit of time, in seconds."
  (s/and number? pos?))

(>def ::loop-start ::time-unit)
(>def ::loop-finish ::time-unit)


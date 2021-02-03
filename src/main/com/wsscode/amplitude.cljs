(ns com.wsscode.amplitude
  (:require
    ["amplitude-js" :as amplitude]
    [clojure.walk :as walk]
    [com.fulcrologic.guardrails.core :refer [<- => >def >defn >fdef ? |]]))

(>def ::amplitude "Amplitude instance" any?)
(>def ::api-key string?)
(>def ::user-id string?)
(>def ::user-props map?)
(>def ::event-type string?)
(>def ::event-props map?)

(defn- stringify-uuids [x]
  (walk/postwalk
    (fn [x]
      (if (uuid? x) (str x) x))
    x))

(defn- to-amplitude-props [props]
  (-> props stringify-uuids clj->js))

(>defn ^js instance [] [=> ::amplitude] (.getInstance amplitude))

(>defn init [api-key]
  [::api-key => any?]
  ;; Must use api2.amplitude.com as per advisory regarding data collection in China.
  ;; See https://roamresearch.com/#/app/roam/page/2VnqybjxR for details.
  (.init (instance) api-key js/undefined #js {:apiEndpoint "api2.amplitude.com"}))

(>defn set-user-id
  [user-id]
  [::user-id => any?]
  (.setUserId (instance) user-id))

(>defn set-user-properties
  [user-properties]
  [::user-props => any?]
  (.setUserProperties (instance) (to-amplitude-props user-properties)))

(>defn log
  ([event-type]
   [::event-type => any?]
   (.logEvent (instance) event-type))
  ([event-type event-props]
   [::event-type ::event-props => any?]
   (.logEvent (instance) event-type (to-amplitude-props event-props))))

(>defn log-error
  "Log a message to amplitude with the error, also reports the error in the browser
  console."
  [event-type error props]
  [::event-type any? (? map?)
   => any?]
  (log event-type (assoc props :error error))
  (js/console.error event-type error props))


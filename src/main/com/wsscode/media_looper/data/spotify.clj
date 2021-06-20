(ns com.wsscode.media-looper.data.spotify
  (:require [com.wsscode.pathom3.connect.operation :as pco]
            [org.httpkit.client :as client]
            [cheshire.core :as json]
            [com.wsscode.misc.coll :as coll]
            [com.wsscode.pathom3.connect.indexes :as pci]
            [com.wsscode.pathom3.interface.eql :as p.eql]
            [com.wsscode.pathom3.connect.built-in.plugins :as pbip]
            [com.wsscode.pathom3.plugin :as p.plugin]))

; https://open.spotify.com/track/2Y7qAoJ2TFy8rj2QK0eVLn?si=66fcb748864d44a7

(defn fill-request [env request]
  (assoc-in request
    [:headers "Authorization"] (str "Bearer " (:spotify.auth/token env))))

(defn request [env request]
  (-> @(client/request (fill-request env request))
      :body
      (json/parse-string keyword)))

(pco/defresolver track-audio-features [env {:keys [spotify.track/id]}]
  {::pco/output
   [:spotify.audio-features/acousticness
    :spotify.audio-features/analysis_url
    :spotify.audio-features/danceability
    :spotify.audio-features/duration_m
    :spotify.audio-features/energy
    :spotify.audio-features/instrumentalness
    :spotify.audio-features/key
    :spotify.audio-features/liveness
    :spotify.audio-features/loudness
    :spotify.audio-features/mode
    :spotify.audio-features/speechiness
    :spotify.audio-features/tempo
    :spotify.audio-features/time_signature
    :spotify.audio-features/track_href
    :spotify.audio-features/type
    :spotify.audio-features/uri
    :spotify.audio-features/valence]}
  (-> (request env
        {:method :get
         :url    (str "https://api.spotify.com/v1/audio-features?ids=" id)})
      :audio_features
      first
      (dissoc :id)
      (->> (coll/map-keys #(keyword "spotify.audio-features" (name %))))))

(pco/defresolver search [env {:keys [spotify.search/query]}]
  {::pco/output
   [:spotify.audio-features/acousticness
    :spotify.audio-features/analysis_url
    :spotify.audio-features/danceability
    :spotify.audio-features/duration_m
    :spotify.audio-features/energy
    :spotify.audio-features/instrumentalness
    :spotify.audio-features/key
    :spotify.audio-features/liveness
    :spotify.audio-features/loudness
    :spotify.audio-features/mode
    :spotify.audio-features/speechiness
    :spotify.audio-features/tempo
    :spotify.audio-features/time_signature
    :spotify.audio-features/track_href
    :spotify.audio-features/type
    :spotify.audio-features/uri
    :spotify.audio-features/valence]}
  (-> (request env
        {:method       :get
         :url          (str "https://api.spotify.com/v1/search")
         :query-params {"q"    query
                        "type" "track"}})
      :audio_features
      first
      (->> (coll/map-keys #(keyword "spotify.audio-features" (name %))))))

(def env
  (-> {:spotify.auth/token "BQAz3i9zeYbmD7A73ZofY6vB6ZwnGBfna2zJswoCqJ8JAF1axqDWnwDw56jrxuTs2dtM2B7qqwcgzksSmlY"}
      (pci/register track-audio-features)
      (p.plugin/register (pbip/attribute-errors-plugin))))

(comment
  (-> (request env
        {:method       :get
         :url          (str "https://api.spotify.com/v1/search")
         :query-params {"q"    "chega de saudade"
                        "type" "track"}}))



  (p.eql/process env
    {:spotify.track/id "2Y7qAoJ2TFy8rj2QK0eVLn"}
    [:spotify.audio-features/tempo])

  (p.eql/process env
    {:spotify.track/id "7HOqSh3apbrDHwEizL8H71"}
    [:spotify.audio-features/tempo
     '*])
  )

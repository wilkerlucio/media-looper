(ns com.wsscode.media-looper.data.graph
  (:require
    [com.wsscode.chrome.storage :as cs]
    [com.wsscode.media-looper.model :as mlm]
    [com.wsscode.pathom3.connect.built-in.plugins :as pbip]
    [com.wsscode.pathom3.connect.indexes :as pci]
    [com.wsscode.pathom3.connect.operation :as pco]
    [com.wsscode.pathom3.interface.async.eql :as p.a.eql]
    [com.wsscode.pathom3.plugin :as p.plugin]
    [promesa.core :as p]))

(pco/defresolver youtube-storage-id [{:keys [youtube.video/id]}]
  {::mlm/storage-id (str "media-looper:youtube:" id)})

#_(pco/defresolver media-data [{::mlm/keys [storage-id]}]
    {::pco/output [{::mlm/loops
                    [::mlm/loop-id
                     ::mlm/loop-title
                     ::mlm/loop-start
                     ::mlm/loop-finish]}]}
    (js/console.log "!! GET FROM" storage-id)
    {::mlm/loops (ls/get storage-id [])})

(pco/defresolver media-data [{::mlm/keys [storage-id]}]
  {::pco/output [{::mlm/loops
                  [::mlm/loop-id
                   ::mlm/loop-title
                   ::mlm/loop-start
                   ::mlm/loop-finish]}]}
  (js/console.log "!! GET " storage-id)
  (p/let [loops (cs/sync-get storage-id [])]
    (js/console.log "!! READ" loops)
    {::mlm/loops loops}))

#_(pco/defmutation server-update-loops [{::mlm/keys [storage-id loops] :as entry}]
    {::pco/op-name 'media-looper/update-loops}
    (ls/set storage-id loops)
    entry)

(pco/defmutation server-update-loops [{::mlm/keys [storage-id loops] :as entry}]
  {::pco/op-name 'media-looper/update-loops}
  (js/console.log "!! SAVE SYNC")
  (p/do!
    (cs/sync-set storage-id loops)
    (js/console.log "!! save done")
    entry))

(defonce plan-cache* (atom {}))

(def env
  (-> {:com.wsscode.pathom3.connect.planner/plan-cache* plan-cache*}
      (pci/register
        [youtube-storage-id media-data server-update-loops])
      (p.plugin/register pbip/mutation-resolve-params)))

(def graph (p.a.eql/boundary-interface env))

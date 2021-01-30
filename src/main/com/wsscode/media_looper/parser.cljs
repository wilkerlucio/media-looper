(ns com.wsscode.media-looper.parser
  (:require [com.wsscode.pathom3.connect.operation :as pco]
            [com.wsscode.pathom3.connect.indexes :as pci]
            [com.wsscode.pathom3.connect.planner :as pcp]))

(pco/defresolver loops-for-source [{::keys [source-id]}]
  [{::pco/output
    [{::loops
      [::loop-id
       ::loop-start
       ::loop-finish]}]}]
  {})

(def plan-cache* (atom {}))

(def env
  (-> (pci/register
        [loops-for-source])
      (pcp/with-plan-cache plan-cache*)))

(ns client.main.index
  (:require [client.main.side-menu :as side-menu]))

(defn init []
  (let [worker (js/Worker. "/js/worker.js")]
    (.addEventListener worker  "message" (fn [e] (js/console.log e)))
    (.postMessage worker "hello-world"))
  (side-menu/init))

(defn ^:dev/after-load reload []
  (init))

(defn ^:export main []
  (init))



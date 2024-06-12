(ns client.shared.worker)

#_
(def worker (js/Worker. "/js/worker.js"))

(defn init []
  (js/self.addEventListener
   "message"
   (fn [^js e]
     (js/postMessage (.-data e))))
  (js/self.addEventListener
   "error"
   (fn [^js e]
     (js/console.warn "worker threw an error" (.-error e)))))

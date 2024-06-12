(ns client.main.side-menu
  (:require [dommy.core :refer-macros [sel sel1] :as dommy]
            [goog.events :as events]))

(defn hide-sidedrawer []
  (let [sideDrawer (sel1 :#sidedrawer)]
    (.appendChild js/document.body sideDrawer)
    (js/requestAnimationFrame
     (fn [_]
       (dommy/remove-class! sideDrawer "active")
       (js/setTimeout
        (fn []
          (dommy/toggle-class! js/document.body "hide-sidedrawer")
          (when (sel1 :#mui-overlay)
            (js/mui.overlay "off"))) 200)))))

(defn show-sidedrawer []
  (let [sideDrawer (sel1 :#sidedrawer)
        options (clj->js {:static true})
        overlay (js/mui.overlay "on" options)]
    (.appendChild overlay sideDrawer)
    (js/setTimeout #(dommy/add-class! sideDrawer "active") 200)
    (.addEventListener overlay "click" hide-sidedrawer)))

(defn toggle-sidedrawer []
  (dommy/toggle-class! js/document.body "hide-sidedrawer")
  (.post-message (js/Worker. "/js/worker.js") {:type "viewportChanged"}))

(defn init []
  (.addEventListener
   js/document "DOMContentLoaded"
   (fn []
     (.addEventListener (sel1 :.js-show-sidedrawer) "click" show-sidedrawer)
     (.addEventListener (sel1 :.js-hide-sidedrawer) "click" toggle-sidedrawer)
     (.addEventListener (sel1 :#pokemon-link) "click"
                        (fn [e]
                          (.preventDefault e)
                          (.stopPropagation e)
                          (when (sel1 :#mui-overlay)
                            (hide-sidedrawer)))))))

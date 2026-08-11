import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

window.addEventListener(
  "load",
  () => {
    void import("virtual:pwa-register").then(({ registerSW }) => {
      registerSW({ immediate: false });
    });
  },
  { once: true },
);

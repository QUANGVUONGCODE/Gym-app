import "zmp-ui/zaui.css";  // Import ZaUI stylesheet
import "@/css/tailwind.scss";  // Import Tailwind stylesheet
import "@/css/app.scss";  // Import custom stylesheet

import React from "react";
import { createRoot } from "react-dom/client";

// Import necessary components from ZMP UI
import { ZMPRouter } from "zmp-ui";  // Import ZMPRouter from zmp-ui

// Import Layout component
import Layout from "@/components/layout";

// Import app configuration
import appConfig from "../app-config.json";

// Expose app configuration globally
if (!window.APP_CONFIG) {
  window.APP_CONFIG = appConfig as any;
}

// Create root for rendering the app
const root = createRoot(document.getElementById("app")!);

// Render the app with ZMPRouter wrapping the Layout component
root.render(
  <ZMPRouter>  {/* Wrap Layout with ZMPRouter */}
    <Layout />
  </ZMPRouter>
);

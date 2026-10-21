import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import "./assets/main.css";
// Scheme stylesheets after main.css: their [data-scheme] rules tie in
// specificity with main.css's :root/.dark palette, so source order must let
// the schemes win.
import "@repo/ui/src/theme/index.css";
import { router } from "./router";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found");

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

"use client";

import { useEffect } from "react";

/**
 * Bootstrap CSS is loaded in the root layout; interactive components (accordion,
 * collapse, dropdowns, etc.) need the JS bundle. Loads once on the client.
 */
export function BootstrapInit() {
  useEffect(() => {
    void import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);
  return null;
}

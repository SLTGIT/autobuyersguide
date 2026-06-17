"use client";

import { useEffect } from "react";

/** Refreshes AOS after WordPress HTML is in the document. */
export default function WpAosRefresh() {
  useEffect(() => {
    void import("aos").then((mod) => {
      if (typeof mod.default.refresh === "function") {
        mod.default.refresh();
      }
    });
  }, []);

  return null;
}

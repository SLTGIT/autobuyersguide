"use client";

import { useEffect, useState } from "react";

/** True only after the browser has mounted — use before DOM portals or third-party widgets. */
export function useClientMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

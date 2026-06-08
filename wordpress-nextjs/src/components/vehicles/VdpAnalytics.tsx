"use client";

import { useEffect } from "react";
import {
  trackVdpView,
  type VdpAnalyticsContext,
} from "@/lib/analytics/vdp";

const SESSION_VIEW_PREFIX = "vdp_view_tracked:";

export default function VdpAnalytics({
  stockNumber,
  make,
  model,
  year,
  slug,
}: VdpAnalyticsContext) {
  useEffect(() => {
    const key = `${SESSION_VIEW_PREFIX}${slug || stockNumber}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage unavailable — still track once per mount
    }
    trackVdpView({ stockNumber, make, model, year, slug });
  }, [stockNumber, make, model, year, slug]);

  return null;
}

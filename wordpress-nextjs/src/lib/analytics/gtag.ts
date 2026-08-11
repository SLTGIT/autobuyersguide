type AnalyticsParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

function cleanParams(params?: AnalyticsParams): Record<string, string | number | boolean> {
  if (!params) return {};
  return Object.fromEntries(
    Object.entries(params).filter(
      (entry): entry is [string, string | number | boolean] =>
        entry[1] !== undefined && entry[1] !== "",
    ),
  );
}

/** Sends a custom event to GA4 (via gtag) and GTM (via dataLayer). */
export function pushAnalyticsEvent(
  eventName: string,
  params?: AnalyticsParams,
): void {
  if (typeof window === "undefined") return;

  const payload = cleanParams(params);

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, payload);
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...payload });
}

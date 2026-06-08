import { pushAnalyticsEvent } from "./gtag";

export type VdpAnalyticsContext = {
  stockNumber: string;
  make: string;
  model: string;
  year: string | number;
  slug?: string;
};

function vdpParams(ctx: VdpAnalyticsContext): Record<string, string | number> {
  const params: Record<string, string | number> = {
    stock_number: ctx.stockNumber.trim(),
    vehicle_make: ctx.make.trim(),
    vehicle_model: ctx.model.trim(),
    vehicle_year: String(ctx.year),
  };
  const slug = ctx.slug?.trim();
  if (slug) params.vehicle_slug = slug;
  if (typeof window !== "undefined") {
    params.page_path = window.location.pathname;
  }
  return params;
}

export function trackVdpView(ctx: VdpAnalyticsContext): void {
  pushAnalyticsEvent("vdp_view", vdpParams(ctx));
}

export function trackVdpPhoneReveal(ctx: VdpAnalyticsContext): void {
  pushAnalyticsEvent("vdp_phone_reveal", vdpParams(ctx));
}

export function trackVdpFormSubmit(
  ctx: VdpAnalyticsContext,
  formType: "enquiry" | "test_drive",
): void {
  pushAnalyticsEvent("vdp_form_submit", {
    ...vdpParams(ctx),
    form_type: formType,
  });
}

"use server";

export type SellMyCarFormState = { ok?: boolean; message?: string };

export async function submitSellMyCarValuation(
  _prev: SellMyCarFormState | undefined,
  formData: FormData,
): Promise<SellMyCarFormState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const mobile = String(formData.get("mobile") ?? "").trim();
  const vehicleYear = String(formData.get("vehicleYear") ?? "").trim();
  const vehicleMake = String(formData.get("vehicleMake") ?? "").trim();
  const vehicleModel = String(formData.get("vehicleModel") ?? "").trim();
  const odometer = String(formData.get("odometer") ?? "").trim();
  const rego = String(formData.get("rego") ?? "").trim();
  const extraComments = String(formData.get("extraComments") ?? "").trim();

  if (!firstName || !lastName || !email || !mobile) {
    return { ok: false, message: "Please complete your contact details." };
  }
  if (!vehicleYear || !vehicleMake || !vehicleModel) {
    return { ok: false, message: "Please complete your vehicle details." };
  }

  const comments = [
    "Sell My Car — obligation-free valuation",
    `Vehicle: ${vehicleYear} ${vehicleMake} ${vehicleModel}`,
    odometer ? `Odometer: ${odometer} km` : null,
    rego ? `Registration: ${rego}` : null,
    extraComments ? `Notes: ${extraComments}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  // Wire to CRM, email, or API when ready.
  void comments;

  return {
    ok: true,
    message:
      "Thanks — we have received your enquiry and will be in touch shortly.",
  };
}

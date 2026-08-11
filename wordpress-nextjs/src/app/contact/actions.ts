"use server";

export type ContactFormState = { ok?: boolean; message?: string };

export async function submitContactForm(
  _prev: ContactFormState | undefined,
  formData: FormData,
): Promise<ContactFormState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const mobile = String(formData.get("mobile") ?? "").trim();
  const comments = String(formData.get("comments") ?? "").trim();
  const enquiryType = String(formData.get("enquiryType") ?? "").trim();
  const subscribe = formData.get("subscribe") === "on";
  const notRobot = formData.get("notRobot") === "on";

  if (!firstName || !lastName || !email || !mobile || !comments) {
    return { ok: false, message: "Please fill in all required fields." };
  }
  if (!notRobot) {
    return { ok: false, message: "Please confirm you are not a robot." };
  }

  // Wire to CRM, email, or API when ready.
  void subscribe;
  void enquiryType;

  return { ok: true, message: "Thanks — we have received your enquiry." };
}

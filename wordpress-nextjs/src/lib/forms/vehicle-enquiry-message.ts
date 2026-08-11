export type VehicleEnquiryMessageInput = {
  condition?: string;
  year?: string;
  make?: string;
  model?: string;
  price?: string;
  listingSite?: string;
};

function capitalizeCondition(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function buildVehicleDescription(input: VehicleEnquiryMessageInput): string {
  const condition = input.condition ? capitalizeCondition(input.condition) : "";
  const year = input.year?.trim() || "";
  const make = input.make?.trim() || "";
  const model = input.model?.trim() || "";
  return [condition, year, make, model].filter(Boolean).join(" ");
}

/** Default comments text for vehicle enquiry forms. */
export function buildVehicleEnquiryDefaultMessage(
  input: VehicleEnquiryMessageInput,
): string {
  const vehicle = buildVehicleDescription(input);
  const site = input.listingSite?.trim() || "our website";
  const price = input.price?.trim() || "";

  if (!vehicle) {
    return "I'd like to know if this vehicle is still available.";
  }

  const pricePart = price ? ` for ${price}` : "";
  return `I'd like to know if the ${vehicle} you have listed on ${site}${pricePart} is still available.`;
}

/** Pre-filled message for the site-wide Text us widget (non-vehicle pages). */
export const TEXT_US_DEFAULT_MESSAGE =
  "Hi, I have a question about your vehicles. Please text me back when you can.";

/** Shorter SMS-style default when the widget is opened on a vehicle listing page. */
export function buildTextUsVehicleDefaultMessage(
  input: VehicleEnquiryMessageInput,
): string {
  const vehicle = buildVehicleDescription(input);
  if (!vehicle) return TEXT_US_DEFAULT_MESSAGE;

  const price = input.price?.trim() || "";
  const pricePart = price ? ` for ${price}` : "";
  return `Hi, is the ${vehicle}${pricePart} still available?`;
}

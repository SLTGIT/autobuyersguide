const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function sanitizePhoneInput(value: string, maxDigits = 10): string {
  return digitsOnly(value).slice(0, maxDigits);
}

export function sanitizeNameInput(value: string): string {
  return value.replace(/[0-9]/g, "");
}

export function isValidName(value: string): boolean {
  const trimmed = value.trim();
  return Boolean(trimmed) && NAME_REGEX.test(trimmed);
}

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  return Boolean(trimmed) && EMAIL_REGEX.test(trimmed);
}

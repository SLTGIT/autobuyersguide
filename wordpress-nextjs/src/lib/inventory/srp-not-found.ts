const PATH_SLUG_LABELS: Record<string, string> = {
  suv: "SUV",
  "4x4": "4x4",
};

export function labelFromSearchPathSlug(slug: string): string {
  const key = slug.trim().toLowerCase();
  if (PATH_SLUG_LABELS[key]) return PATH_SLUG_LABELS[key];
  return key
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

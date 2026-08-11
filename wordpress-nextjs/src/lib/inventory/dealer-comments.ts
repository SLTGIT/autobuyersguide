import { splitVehicleDescription } from "./transform";

export type DealerCommentBlock =
  | { type: "paragraph"; text: string }
  | { type: "featureList"; items: string[] }
  | { type: "vin"; value: string }
  | { type: "badges"; items: string[] }
  | { type: "hashtags"; tags: string[] };

function cleanProse(s: string): string {
  if (!s.trim()) return "";
  return s
    .replace(/\*{3,}/g, "")
    .replace(/!{4,}/g, "!")
    .replace(/\s*\*\s*$/g, "")
    .replace(/^\s*\*\s*/g, "")
    .replace(/\s+\*\s+\*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function cleanFeatureItem(s: string): string {
  return s.replace(/^\*+|\*+$/g, "").replace(/\s+/g, " ").trim();
}

function splitBadgesAndProse(p: string): { badges: string[]; prose: string } {
  const parts = p.split(/\*\*/).map((s) => s.trim()).filter(Boolean);
  if (parts.length <= 1) return { badges: [], prose: p.trim() };

  const badges: string[] = [];
  const proseParts: string[] = [];
  for (const part of parts) {
    if (part.length <= 90 && !/[.!?]\s+[A-Z]/.test(part)) {
      badges.push(cleanProse(part));
    } else {
      proseParts.push(part);
    }
  }
  return {
    badges: badges.filter(Boolean),
    prose: proseParts.join(" ").trim(),
  };
}

/**
 * Turn raw dealer feed copy into structured blocks for readable layout.
 */
export function parseDealerCommentsBlocks(raw: string): DealerCommentBlock[] {
  const paras = splitVehicleDescription(raw);
  const blocks: DealerCommentBlock[] = [];

  for (const para of paras) {
    let p = para.trim();
    if (!p) continue;

    const tags = [...p.matchAll(/#([A-Za-z0-9_]+)/g)].map((m) => m[1]);
    if (tags.length >= 2) {
      p = p.replace(/#[A-Za-z0-9_]+\s*/g, "").trim();
    }

    const vinMatch = p.match(/\bVIN\s*\*?\s*([A-HJ-NPR-Z0-9]{11,17})\s*\*?/i);
    let vin: string | undefined;
    if (vinMatch) {
      vin = vinMatch[1];
      p = p.replace(vinMatch[0], " ").replace(/\s+/g, " ").trim();
    }

    const bulletCount = (p.match(/•/g) || []).length;
    if (bulletCount >= 2) {
      const parts = p
        .split(/\s*•\s*/)
        .map((s) => s.replace(/\s+/g, " ").trim())
        .filter(Boolean);
      if (parts.length >= 2) {
        const first = parts[0];
        const rest = parts.slice(1);
        const useIntro =
          first.length > 85 ||
          /\*\*/.test(first) ||
          /\$\s*\d/.test(first) ||
          /[!?.]\s*$/.test(first);
        if (useIntro && rest.length) {
          const { badges, prose } = splitBadgesAndProse(first);
          const proseClean = cleanProse(prose);
          if (proseClean) blocks.push({ type: "paragraph", text: proseClean });
          if (badges.length) blocks.push({ type: "badges", items: badges });
          blocks.push({
            type: "featureList",
            items: rest.map(cleanFeatureItem).filter(Boolean),
          });
        } else {
          blocks.push({
            type: "featureList",
            items: parts.map(cleanFeatureItem).filter(Boolean),
          });
        }
        if (vin) blocks.push({ type: "vin", value: vin });
        if (tags.length >= 2) blocks.push({ type: "hashtags", tags });
        continue;
      }
    }

    const { badges, prose } = splitBadgesAndProse(p);
    const proseClean = cleanProse(prose);
    if (proseClean) blocks.push({ type: "paragraph", text: proseClean });
    if (badges.length) blocks.push({ type: "badges", items: badges });
    if (vin) blocks.push({ type: "vin", value: vin });
    if (tags.length >= 2) blocks.push({ type: "hashtags", tags });
  }

  return blocks;
}

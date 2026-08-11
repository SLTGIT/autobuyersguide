/**
 * WordPress often mangles HTML pasted from Prettier (tags split across lines,
 * e.g. `</a` on one line and `>` on the next). That can produce entity-encoded
 * fake closings like `&lt;/a &gt;` inside a real `<a>`.
 *
 * - For anchors: replace those entities with a real `</a>` so the link ends
 *   where intended; stray `</a>` later in the markup are ignored by the parser.
 * - For spans: strip the bogus encoded close; a real `</span>` usually follows.
 * - WordPress often inserts `<br />` where the editor had soft line breaks; strip
 *   those so paragraphs flow as normal wrapped text (use real `<p>` blocks in WP).
 * - Strip AOS attributes (opacity:0 before init causes CLS on mobile).
 * - Stabilise images/iframes missing dimensions.
 */
const ENCODED_CLOSE_A = /&lt;\s*\/\s*a\s*&gt;/gi;
const ENCODED_CLOSE_SPAN = /&lt;\s*\/\s*span\s*&gt;/gi;
const BR_TAG = /<br\s*\/?>/gi;
const AOS_ATTR = /\s+data-aos(?:-[\w-]+)?=(?:"[^"]*"|'[^']*')/gi;

function appendStyleAttr(attrs: string, rules: string): string {
  const styleMatch = /style\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attrs);
  if (styleMatch) {
    const existing = styleMatch[1] ?? styleMatch[2] ?? "";
    const merged = existing.trim().endsWith(";")
      ? `${existing.trim()}${rules}`
      : `${existing.trim()};${rules}`;
    return attrs.replace(styleMatch[0], `style="${merged}"`);
  }
  return `${attrs} style="${rules}"`;
}

function stabilizeMedia(html: string): string {
  let firstImage = true;

  return html
    .replace(AOS_ATTR, "")
    .replace(/<img\b([^>]*?)>/gi, (_match, rawAttrs: string) => {
      let attrs = rawAttrs;
      const hasWidth = /\bwidth\s*=\s*["']?\d+/i.test(attrs);
      const hasHeight = /\bheight\s*=\s*["']?\d+/i.test(attrs);

      if (!/\bloading\s*=/i.test(attrs) && !/\bfetchpriority\s*=/i.test(attrs)) {
        attrs += firstImage
          ? ' fetchpriority="high"'
          : ' loading="lazy"';
      }
      firstImage = false;

      if (!/\bdecoding\s*=/i.test(attrs)) {
        attrs += ' decoding="async"';
      }

      if (!hasWidth && !hasHeight) {
        attrs = appendStyleAttr(
          attrs,
          "aspect-ratio:16/9;object-fit:cover;width:100%;height:auto",
        );
      } else if (!/style\s*=/i.test(attrs)) {
        attrs += ' style="max-width:100%;height:auto"';
      }

      return `<img${attrs}>`;
    })
    .replace(/<iframe\b([^>]*?)>/gi, (_match, rawAttrs: string) => {
      let attrs = rawAttrs;
      if (!/\bloading\s*=/i.test(attrs)) {
        attrs += ' loading="lazy"';
      }
      if (!/style\s*=/i.test(attrs)) {
        attrs += ' style="width:100%;aspect-ratio:16/9;border:0"';
      }
      return `<iframe${attrs}>`;
    });
}

export function repairWpRenderedHtml(html: string): string {
  if (!html) return html;
  let out = html;
  out = out.replace(/&amp;lt;\s*\/\s*a\s*&amp;gt;/gi, "</a>");
  out = out.replace(/&amp;lt;\s*\/\s*span\s*&amp;gt;/gi, "");
  out = out.replace(ENCODED_CLOSE_A, "</a>");
  out = out.replace(ENCODED_CLOSE_SPAN, "");
  out = out.replace(BR_TAG, " ");
  out = stabilizeMedia(out);
  return out;
}

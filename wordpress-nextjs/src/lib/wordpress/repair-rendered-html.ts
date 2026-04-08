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
 */
const ENCODED_CLOSE_A = /&lt;\s*\/\s*a\s*&gt;/gi;
const ENCODED_CLOSE_SPAN = /&lt;\s*\/\s*span\s*&gt;/gi;
const BR_TAG = /<br\s*\/?>/gi;

export function repairWpRenderedHtml(html: string): string {
  if (!html) return html;
  let out = html;
  // Double-encoded (e.g. after storage or a proxy)
  out = out.replace(/&amp;lt;\s*\/\s*a\s*&amp;gt;/gi, "</a>");
  out = out.replace(/&amp;lt;\s*\/\s*span\s*&amp;gt;/gi, "");
  out = out.replace(ENCODED_CLOSE_A, "</a>");
  out = out.replace(ENCODED_CLOSE_SPAN, "");
  out = out.replace(BR_TAG, " ");
  return out;
}

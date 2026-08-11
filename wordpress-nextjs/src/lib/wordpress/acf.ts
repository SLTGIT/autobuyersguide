import type { WPPageACFFields } from '@/types/wordpress';

/** ACF keys must match the field "Name" (API key) in WordPress, not the label. */
export interface WPSeoACFFields {
  meta_title?: string;
  meta_description?: string;
}

/**
 * WordPress/ACF may return `acf: []` when the field group is not shown in REST,
 * or the payload is otherwise empty. Normalize to a plain object or undefined.
 */
export function normalizeAcf<T extends object>(acf: unknown): T | undefined {
  if (acf == null || Array.isArray(acf) || typeof acf !== 'object') {
    return undefined;
  }
  return acf as T;
}

export function normalizePageAcf(acf: unknown): WPPageACFFields | undefined {
  return normalizeAcf<WPPageACFFields>(acf);
}

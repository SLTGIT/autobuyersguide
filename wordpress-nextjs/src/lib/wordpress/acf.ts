import type { WPPageACFFields } from '@/types/wordpress';

/**
 * WordPress/ACF may return `acf: []` when the field group is not shown in REST,
 * or the payload is otherwise empty. Normalize to a plain object or undefined.
 */
export function normalizePageAcf(acf: unknown): WPPageACFFields | undefined {
    if (acf == null || Array.isArray(acf) || typeof acf !== 'object') {
        return undefined;
    }
    return acf as WPPageACFFields;
}

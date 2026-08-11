/**
 * GTM fallback for users without JavaScript.
 *
 * Do not render `<noscript><iframe /></noscript>` as React children — browsers
 * ignore noscript content when JS is enabled, so React hydration fails with
 * insertBefore / removeChild NotFoundError.
 */
export default function GtmNoscript({ gtmId }: { gtmId: string }) {
  const iframeSrc = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;

  return (
    <div
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `<noscript><iframe src="${iframeSrc}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`,
      }}
    />
  );
}

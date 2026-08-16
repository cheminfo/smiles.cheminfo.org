/**
 * Honour the anchor of the address that opened the page. The browser looks for
 * it before React has put anything in the document, gives up, and never tries
 * again — so a page whose sections are addressable scrolls itself once they
 * exist.
 */
export default function jumpToAnchor(): void {
  const { hash } = globalThis.location;
  if (hash.length < 2) return;
  const target = document.querySelector(
    `#${CSS.escape(decodeURIComponent(hash.slice(1)))}`,
  );
  target?.scrollIntoView();
}

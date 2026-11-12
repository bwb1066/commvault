/**
 * frame — embeds a same-site page (e.g. a static tool) in a full-size iframe.
 *
 * Authoring (DA): a single link; its text becomes the iframe title.
 * The iframe only loads once the block is actually shown (an adobe-brief tab
 * that is opened), because browsers load hidden lazy iframes eagerly.
 */
export default function init(block) {
  const link = block.querySelector('a[href]');
  if (!link) return;
  const iframe = document.createElement('iframe');
  iframe.title = link.textContent.trim() || 'Embedded content';
  iframe.setAttribute('loading', 'lazy');
  const src = link.href;
  block.replaceChildren(iframe);

  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    iframe.src = src;
    io.disconnect();
  });
  io.observe(block);
}

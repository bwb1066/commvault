/**
 * gaps — side-by-side "gap" cards: what Brand Visibility shows vs how AEM
 * fixes it. Rows line up across cards (CSS subgrid).
 *
 * Authoring (DA): one row per card, three cells.
 *   cell 1: label paragraph ("Gap 1"), h3 title, question paragraph
 *   cell 2: bold label paragraph ("Brand Visibility shows"), text
 *   cell 3: bold label paragraph ("AEM fixes it"), text, optional note
 */
function labelFirst(cell) {
  const first = cell?.firstElementChild;
  if (first?.tagName === 'P' && first.children.length === 1
    && first.firstElementChild.tagName === 'STRONG'
    && first.textContent.trim() === first.firstElementChild.textContent.trim()) {
    first.className = 'gap-label';
  }
}

export default function init(block) {
  const cards = [...block.children].map((row) => {
    const [headCell, signalCell, fixCell] = row.children;
    const card = document.createElement('article');
    card.className = 'gap';

    const header = document.createElement('header');
    const head = [...(headCell?.children || [])];
    const h3Index = head.findIndex((c) => /^H[1-6]$/.test(c.tagName));
    head.forEach((child, i) => {
      if (i < h3Index && child.tagName === 'P') child.className = 'gap-n';
      header.append(child);
    });

    const signal = document.createElement('div');
    signal.className = 'gap-signal';
    labelFirst(signalCell);
    signal.append(...(signalCell?.childNodes || []));

    const fix = document.createElement('div');
    fix.className = 'gap-fix';
    labelFirst(fixCell);
    const fixParas = [...(fixCell?.children || [])].filter((p) => !p.classList.contains('gap-label'));
    if (fixParas.length > 1) fixParas.slice(1).forEach((p) => p.classList.add('gap-note'));
    fix.append(...(fixCell?.childNodes || []));

    card.append(header, signal, fix);
    return card;
  });
  block.replaceChildren(...cards);
}

/**
 * numbered-list — a grey panel with a heading and numbered items (01, 02, …).
 *
 * Authoring (DA): an optional first row with the panel heading (h2), then one
 * row per item: h3 title, a description paragraph, and an optional link.
 */
export default function init(block) {
  const rows = [...block.children];
  const list = document.createElement('ol');
  let heading = null;

  rows.forEach((row) => {
    const cells = [...row.children];
    const h2 = row.querySelector('h2');
    if (h2 && !row.querySelector('h3')) {
      heading = h2;
      return;
    }
    const li = document.createElement('li');
    li.className = 'numbered-list-item';
    const n = document.createElement('span');
    n.className = 'numbered-list-n';
    n.setAttribute('aria-hidden', 'true');
    n.textContent = String(list.children.length + 1).padStart(2, '0');
    const body = document.createElement('div');
    cells.forEach((cell) => body.append(...cell.childNodes));
    body.querySelectorAll('p:has(> a:only-child)').forEach((p) => p.classList.add('numbered-list-link'));
    li.append(n, body);
    list.append(li);
  });

  block.replaceChildren(...(heading ? [heading] : []), list);
  if (heading) block.setAttribute('aria-label', heading.textContent.trim());
  block.setAttribute('role', 'complementary');
}

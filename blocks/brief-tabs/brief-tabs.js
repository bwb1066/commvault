/**
 * brief-tabs — turns an adobe-brief page into a tabbed, slide-like brief:
 * a sticky bar (Adobe logo, label, tabs, optional pill link), one screen per
 * tab, and a pager footer (legal line, ← n / N →).
 *
 * Authoring (DA), a two/three-column table, first cell is the row type:
 *   label | Content supply chain for Commvault
 *   tab   | Overview                       (| optional short label for phones)
 *   …one `tab` row per screen…
 *   cta   | link                           (pill link at the right of the bar)
 *   legal | © 2026 Adobe. …                (pager footer text)
 *
 * The N sections that follow the block's section become the N screens, in
 * order. Tab label → screen id (e.g. "AI visibility" → #ai-visibility), so any
 * `#ai-visibility` link on the page switches tabs, and the URL hash deep-links.
 */

const LOGO = new URL('./adobe-logo.svg', import.meta.url).href;

const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v === undefined || v === null || v === false) return;
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v === true ? '' : v);
  });
  node.append(...children);
  return node;
}

function readRows(block) {
  const rows = { tabs: [] };
  [...block.children].forEach((row) => {
    const [keyCell, a, b] = row.children;
    const key = keyCell?.textContent.trim().toLowerCase();
    if (key === 'tab' && a) {
      rows.tabs.push({ label: a.textContent.trim(), short: b?.textContent.trim() || '' });
    } else if (key === 'label' || key === 'legal') {
      rows[key] = a?.textContent.trim();
    } else if (key === 'cta') {
      rows.cta = a?.querySelector('a');
    }
  });
  return rows;
}

// Links that leave the brief open in a new tab and get the ↗ marker
// (CSS: a.ext::after). EDS rewrites links to this site's own .aem.live/.page
// host to relative paths (/?demo), so "leaves" means another page, not just
// another host; #tab links and mailto: stay as they are.
function markExternal(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    if (a.closest('.frame')) return;
    const url = new URL(a.getAttribute('href'), window.location.href);
    if (!/^https?:$/.test(url.protocol)) return;
    if (url.host === window.location.host && url.pathname === window.location.pathname) return;
    a.target = '_blank';
    a.rel = 'noopener';
    // the two-pager's red primary buttons carry no ↗
    if (!a.classList.contains('btn-primary')) a.classList.add('ext');
  });
}

// Section style "loop": wrap each list step in a pill; the bold one is "hot".
function decorateLoops(root) {
  root.querySelectorAll('.section.loop .default-content > ul > li').forEach((li) => {
    const only = li.children.length === 1 && li.firstElementChild;
    if (only?.tagName === 'STRONG' && li.textContent.trim() === only.textContent.trim()) {
      only.classList.add('brief-step');
      return;
    }
    const span = el('span', { class: 'brief-step' }, ...li.childNodes);
    li.append(span);
  });
}

export default function init(block) {
  const { tabs, label, legal, cta } = readRows(block);
  const host = block.closest('.section');
  const main = block.closest('main');
  if (!tabs.length || !host || !main) return;

  // The screens: the sections after this block's section, one per tab.
  const screens = [];
  let next = host.nextElementSibling;
  while (next && screens.length < tabs.length) {
    if (next.classList.contains('section')) screens.push(next);
    next = next.nextElementSibling;
  }
  const items = tabs.slice(0, screens.length)
    .map((tab, i) => ({ ...tab, id: slug(tab.label), screen: screens[i] }));

  // ---- bar ----
  const brand = el(
    'a',
    { class: 'brief-brand', href: `#${items[0].id}`, 'aria-label': `Adobe${label ? `: ${label}` : ''}` },
    el('img', {
      src: LOGO, alt: '', width: 360, height: 87,
    }),
  );
  if (label) brand.append(el('span', {}, label));

  const tablist = el('div', { class: 'brief-pages', role: 'tablist', 'aria-label': 'Pages' });
  const buttons = items.map((item, i) => {
    const btn = el(
      'button',
      {
        type: 'button', role: 'tab', id: `tab-${item.id}`, 'aria-controls': item.id,
      },
      el('span', { class: 'num' }, `${i + 1}. `),
      el('span', { class: 'lg' }, item.label),
      el('span', { class: 'sm' }, item.short || item.label),
    );
    tablist.append(btn);
    return btn;
  });

  // A <div>, not <header>/<footer>: AK's postlcp/footer utils grab the first
  // header/footer element on the page (to load it as a block, or remove it).
  const bar = el('div', { class: 'brief-bar', role: 'banner' }, brand, tablist);
  if (cta) {
    cta.className = 'brief-rec';
    bar.append(cta);
  }

  // ---- pager ----
  const prev = el('button', { type: 'button', 'aria-label': 'Previous page' }, '←');
  const nextBtn = el('button', { type: 'button', 'aria-label': 'Next page' }, '→');
  const count = el('span', { 'aria-live': 'polite' });
  const foot = el(
    'div',
    { class: 'brief-foot', role: 'contentinfo' },
    el('span', { class: 'legal' }, legal || ''),
    el('div', { class: 'ctrl', role: 'group', 'aria-label': 'Page controls' }, prev, count, nextBtn),
  );

  // ---- screens ----
  items.forEach((item) => {
    const { screen } = item;
    screen.id = item.id;
    screen.classList.add('brief-screen');
    screen.setAttribute('role', 'tabpanel');
    screen.setAttribute('aria-labelledby', `tab-${item.id}`);
  });

  let current = -1;
  const show = (i, { focus = false, scroll = true, hash = true } = {}) => {
    if (i < 0 || i >= items.length) return;
    current = i;
    items.forEach((item, k) => {
      const on = k === i;
      buttons[k].setAttribute('aria-selected', String(on));
      buttons[k].tabIndex = on ? 0 : -1;
      item.screen.hidden = !on;
    });
    count.textContent = `${i + 1} / ${items.length}`;
    prev.disabled = i === 0;
    nextBtn.disabled = i === items.length - 1;
    if (focus) buttons[i].focus();
    if (hash) window.history.replaceState(null, '', `#${items[i].id}`);
    if (scroll) window.scrollTo(0, 0);
  };
  const indexOf = (hash) => items.findIndex((item) => `#${item.id}` === hash);

  buttons.forEach((btn, i) => btn.addEventListener('click', () => show(i)));
  tablist.addEventListener('keydown', (e) => {
    const keys = {
      ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: items.length - 1,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    show((keys[e.key] + items.length) % items.length, { focus: true });
  });
  prev.addEventListener('click', () => show(current - 1));
  nextBtn.addEventListener('click', () => show(current + 1));

  // In-page links to a screen (#ai-visibility, the brand link) switch tabs.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    const i = a ? indexOf(a.getAttribute('href')) : -1;
    if (i < 0) return;
    e.preventDefault();
    show(i, { focus: true });
  });
  window.addEventListener('hashchange', () => {
    const i = indexOf(window.location.hash);
    if (i >= 0 && i !== current) show(i, { hash: false });
  });

  // ---- mount ----
  markExternal(main);
  markExternal(bar);
  decorateLoops(main);
  main.before(bar);
  main.after(foot);
  host.classList.add('brief-tabs-host');
  host.hidden = true;

  const start = indexOf(window.location.hash);
  show(start >= 0 ? start : 0, { scroll: false, hash: start >= 0 });
}

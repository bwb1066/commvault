import config from '../../scripts/aep-config.js';
import { track, classify, recordSignal } from '../../scripts/personalization.js';

/**
 * persona-articles — "Recommended reading" rail of commvault.com blog cards
 * that re-selects itself for the visitor's audience.
 *
 * Personalization is both:
 *  - explicit: an "I'm a…" role picker in the block. A pick is stored as the
 *    same sessionStorage override the ?demo panel uses (so it sticks across
 *    pages and wins over inferred signals), sent to AEP, and broadcast as
 *    `p13n:change`.
 *  - implicit: personalization.js infers the leading audience from Brand
 *    Concierge chat turns and audience-tagged page views; card clicks here add
 *    to that tally too (articles open in a new tab, so the rail visibly
 *    re-sorts behind them). The block re-renders on every `p13n:change`.
 *
 * Authoring (DA): one row per audience key — first cell the key
 * (`security_leader`, …, or `default` for anonymous visitors), second cell the
 * articles, each as: image, optional eyebrow paragraph, linked title
 * paragraph, optional description paragraph. An optional `heading` row
 * overrides the block heading.
 */

const AUD_GLOBAL = config.audienceGlobal || 'aepAudience';
const OVERRIDE_KEY = config.storageKeys?.override || 'aep_audience_override';
const AUDIENCES = config.audiences || [];

const labelFor = (key) => AUDIENCES.find((a) => a.key === key)?.label;

function readOverride() {
  try {
    return sessionStorage.getItem(OVERRIDE_KEY) || '';
  } catch (e) {
    return '';
  }
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function readCards(cell) {
  const cards = [];
  let pending = {};
  let last = null;
  [...cell.children].forEach((child) => {
    const pic = child.matches('picture') ? child : child.querySelector('picture');
    const link = child.querySelector('a') || (child.matches('a') ? child : null);
    if (pic) {
      pending.picture = pic;
      last = null;
    } else if (link) {
      last = {
        ...pending, title: link.textContent.trim(), href: link.getAttribute('href'), dek: '',
      };
      cards.push(last);
      pending = {};
    } else if (child.textContent.trim()) {
      if (last && !last.dek) last.dek = child.textContent.trim();
      else pending.eyebrow = child.textContent.trim();
    }
  });
  return cards;
}

function readGroups(block) {
  const groups = {};
  let heading = '';
  [...block.children].forEach((row) => {
    const [keyCell, contentCell] = row.children;
    const key = keyCell?.textContent.trim().toLowerCase().replace(/[\s/-]+/g, '_');
    if (!key || !contentCell) return;
    if (key === 'heading') {
      heading = contentCell.textContent.trim();
      return;
    }
    const cards = readCards(contentCell);
    if (cards.length) groups[key] = cards;
  });
  return { groups, heading };
}

function cardEl(card, groupKey) {
  const li = el('li', 'persona-article-card');
  if (card.picture) {
    const media = el('div', 'persona-article-image');
    const pic = card.picture.cloneNode(true);
    const img = pic.querySelector('img');
    if (img) {
      img.loading = 'lazy';
      img.alt = '';
    }
    media.append(pic);
    li.append(media);
  }
  const body = el('div', 'persona-article-body');
  body.append(el('p', 'persona-article-eyebrow', card.eyebrow || 'Blog'));
  body.append(el('h3', 'persona-article-title', card.title));
  if (card.dek) body.append(el('p', 'persona-article-dek', card.dek));
  const a = el('a', 'persona-article-link', 'Read the blog');
  a.href = card.href;
  a.setAttribute('aria-label', `Read the blog: ${card.title}`);
  if (/^https?:/.test(card.href) && !card.href.includes(window.location.host)) {
    a.target = '_blank';
    a.rel = 'noopener';
  }
  // Implicit signal: what someone chooses to read says who they are.
  a.addEventListener('click', () => {
    const audience = groupKey !== 'default' ? groupKey : classify(`${card.title} ${card.dek}`);
    recordSignal(audience, 'article', { article: card.href, title: card.title });
  });
  const cta = el('p', 'persona-article-cta');
  cta.append(a);
  body.append(cta);
  li.append(body);
  return li;
}

export default function decorate(block) {
  const { groups, heading } = readGroups(block);
  const keys = Object.keys(groups);
  if (!keys.length) return;

  const head = el('div', 'persona-articles-head');
  const eyebrow = el('p', 'persona-articles-eyebrow', 'Recommended for you');
  const title = el('h2', 'persona-articles-title', heading || 'Insights for what you’re solving');
  head.append(eyebrow, title);

  // Explicit picker — only roles that have authored content.
  const picker = el('div', 'persona-articles-picker');
  picker.setAttribute('role', 'group');
  picker.setAttribute('aria-label', 'Personalize recommendations by role');
  picker.append(el('span', 'persona-articles-picker-label', 'I’m a'));
  const roles = AUDIENCES.filter((a) => groups[a.key]);
  const chips = roles.map(({ key, label }) => {
    const b = el('button', 'persona-articles-chip', label);
    b.type = 'button';
    b.dataset.key = key;
    return b;
  });
  picker.append(...chips);

  const status = el('p', 'persona-articles-status');
  status.setAttribute('aria-live', 'polite');
  const grid = el('ul', 'persona-articles-grid');

  block.replaceChildren(head, picker, status, grid);

  const pickKey = (aud) => {
    if (aud && groups[aud]) return aud;
    return groups.default ? 'default' : keys[0];
  };

  let shown = null;
  const render = (aud) => {
    const key = pickKey(aud);
    const explicit = !!readOverride() && key === readOverride();
    const label = labelFor(key);
    chips.forEach((c) => {
      c.setAttribute('aria-pressed', String(explicit && c.dataset.key === key));
    });
    if (key === 'default' || !label) {
      status.textContent = 'Popular with Commvault readers. Tell us your role to tailor these picks.';
    } else if (explicit) {
      status.textContent = `Showing picks for ${label}s, based on the role you chose.`;
    } else {
      status.textContent = `Showing picks for ${label}s, based on what you’ve explored.`;
    }
    block.dataset.audience = key;
    block.dataset.mode = (key !== 'default' && (explicit ? 'explicit' : 'implicit')) || 'default';
    if (key === shown) return;
    shown = key;
    grid.replaceChildren(...groups[key].map((card) => cardEl(card, key)));
    block.classList.remove('is-updated');
    // eslint-disable-next-line no-void
    void block.offsetWidth;
    block.classList.add('is-updated');
  };

  chips.forEach((chip) => chip.addEventListener('click', () => {
    // Clicking the active role again clears the explicit choice.
    const key = chip.getAttribute('aria-pressed') === 'true' ? '' : chip.dataset.key;
    try {
      if (key) sessionStorage.setItem(OVERRIDE_KEY, key);
      else sessionStorage.removeItem(OVERRIDE_KEY);
    } catch (e) { /* private mode — still personalize this view */ }
    window[AUD_GLOBAL] = key || undefined;
    track('web.webinteraction.linkClicks', {
      standard: {
        web: { webInteraction: { name: 'persona-select', type: 'other', linkClicks: { value: 1 } } },
      },
      tenant: { signal: { source: 'self-select', audience: key || 'default' } },
    });
    document.dispatchEvent(new CustomEvent('p13n:change', { detail: { audience: key } }));
  }));

  render(readOverride() || window[AUD_GLOBAL]);
  document.addEventListener('p13n:change', (e) => render(e.detail?.audience || window[AUD_GLOBAL]));
}

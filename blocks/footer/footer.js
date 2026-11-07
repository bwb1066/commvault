import { getConfig, getMetadata } from '../../scripts/ak.js';
import { loadFragment } from '../fragment/fragment.js';

const FOOTER_PATH = '/fragments/nav/footer';

const SOCIAL = ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube'];

/**
 * Brand section (commvault.com): logo on top, then the social icons and the
 * Contact Us button. Social links become icon-only (label kept for a11y).
 * @param {Element} section The first footer section
 */
function decorateBrand(section) {
  section.classList.add('section-brand');
  const { codeBase } = getConfig();
  const logo = document.createElement('a');
  logo.className = 'footer-logo';
  logo.href = '/';
  logo.innerHTML = `<span class="footer-label">Commvault</span>
    <svg aria-hidden="true"><use href="${codeBase}/img/icons/logo.svg#logo"></use></svg>`;
  section.querySelector('.default-content')?.prepend(logo);

  const social = section.querySelector('ul');
  social?.classList.add('footer-social');
  social?.querySelectorAll('a').forEach((a) => {
    const name = SOCIAL.find((s) => a.href.includes(s));
    if (name) a.classList.add(`social-${name}`);
    a.target = '_blank';
    a.rel = 'noopener';
    const label = document.createElement('span');
    label.className = 'footer-label';
    label.append(...a.childNodes);
    a.append(label);
  });
}

/**
 * loads and decorates the footer
 * @param {Element} el The footer element
 */
export default async function init(el) {
  const { locale } = getConfig();
  const footerMeta = getMetadata('footer');
  const path = footerMeta || FOOTER_PATH;
  try {
    const fragment = await loadFragment(`${locale.prefix}${path}`);
    fragment.classList.add('footer-content');

    const sections = [...fragment.querySelectorAll(':scope > .section')];
    const legal = sections.pop();
    legal?.classList.add('section-legal');
    const brand = sections.shift();
    if (brand) decorateBrand(brand);
    sections.forEach((s) => s.classList.add('section-links'));

    el.append(fragment);
  } catch (e) {
    throw Error(e);
  }
}

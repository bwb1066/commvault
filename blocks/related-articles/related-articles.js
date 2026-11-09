/*
 * Related Articles block
 * Author content model: one URL per row. Example (DA / Google Docs table):
 *
 *   | Related Articles                                |
 *   | https://www.commvault.com/blogs/article-one     |
 *   | https://www.commvault.com/blogs/article-two     |
 *   | https://www.commvault.com/blogs/article-three   |
 *
 * The block renders a right-rail card with an eyebrow heading and the list
 * of links. Link text is taken from authored text when present, otherwise it
 * is derived from the URL slug.
 */

function titleFromUrl(href) {
  try {
    const { pathname } = new URL(href);
    const slug = pathname.split('/').filter(Boolean).pop() || pathname;
    return slug
      .replace(/\.[a-z0-9]+$/i, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch (e) {
    return href;
  }
}

export default function decorate(block) {
  const links = [...block.querySelectorAll('a')];

  block.textContent = '';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'related-articles-eyebrow';
  eyebrow.textContent = 'Related articles';
  block.append(eyebrow);

  const list = document.createElement('ul');
  list.className = 'related-articles-list';

  links.forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;

    const authored = a.textContent.trim();
    const label = authored && !/^https?:\/\//i.test(authored)
      ? authored
      : titleFromUrl(href);

    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    if (/^https?:\/\//i.test(href) && !href.includes(window.location.hostname)) {
      link.target = '_blank';
      link.rel = 'noopener';
    }
    item.append(link);
    list.append(item);
  });

  block.append(list);
}

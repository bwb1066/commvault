/**
 * tiles — a row of capability tiles (the two-pager's content supply chain).
 *
 * Authoring (DA): one row per tile.
 *   cell 1: the verb (e.g. "Create")
 *   cell 2: h3 title, a product paragraph, a description paragraph, a link
 *   cell 3 (optional): "highlight" to give the tile the red treatment
 * A link to `#some-tab` switches tabs on an adobe-brief page.
 */
export default function init(block) {
  const tiles = [...block.children].map((row) => {
    const [verbCell, bodyCell, flagCell] = row.children;
    const tile = document.createElement('article');
    tile.className = 'tile';
    if (/highlight|hot/i.test(flagCell?.textContent || '')) tile.classList.add('hot');

    const verb = document.createElement('p');
    verb.className = 'tile-verb';
    verb.textContent = verbCell?.textContent.trim() || '';
    tile.append(verb);

    let plain = 0;
    [...(bodyCell?.children || [])].forEach((child) => {
      if (child.tagName === 'P' && child.querySelector('a')) {
        child.className = 'tile-src';
      } else if (child.tagName === 'P') {
        child.className = plain === 0 ? 'tile-prod' : 'tile-desc';
        plain += 1;
      }
      tile.append(child);
    });
    return tile;
  });
  block.replaceChildren(...tiles);
}

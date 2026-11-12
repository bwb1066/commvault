import { getConfig, getMetadata } from '../ak.js';

(async function loadFavicon() {
  const { codeBase } = getConfig();
  const name = getMetadata('favicon') || 'favicon';

  // A path to an image (e.g. /img/favicons/aem.svg, set per folder in the
  // metadata sheet) replaces the icon from head.html directly.
  if (/\.(svg|png|ico)$/i.test(name)) {
    const icon = document.head.querySelector('link[rel="icon"]');
    if (icon) {
      icon.href = name;
      icon.type = name.endsWith('.svg') ? 'image/svg+xml' : '';
    }
    return;
  }
  const favBase = `${codeBase}/img/favicons/${name}`;

  // Load before setting the main icon to prevent icon re-evaluation
  const tags = `<link rel="apple-touch-icon" href="${favBase}-180.png">
                <link rel="manifest" href="${favBase}.webmanifest">`;
  document.head.insertAdjacentHTML('beforeend', tags);

  const favicon = document.head.querySelector('link[href="data:,"]');
  if (favicon) favicon.href = `${favBase}.ico`;
}());

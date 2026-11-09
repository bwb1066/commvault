import ENV from './utils/env.js';
import { getConfig, loadStyle } from './ak.js';
import { SPARKLE_SVG } from './sparkle-icon.js';
import initWebSDK from './websdk.js';
import initPersonalization from './personalization.js';

/**
 * Brand Concierge floating bubble (commvault's header has no icon-only
 * affordance to sit beside, and commvault.com uses a corner chat bubble).
 * The widget itself is lazy-loaded on first click.
 */
function addChatbot() {
  const { codeBase } = getConfig();
  loadStyle(`${codeBase}/styles/lazy-styles.css`);
  const btn = document.createElement('button');
  btn.className = 'chatbot-bubble';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Ask the Brand Concierge');
  btn.innerHTML = SPARKLE_SVG;
  btn.addEventListener('click', async () => {
    const { default: openBrandConcierge } = await import('./brand-concierge-trigger.js');
    openBrandConcierge();
  });
  document.body.append(btn);
}

async function loadSidekick() {
  const getSk = () => document.querySelector('aem-sidekick');

  const sk = getSk() || await new Promise((resolve) => {
    document.addEventListener('sidekick-ready', () => resolve(getSk()));
  });
  if (sk) import('../tools/sidekick/sidekick.js').then((mod) => mod.default(sk));
}

(async function loadLazy() {
  // Adobe Web SDK + audience tracking (?demo opens the Web SDK inspector)
  const demoPanel = await import('./demo-panel.js');
  if (demoPanel.demoEnabled()) demoPanel.default();

  initWebSDK();
  initPersonalization();

  import('./utils/lazyhash.js');
  import('./utils/favicon.js');
  import('./utils/footer.js').then(({ default: footer }) => footer());
  addChatbot();

  // Author facing tools
  if (ENV !== 'prod') {
    import('../tools/scheduler/scheduler.js');
    loadSidekick();
  }
}());

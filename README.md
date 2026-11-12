# bwb1066-ak-base

Controlled baseline for spinning up AEM Edge Delivery replica sites. It is a
**mirror of [`aemsites/author-kit`](https://github.com/aemsites/author-kit)**
(not a GitHub fork, so it can be private + template) with all of
[`adobe/aem-block-collection`](https://github.com/adobe/aem-block-collection)'s
blocks ported in under an `aem-` prefix (adapted for Author Kit's `scripts/ak.js`
runtime). DA library material for those blocks lives in `reference/da-library/`.

## Repo family & update flow

> Full runbook: **[`docs/WORKFLOW.md`](docs/WORKFLOW.md)** — the reasoning, one-time
> setup, spawn steps, sync commands, and the manual DA step in one place.

```
aemsites/author-kit   (upstream: AK improvements)
        │  git fetch upstream && git merge upstream/main
        ▼
bwb1066-ak-base       (this repo: AK + baked-in aem-* blocks)
        │  ./spawn-site.sh <name>   (clone → shared history)
        ▼
<owner>/<site>        (a replica site)
        ▲  git fetch base && git merge base/main   (pull baseline updates)
```

- **Pull AK upstream into this baseline:** `git fetch upstream && git merge upstream/main`
  (remote `upstream` = author-kit; occasional conflicts in core `scripts/`/`styles/`,
  rarely in the added `aem-*` blocks).
- **Spawn a site:** `./spawn-site.sh <site-name> [owner] [--public]`. This *clones*
  the baseline rather than using GitHub's "Use this template" button, so the site
  shares history and can later `git merge base/main` cleanly. (The template button
  starts a disconnected history, which turns downstream updates into
  `--allow-unrelated-histories` cherry-picks — avoid it for real sites.)
- **Push baseline updates down into a site:** from the site, `git fetch base && git merge base/main`.

## DA blocks

`reference/da-library/` holds a sample doc per `aem-*` block plus `blocks-sheet.csv`.
These will be installed in DA (MCP): create the sample docs under
`bwb1066-ak-base/docs/library/blocks` in DA and append the CSV rows to the sheet
your site config's `library` tab points at. See `reference/da-library/README.md`.

---

# Author Kit
For projects that want a few more batteries. Built by the team who brought you da.live and adobe.com.

## Getting started

### 1. Github
1. Use this template to make a new repo.
1. Install [AEM Code Sync](https://da.live/bot).

### 2. DA content
1. Browse to https://da.live/start.
2. Follow the steps.

### 3. Local development
1. Clone your new repo to your computer.
1. Install the AEM CLI using your terminal: `sudo npm install -g @adobe/aem-cli`
1. Start the AEM CLI: `aem up`.
1. Open the `{repo}` folder in your favorite code editor and buil something.
1. **Recommended:** Install common npm packages like linting and testing: `npm i`.

## Features

### Localization & globalization
* Language only support - Ex: en, de, hi, ja
* Region only support - Ex: en-us, en-ca, de-de, de-ch
* Hybrid support - Ex: en, en-us, de, de-ch, de-at
* Fragment-based localized 404s
* Localized Header & Footer
* Do not translate support (#_dnt)

### Flexible section authoring
* Optional containers to constrain content
* Grids: 1-6
* Columns: 1-12
* Color scheme: light, dark
* Gap: xs, s, m, l, xl, xxl
* Spacing: xs, s, m, l, xl, xxl
* Background: token / image / color / gradient

### Base content
* Universal buttons w/ extensive styles
* Images w/ retina breakpoint
* Color scheme support: light, dark
* Modern favicon support
* New window support
* Deep link support
* Modal support

### Header and footer content
* Brand - First link in header
* Main Menu - First list in header
* Actions - Last section of header
* Menu & mega menu support
* Disable header/footer via meta props

### Scheduled content
* Schedule content using spreadsheets

### Sidekick & pre-production
* Quick Edit
* Extensible plumbing for plugins
* Schedule simulator
* Convert production links to relative

### Performance
* Extensible LCP detection

### Developer tools
* Environment detection
* Extensible logging (console, coralogix, splunk, etc.)
* Buildless reactive framework support (Lit)
* Hash utils patterns (#_blank, #_dnt, etc)
* Modern CSS scoping & nesting
* AEM Operational Telemetry

### Operations
* Cloudflare Worker reference implementation

## Patterns
### Page
A page is what holds your content. It can be styled using a metadata property called `template` which will load styles that apply to the entire page.

### Section
A section is a sub-section of your page. It can be styled using a `section-metadata` block. A section will control the layout of blocks.

### Block
Blocks are children of sections. A block adds visual context to parts of a page.

### Auto Block
An auto block is a block generated from a pre-defined piece of content. Often times from a link that matches a particular pattern. Link-based auto blocks can be helpful when additional nesting of content is required.

### Default content
Default content is content that lives outside a block.

## Design System

### Spacing & Gap
XS, S, M, L, XL, XXL

### Emphasis
quiet, default, strong, negative

### Buttons
accent, primary, secondary, negative
(w/ outline variations)

### Columns
1 - 12

### Grid
1 - 6

### Color tokens
blue, gray, green, magenta, organge, red, purple, yellow
(w/ 100-900 variations)

### Color schemes
light, dark

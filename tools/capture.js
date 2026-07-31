// Shared browser setup for the marketing captures.
//
// Chromium can't reach fonts.googleapis.com from this environment, so requests
// for the Google Fonts stylesheets and their woff2 files are fulfilled from
// .fontcache (see tools/fetch_fonts.py). Captures therefore show the same
// typography a real visitor gets, not the fallback stack.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CACHE = path.join(ROOT, '.fontcache');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

// The full chrome build reports a viewport 87px shorter than requested when
// recording, so Playwright letterboxes the video with grey. The headless shell
// captures the frame exactly, so video capture uses it instead.
const VIDEO_EXE = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';

const SITES = [
  { key: 'hub', file: 'index.html', name: 'baraah-sites portfolio' },
  { key: 'verano', file: 'sites/verano/index.html', name: 'Verano — coffee roaster' },
  { key: 'lacquer', file: 'sites/lacquer/index.html', name: 'Lacquer — nail studio' },
  { key: 'halo', file: 'sites/halo/index.html', name: 'Halo — skincare' },
  { key: 'ora', file: 'sites/ora/index.html', name: 'Ora — movement studio' },
  { key: 'fig', file: 'sites/fig/index.html', name: 'Fig & Vine — restaurant' },
];

function manifest() {
  const file = path.join(CACHE, 'manifest.json');
  if (!fs.existsSync(file)) {
    throw new Error('No font cache. Run: python3 tools/fetch_fonts.py');
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/** Serve the cached Google Fonts to a page instead of hitting the network. */
async function serveFonts(page) {
  const map = manifest();

  await page.route('**://fonts.googleapis.com/**', async (route) => {
    const key = map[route.request().url()];
    if (!key) return route.abort();
    await route.fulfill({
      status: 200,
      contentType: 'text/css; charset=utf-8',
      body: fs.readFileSync(path.join(CACHE, key), 'utf8'),
    });
  });

  // the rewritten CSS points woff2 requests at /__fonts/<name>
  await page.route('**/__fonts/*', async (route) => {
    const name = path.basename(new URL(route.request().url()).pathname);
    const file = path.join(CACHE, name);
    if (!fs.existsSync(file)) return route.abort();
    await route.fulfill({
      status: 200,
      contentType: 'font/woff2',
      body: fs.readFileSync(file),
    });
  });
}

/** Wait for entrance animations and webfonts to settle. */
async function settle(page, ms = 1400) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(ms);
}

/** Scroll the whole page once so every reveal has fired, then return to top. */
async function primeReveals(page) {
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    const step = innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 70));
    }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
}

const fileUrl = (rel) => 'file://' + path.join(ROOT, rel);

module.exports = { ROOT, EXE, VIDEO_EXE, SITES, serveFonts, settle, primeReveals, fileUrl };

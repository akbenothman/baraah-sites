// Renders the preview thumbnails used on the portfolio hub.
//
//   node tools/thumbs.js
//
// Each demo is captured at 1440x1000 and written as a JPEG to assets/img/.
// Re-run it whenever a demo site's design changes.
const { chromium } = require('playwright');
const path = require('path');

const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const ROOT = path.resolve(__dirname, '..');
const SITES = ['verano', 'lacquer', 'halo', 'ora', 'fig'];

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });

  for (const site of SITES) {
    await page.goto(`file://${ROOT}/sites/${site}/index.html`, { waitUntil: 'load' });
    // Let entrance animations settle before the shot.
    await page.waitForTimeout(2200);
    await page.screenshot({
      path: `${ROOT}/assets/img/thumb-${site}.jpg`,
      type: 'jpeg',
      quality: 82,
    });
    console.log('thumb ->', site);
  }

  await browser.close();
})().catch((e) => { console.error(e.message); process.exit(1); });

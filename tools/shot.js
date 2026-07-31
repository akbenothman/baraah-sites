// Screenshot helper used while building the sites.
//   node tools/shot.js <path-or-url> <out.png> [width] [fullPage] [scrollTo]
const { chromium } = require('playwright');
const path = require('path');

const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  const [target, out, width = '1440', full = '1', scrollTo = '0'] = process.argv.slice(2);
  const url = target.startsWith('http') || target.startsWith('file:')
    ? target
    : 'file://' + path.resolve(target);

  const browser = await chromium.launch({ executablePath: EXE });
  const page = await browser.newPage({
    viewport: { width: Number(width), height: 900 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(url, { waitUntil: 'load' });

  // Walk the page so every IntersectionObserver reveal fires, then return.
  await page.evaluate(async (top) => {
    if (!document.body) return;
    document.documentElement.style.scrollBehavior = 'auto';
    const step = innerHeight * 0.75;
    const pause = () => new Promise((r) => setTimeout(r, 90));
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      scrollTo(0, y);
      await pause();
    }
    scrollTo(0, Number(top));
    await pause();
  }, scrollTo);
  await page.waitForTimeout(1100);

  await page.screenshot({ path: out, fullPage: full === '1' });
  await browser.close();
  if (errors.length) console.error('page errors:\n  ' + errors.join('\n  '));
  console.log('ok ->', out);
})().catch((e) => { console.error(e.message); process.exit(1); });

// Renders the portfolio deck to PDF for the Fiverr gig gallery.
//
//   node tools/pdf.js
//
// Output: media/baraah-sites-portfolio.pdf (A4 landscape, 8 pages)
//
// Uses the cached webfonts (tools/fetch_fonts.py) so the type matches the
// sites themselves, and the gig screenshots from media/gallery.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { ROOT, EXE, serveFonts, fileUrl } = require('./capture');

const OUT = path.join(ROOT, 'media/baraah-sites-portfolio.pdf');

(async () => {
  if (!fs.existsSync(path.join(ROOT, 'media/gallery/verano.jpg'))) {
    throw new Error('No screenshots yet. Run: node tools/shots.js');
  }

  const browser = await chromium.launch({ executablePath: EXE });
  const page = await browser.newPage();
  await serveFonts(page);

  await page.goto(fileUrl('tools/deck/deck.html'), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);

  await page.pdf({
    path: OUT,
    printBackground: true,
    preferCSSPageSize: true,   // honours the @page rule in the deck
  });

  await browser.close();

  const mb = (fs.statSync(OUT).size / 1024 / 1024).toFixed(1);
  console.log(`wrote ${OUT} (${mb} MB)`);
})().catch((e) => { console.error(e.message); process.exit(1); });

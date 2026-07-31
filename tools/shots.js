// Builds the still images for a Fiverr gig gallery.
//
//   node tools/shots.js
//
// Writes to media/:
//   gallery/*.jpg   1280x769 (Fiverr's recommended gig image ratio), 2x for sharpness
//   full/*.jpg      the entire page top to bottom, for portfolio/work-sample slots
//
// Run tools/fetch_fonts.py first so the real typefaces are used.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { ROOT, EXE, SITES, serveFonts, settle, primeReveals, fileUrl } = require('./capture');

const GALLERY = path.join(ROOT, 'media/gallery');
const FULL = path.join(ROOT, 'media/full');

(async () => {
  fs.mkdirSync(GALLERY, { recursive: true });
  fs.mkdirSync(FULL, { recursive: true });

  const browser = await chromium.launch({ executablePath: EXE });

  for (const site of SITES) {
    // --- gallery still: 1280x769 at 2x ---
    const gallery = await browser.newPage({
      viewport: { width: 1280, height: 769 },
      deviceScaleFactor: 2,
    });
    await serveFonts(gallery);
    await gallery.goto(fileUrl(site.file), { waitUntil: 'load' });
    await settle(gallery);
    await gallery.screenshot({
      path: path.join(GALLERY, `${site.key}.jpg`),
      type: 'jpeg',
      quality: 92,
    });
    await gallery.close();

    // --- full page ---
    const full = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    await serveFonts(full);
    await full.goto(fileUrl(site.file), { waitUntil: 'load' });
    await settle(full, 900);
    await primeReveals(full);
    await full.screenshot({
      path: path.join(FULL, `${site.key}.jpg`),
      type: 'jpeg',
      quality: 88,
      fullPage: true,
    });
    await full.close();

    console.log('shot ->', site.key);
  }

  await browser.close();
})().catch((e) => { console.error(e.message); process.exit(1); });

// Records a single continuous scroll-through of the portfolio and all five
// demo sites, then encodes it to MP4 for a Fiverr gig video.
//
//   node tools/video.js
//
// Output: media/portfolio-walkthrough.mp4 (1280x720, ~60s, under Fiverr's
// 75-second limit). Run tools/fetch_fonts.py first for real typography.
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ROOT, EXE, SITES, serveFonts, fileUrl } = require('./capture');

const OUT = path.join(ROOT, 'media');
const TMP = path.join(ROOT, '.videotmp');
const FFMPEG = path.join(ROOT, 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg');

// seconds of scrolling per page — the hub gets longer, it's the pitch
const SCROLL_SECONDS = { hub: 10, verano: 7, lacquer: 7, halo: 6, ora: 7, fig: 7 };

/** Scroll top to bottom over `ms`, eased at both ends so it reads as a camera move. */
async function glide(page, ms) {
  await page.evaluate(async (duration) => {
    document.documentElement.style.scrollBehavior = 'auto';
    const max = document.body.scrollHeight - innerHeight;
    const start = performance.now();
    await new Promise((done) => {
      const frame = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
        scrollTo(0, max * eased);
        if (t < 1) requestAnimationFrame(frame);
        else done();
      };
      requestAnimationFrame(frame);
    });
  }, ms);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  fs.rmSync(TMP, { recursive: true, force: true });

  const browser = await chromium.launch({ executablePath: EXE });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: TMP, size: { width: 1280, height: 720 } },
  });

  // one page for the whole run, so navigations land in a single video file
  const page = await context.newPage();
  await serveFonts(page);

  for (const site of SITES) {
    await page.goto(fileUrl(site.file), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);          // hold on the hero
    await glide(page, SCROLL_SECONDS[site.key] * 1000);
    await page.waitForTimeout(400);           // beat at the footer
    console.log('filmed ->', site.key);
  }

  await page.close();
  await context.close();
  await browser.close();

  const webm = fs.readdirSync(TMP).find((f) => f.endsWith('.webm'));
  if (!webm) throw new Error('no video produced');

  const mp4 = path.join(OUT, 'portfolio-walkthrough.mp4');
  execFileSync(FFMPEG, [
    '-y', '-i', path.join(TMP, webm),
    // the recorder catches a few blank frames before the first paint
    '-ss', '0.17',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '21',
    '-pix_fmt', 'yuv420p',        // required for QuickTime and most players
    '-vf', 'scale=1280:720:flags=lanczos,fps=30',
    '-movflags', '+faststart',    // lets it start playing before fully loaded
    '-an', mp4,
  ], { stdio: 'pipe' });

  fs.rmSync(TMP, { recursive: true, force: true });

  const mb = (fs.statSync(mp4).size / 1024 / 1024).toFixed(1);
  console.log(`\nwrote ${mp4} (${mb} MB)`);
})().catch((e) => { console.error(e.message); process.exit(1); });

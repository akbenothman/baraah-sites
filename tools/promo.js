// Builds the short Fiverr gig video: an edited cut that shows the sites being
// *used*, not just scrolled.
//
//   node tools/promo.js
//
// Output: media/gig-promo.mp4 (1920x1080, ~48s)
//
// Each beat is filmed as its own clip, then the clips are concatenated with
// hard cuts. The interaction beats are the point — a buyer can see the colour
// wall re-theme a page and the schedule tabs swap, which is what separates a
// hand-built site from a template.
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ROOT, VIDEO_EXE, serveFonts, fileUrl } = require('./capture');

const OUT = path.join(ROOT, 'media');
const TMP = path.join(ROOT, '.promotmp');
const FFMPEG = path.join(ROOT, 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg');

/** Ease the page so `selector` sits nicely in frame. */
async function bring(page, selector, ms = 1100) {
  await page.evaluate(async ({ sel, duration }) => {
    document.documentElement.style.scrollBehavior = 'auto';
    const el = document.querySelector(sel);
    if (!el) return;
    const target = Math.max(0, Math.min(
      el.getBoundingClientRect().top + scrollY - innerHeight * 0.22,
      document.body.scrollHeight - innerHeight,
    ));
    const from = scrollY;
    const start = performance.now();
    await new Promise((done) => {
      const frame = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
        scrollTo(0, from + (target - from) * eased);
        if (t < 1) requestAnimationFrame(frame); else done();
      };
      requestAnimationFrame(frame);
    });
  }, { sel: selector, duration: ms });
}

/** Steady downward drift, for establishing shots. */
async function drift(page, ms, distance = 1500) {
  await page.evaluate(async ({ duration, dist }) => {
    document.documentElement.style.scrollBehavior = 'auto';
    const from = scrollY;
    const max = document.body.scrollHeight - innerHeight;
    const to = Math.min(from + dist, max);
    const start = performance.now();
    await new Promise((done) => {
      const frame = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
        scrollTo(0, from + (to - from) * eased);
        if (t < 1) requestAnimationFrame(frame); else done();
      };
      requestAnimationFrame(frame);
    });
  }, { duration: ms, dist: distance });
}

const wait = (page, ms) => page.waitForTimeout(ms);

/** Click without Playwright's instant scroll-jump ruining the shot. */
async function tap(page, selector, settle = 700) {
  const el = await page.$(selector);
  if (!el) return;
  const box = await el.boundingBox();
  if (!box) return;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 });
  await wait(page, 160);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await wait(page, settle);
}

// --- the beats ------------------------------------------------------------

const BEATS = [
  {
    name: '01-title',
    page: 'tools/cards/title.html',
    async run(page) { await wait(page, 3400); },
  },
  {
    name: '02-hub',
    page: 'index.html',
    async run(page) {
      await wait(page, 1500);
      await bring(page, '.cases', 1200);
      await wait(page, 400);
      await drift(page, 2600, 1250);
      await wait(page, 500);
    },
  },
  {
    name: '03-verano',
    page: 'sites/verano/index.html',
    async run(page) {
      await wait(page, 1400);
      await bring(page, '#shop', 1300);
      await wait(page, 500);
      await tap(page, '.card:nth-child(2) [data-add]', 1200);   // bag count ticks over
      await wait(page, 500);
    },
  },
  {
    name: '04-lacquer',
    page: 'sites/lacquer/index.html',
    async run(page) {
      await wait(page, 1200);
      await bring(page, '.swatches', 1200);
      await wait(page, 350);
      // the colour wall re-themes the page live
      await tap(page, '#swatches li:nth-child(3) button', 700);
      await tap(page, '#swatches li:nth-child(5) button', 700);
      await tap(page, '#swatches li:nth-child(6) button', 900);
    },
  },
  {
    name: '05-halo',
    page: 'sites/halo/index.html',
    async run(page) {
      await wait(page, 1100);
      await bring(page, '.pdp', 1200);
      await wait(page, 350);
      await tap(page, '#shades button[data-shade="2"]', 900);
      await tap(page, '#shades button[data-shade="3"]', 1000);
    },
  },
  {
    name: '06-ora',
    page: 'sites/ora/index.html',
    async run(page) {
      await wait(page, 1100);
      await bring(page, '#schedule', 1300);
      await wait(page, 300);
      await tap(page, '#days button[data-day="Wed"]', 800);
      await tap(page, '#days button[data-day="Sat"]', 900);
      await bring(page, '#pricing', 1100);
      await tap(page, '#toggle button[data-mode="year"]', 1000);
    },
  },
  {
    name: '07-fig',
    page: 'sites/fig/index.html',
    async run(page) {
      await wait(page, 1100);
      await bring(page, '#menu', 1300);
      await wait(page, 300);
      await tap(page, '#tabs button[data-tab="brunch"]', 900);
      await tap(page, '#tabs button[data-tab="wine"]', 1000);
    },
  },
  {
    name: '08-end',
    page: 'tools/cards/end.html',
    async run(page) { await wait(page, 3200); },
  },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });

  const browser = await chromium.launch({ executablePath: VIDEO_EXE });
  const clips = [];

  for (const beat of BEATS) {
    const dir = path.join(TMP, beat.name);
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      recordVideo: { dir, size: { width: 1920, height: 1080 } },
      reducedMotion: 'no-preference',
    });
    const page = await context.newPage();
    await serveFonts(page);
    await page.goto(fileUrl(beat.page), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await beat.run(page);
    await page.close();
    await context.close();

    const webm = fs.readdirSync(dir).find((f) => f.endsWith('.webm'));
    clips.push(path.join(dir, webm));
    console.log('filmed ->', beat.name);
  }

  await browser.close();

  // One encode, not two — re-encoding each clip and then re-encoding the join
  // stacks generation loss and softens the type. Trim the blank frames the
  // recorder catches before first paint, then concat in a single pass.
  const inputs = [];
  const filters = [];
  clips.forEach((clip, i) => {
    inputs.push('-i', clip);
    filters.push(`[${i}:v]trim=start=0.2,setpts=PTS-STARTPTS,fps=30,setsar=1[v${i}]`);
  });
  const chain = clips.map((_, i) => `[v${i}]`).join('');

  const final = path.join(OUT, 'gig-promo.mp4');
  execFileSync(FFMPEG, [
    '-y', ...inputs,
    '-filter_complex', `${filters.join(';')};${chain}concat=n=${clips.length}:v=1:a=0[out]`,
    '-map', '[out]',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-an', final,
  ], { stdio: 'pipe' });

  fs.rmSync(TMP, { recursive: true, force: true });

  const mb = (fs.statSync(final).size / 1024 / 1024).toFixed(1);
  console.log(`\nwrote ${final} (${mb} MB)`);
})().catch((e) => { console.error(e.message); process.exit(1); });

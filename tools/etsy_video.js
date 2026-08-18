// Builds the short Etsy listing video — a phone, scrolling, on brand.
//
//   node tools/etsy_video.js
//
// Output: media/etsy/listing-video.mp4 (1080x1080, ~13s, silent)
//
// Etsy allows 5-15 seconds and plays listing video muted, so this is a single
// unbroken shot with the offer burned in. Square fits both the listing page and
// the app. The site runs live inside an iframe rather than being a screen
// recording pasted onto a phone picture, so the scroll is the real thing.
const { chromium } = require('playwright');
const { execFileSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ROOT, VIDEO_EXE, serveFonts } = require('./capture');

const OUT = path.join(ROOT, 'media/etsy');
const TMP = path.join(ROOT, '.etsyvid');
const FFMPEG = path.join(ROOT, 'node_modules/@ffmpeg-installer/linux-x64/ffmpeg');
const PORT = 8899;
const SITE = 'lacquer';   // salons read closest to Etsy's own seller base

const STAGE = `<!DOCTYPE html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>
  *{margin:0;box-sizing:border-box}
  body{width:1080px;height:1080px;background:#0E0E10;color:#EAE7E0;overflow:hidden;
    font-family:'Inter','Helvetica Neue',system-ui,sans-serif;font-weight:300;
    display:flex;flex-direction:column;align-items:center;padding:44px 0 40px;
    -webkit-font-smoothing:antialiased}
  .mark{display:flex;align-items:center;gap:11px;font-size:23px;letter-spacing:-.02em}
  .mark i{width:15px;height:15px;border-radius:50%;background:#D8CFC0;display:block}
  .phone{width:404px;background:#22222A;border-radius:58px;padding:15px;margin-top:26px;
    box-shadow:0 50px 90px -34px rgba(0,0,0,.95);position:relative}
  .screen{border-radius:44px;overflow:hidden;background:#000;width:374px;height:770px;
    position:relative}
  iframe{width:374px;height:770px;border:0;display:block}
  .notch{position:absolute;top:32px;left:50%;transform:translateX(-50%);width:116px;
    height:25px;border-radius:16px;background:#0b0b0e;z-index:3}
  .cap{margin-top:auto;text-align:center}
  .cap b{display:block;font-size:37px;font-weight:300;letter-spacing:-.025em}
  .cap b em{font-family:'Instrument Serif',Georgia,serif;font-style:italic;color:#D8CFC0}
  .cap span{display:block;margin-top:11px;font-size:19px;letter-spacing:.19em;
    text-transform:uppercase;color:#8E8B84}
</style></head><body>
  <div class="mark"><i></i> baraah-sites</div>
  <div class="phone"><div class="notch"></div>
    <div class="screen"><iframe id="f" src="/sites/${SITE}/index.html"></iframe></div>
  </div>
  <div class="cap">
    <b>Custom websites, <em>hand-built</em>.</b>
    <span>Live in 3 days &nbsp;·&nbsp; You own the files</span>
  </div>
</body></html>`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });

  const stagePath = path.join(ROOT, 'build/etsy-video.html');
  fs.mkdirSync(path.dirname(stagePath), { recursive: true });
  fs.writeFileSync(stagePath, STAGE);

  // Chromium blocks file:// iframes across directories, so serve the repo.
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'],
    { cwd: ROOT, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 1200));

  try {
    const browser = await chromium.launch({ executablePath: VIDEO_EXE });
    const ctx = await browser.newContext({
      viewport: { width: 1080, height: 1080 },
      recordVideo: { dir: TMP, size: { width: 1080, height: 1080 } },
    });
    const page = await ctx.newPage();
    await serveFonts(page);
    await page.goto(`http://127.0.0.1:${PORT}/build/etsy-video.html`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1800);          // hold on the hero

    // scroll the site inside the phone, eased at both ends
    await page.evaluate(async () => {
      const win = document.getElementById('f').contentWindow;
      const doc = win.document;
      doc.documentElement.style.scrollBehavior = 'auto';
      const max = doc.body.scrollHeight - win.innerHeight;
      const start = performance.now();
      const ms = 9500;
      await new Promise((done) => {
        const frame = (now) => {
          const t = Math.min(1, (now - start) / ms);
          const eased = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
          win.scrollTo(0, max * eased * 0.86);
          if (t < 1) requestAnimationFrame(frame); else done();
        };
        requestAnimationFrame(frame);
      });
    });
    await page.waitForTimeout(900);

    await page.close();
    await ctx.close();
    await browser.close();

    const webm = fs.readdirSync(TMP).find((f) => f.endsWith('.webm'));
    const mp4 = path.join(OUT, 'listing-video.mp4');
    execFileSync(FFMPEG, [
      '-y', '-i', path.join(TMP, webm), '-ss', '0.2',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '19',
      '-pix_fmt', 'yuv420p', '-vf', 'fps=30', '-movflags', '+faststart',
      '-an', mp4,
    ], { stdio: 'pipe' });

    const mb = (fs.statSync(mp4).size / 1024 / 1024).toFixed(1);
    console.log(`wrote ${mp4} (${mb} MB)`);
  } finally {
    server.kill();
    fs.rmSync(TMP, { recursive: true, force: true });
    fs.rmSync(stagePath, { force: true });
  }
})().catch((e) => { console.error(e.message); process.exit(1); });

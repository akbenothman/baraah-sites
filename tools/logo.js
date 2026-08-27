// Builds the Etsy shop icon and banner, in every size Etsy asks for.
//
//   node tools/logo.js
//
// Output: media/etsy/logo/
//
// Four icon options, all the same identity — the lowercase serif `b` and the
// brand dot already used across the sites — so this reads as a colour choice,
// not four unrelated logos. The contact sheet renders each one at 48px next to
// its full size, because an Etsy shop icon spends most of its life about that
// big in search results, and a mark that only works at 500px is the wrong mark.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { ROOT, EXE, serveFonts } = require('./capture');

const OUT = path.join(ROOT, 'media/etsy/logo');

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">`;

const BASE = `*{margin:0;box-sizing:border-box}
  body{overflow:hidden;-webkit-font-smoothing:antialiased;
    font-family:'Inter','Helvetica Neue',system-ui,sans-serif;font-weight:300}
  .serif{font-family:'Instrument Serif',Georgia,serif}`;

/* --- the palettes -------------------------------------------------------- */
const THEMES = {
  a: { name: 'Ink',   bg: '#0E0E10', fg: '#EAE7E0', dot: '#D8CFC0' },
  b: { name: 'Clay',  bg: '#B4562F', fg: '#F6EFE6', dot: '#F6EFE6' },
  c: { name: 'Cream', bg: '#F3EBDD', fg: '#1C1A17', dot: '#B4562F' },
  d: { name: 'Sand',  bg: '#D8CFC0', fg: '#1C1A17', dot: '#B4562F' },
};

/* --- icon 1: the monogram ------------------------------------------------
   The `b` set in Instrument Serif italic with the brand dot as a full stop on
   the baseline — "b." — so the two sit as one lockup rather than a letter with
   something floating near it. Heaviest strokes of the four, so it shrinks well. */
const monogram = (t) => `<!DOCTYPE html><html><head><meta charset="utf-8">${FONTS}<style>${BASE}
  body{width:500px;height:500px;background:${t.bg};display:grid;place-items:center}
  .m{display:flex;align-items:flex-end;gap:14px;transform:translate(-10px,6px)}
  .g{font-size:340px;line-height:.74;color:${t.fg};font-style:italic}
  .d{width:50px;height:50px;border-radius:50%;background:${t.dot};margin-bottom:8px}
</style></head><body>
  <div class="m"><div class="g serif">b</div><div class="d"></div></div>
</body></html>`;

/* --- icon 2: the window --------------------------------------------------
   Says "website" before anyone has read the shop name, which matters in a
   search grid. Built as a bezel — an outer fill with an inset screen — rather
   than a border, so the corner radii nest instead of fighting each other. */
const window_ = (t) => `<!DOCTYPE html><html><head><meta charset="utf-8">${FONTS}<style>${BASE}
  body{width:500px;height:500px;background:${t.bg};display:grid;place-items:center}
  .w{width:348px;height:268px;border-radius:36px;background:${t.fg};
    padding:64px 15px 15px;position:relative}
  .dots{position:absolute;top:24px;left:28px;display:flex;gap:15px}
  .dots i{width:19px;height:19px;border-radius:50%;background:${t.bg};opacity:.28}
  .dots i:first-child{background:${t.dot};opacity:1}
  .screen{width:100%;height:100%;background:${t.bg};border-radius:24px;
    display:grid;place-items:center}
  .screen span{font-size:200px;line-height:.74;color:${t.fg};font-style:italic;
    transform:translate(-4px,14px)}
</style></head><body>
  <div class="w"><div class="dots"><i></i><i></i><i></i></div>
  <div class="screen"><span class="serif">b</span></div></div>
</body></html>`;

/* --- icon 3: the stacked wordmark ----------------------------------------
   Trades small-size legibility for name recall. Good as a banner lockup or a
   profile picture; weakest of the four at 48px, which the sheet shows. */
const stack = (t) => `<!DOCTYPE html><html><head><meta charset="utf-8">${FONTS}<style>${BASE}
  body{width:500px;height:500px;background:${t.bg};display:grid;place-items:center;
    color:${t.fg}}
  .s{text-align:center}
  .s i{display:block;width:34px;height:34px;border-radius:50%;background:${t.dot};
    margin:0 auto 30px}
  .s b{display:block;font-size:66px;font-weight:300;letter-spacing:.01em;line-height:1}
  .s em{display:block;font-size:86px;font-style:italic;line-height:1;margin-top:4px;
    color:${t.dot}}
</style></head><body>
  <div class="s"><i></i><b>baraah</b><em class="serif">sites</em></div>
</body></html>`;

/* --- icon 4: the dot ------------------------------------------------------
   The mark from the site nav, alone. Nothing to misread at any size; carries
   no meaning on its own until the shop is known. */
const dot = (t) => `<!DOCTYPE html><html><head><meta charset="utf-8">${FONTS}<style>${BASE}
  body{width:500px;height:500px;background:${t.bg};display:grid;place-items:center}
  .r{width:300px;height:300px;border-radius:50%;background:${t.dot};
    display:grid;place-items:center}
  .r span{font-size:230px;line-height:.74;color:${t.bg};font-style:italic;
    transform:translate(-5px,12px)}
</style></head><body>
  <div class="r"><span class="serif">b</span></div>
</body></html>`;

/* --- the banner lockup ---------------------------------------------------
   One template at two aspect ratios: Etsy's big banner (1600x400) and the
   wide carousel slot (3360x840). Everything is sized in vw so the same markup
   scales exactly rather than being re-tuned per size. */
const banner = (t) => `<!DOCTYPE html><html><head><meta charset="utf-8">${FONTS}<style>${BASE}
  body{width:100vw;height:100vh;background:${t.bg};color:${t.fg};
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    gap:1.5vw;text-align:center;padding-top:1.1vw}
  .mark{display:flex;align-items:center;gap:1.15vw;font-size:4.4vw;letter-spacing:-.03em;
    font-weight:300}
  .mark i{width:2.05vw;height:2.05vw;border-radius:50%;background:${t.dot};display:block}
  .mark em{font-style:italic;color:${t.dot}}
  .sub{font-size:1.32vw;letter-spacing:.34em;text-transform:uppercase;opacity:.62}
</style></head><body>
  <div class="mark"><i></i>baraah<em class="serif">sites</em></div>
  <div class="sub">Custom websites &nbsp;·&nbsp; hand-built &nbsp;·&nbsp; live in 3 days</div>
</body></html>`;

const ICONS = { monogram, window: window_, stack, dot };

/* --- the pink colourway ---------------------------------------------------
   Sand ground, pink accent. Rendered for the window mark only, and that is a
   deliberate limit rather than an oversight: in the window the accent dot sits
   on the dark bar, where a pale pink has plenty of contrast. In the other three
   marks the accent lands straight on the sand, and pale-on-pale goes muddy.

   The banner flips to an ink ground for the same reason — pink "sites" on sand
   is close to unreadable, on near-black it sings, and the ink also ties back to
   the dark bar inside the icon. */
const PINKS = {
  blush: '#F2C4C4',   // clean, unambiguously pink
  rose:  '#EDBAB4',   // dustier, closest to the clay already in the palette
  petal: '#E8AFB8',   // cooler, the most saturated of the four
  shell: '#F6D2CE',   // palest
};

const sandPink = (hex) => ({ name: 'Sand', bg: '#D8CFC0', fg: '#1C1A17', dot: hex });
const inkPink = (hex) => ({ name: 'Ink', bg: '#0E0E10', fg: '#EAE7E0', dot: hex });

async function shoot(page, html, out, w, h, scale = 2) {
  const tmp = path.join(ROOT, 'build/logo-tmp.html');
  fs.writeFileSync(tmp, html);
  await page.setViewportSize({ width: w, height: h });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('file://' + tmp, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(180);
  await page.screenshot({ path: out, scale: scale === 2 ? 'device' : 'css' });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(path.join(ROOT, 'build'), { recursive: true });

  const browser = await chromium.launch({ executablePath: EXE });
  const ctx = await browser.newContext({ deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await serveFonts(page);

  const made = [];
  for (const [shape, fn] of Object.entries(ICONS)) {
    for (const [key, theme] of Object.entries(THEMES)) {
      const file = path.join(OUT, `icon-${shape}-${key}.png`);
      await shoot(page, fn(theme), file, 500, 500);
      made.push({ shape, key, theme, file });
    }
  }

  // Banners, in both slots Etsy offers. Same 4:1 markup both times — everything
  // in the lockup is sized in vw, so the wide one is a true scale-up, and it is
  // rendered at 1680x420 under a 2x scale factor to land on 3360x840 exactly.
  for (const [key, theme] of Object.entries(THEMES)) {
    await shoot(page, banner(theme), path.join(OUT, `banner-${key}-1600x400.png`), 1600, 400, 1);
    await shoot(page, banner(theme), path.join(OUT, `banner-${key}-3360x840.png`), 1680, 420);
  }

  // --- the pink colourway, one file per shade so the choice is a file pick ---
  const pinks = [];
  for (const [shade, hex] of Object.entries(PINKS)) {
    const file = path.join(OUT, `icon-window-sand-${shade}.png`);
    await shoot(page, window_(sandPink(hex)), file, 500, 500);
    pinks.push({ shade, hex, file });
    await shoot(page, banner(inkPink(hex)),
      path.join(OUT, `banner-ink-${shade}-1600x400.png`), 1600, 400, 1);
    await shoot(page, banner(inkPink(hex)),
      path.join(OUT, `banner-ink-${shade}-3360x840.png`), 1680, 420);
  }

  // --- contact sheet: every option, plus the size it actually gets seen at ---
  const cell = (m) => `<figure>
    <img class="big" src="file://${m.file}" alt="">
    <div class="row">
      <img class="sm" src="file://${m.file}" alt="">
      <img class="sm circ" src="file://${m.file}" alt="">
      <span>${m.shape} · ${m.theme.name}</span>
    </div>
  </figure>`;

  const sheet = `<!DOCTYPE html><html><head><meta charset="utf-8">${FONTS}<style>${BASE}
    body{width:1500px;background:#1A1A1E;color:#EAE7E0;padding:56px;overflow:auto}
    h1{font-size:30px;font-weight:300;letter-spacing:-.03em;margin-bottom:6px}
    p{color:#8E8B84;font-size:14px;margin-bottom:40px}
    .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:38px 30px}
    figure{margin:0}
    .big{width:100%;border-radius:18px;display:block}
    .row{display:flex;align-items:center;gap:12px;margin-top:12px;
      font-size:12px;color:#8E8B84;letter-spacing:.04em}
    .sm{width:48px;height:48px;border-radius:9px}
    .sm.circ{border-radius:50%}
  </style></head><body>
    <h1>Etsy shop icon — options</h1>
    <p>Full size, then the two ways Etsy actually crops it: 48px rounded square
       (search, listings) and 48px circle (shop header, reviews).</p>
    <div class="grid">${made.map(cell).join('')}</div>
  </body></html>`;

  const sheetFile = path.join(ROOT, 'build/logo-sheet.html');
  fs.writeFileSync(sheetFile, sheet);
  await page.setViewportSize({ width: 1500, height: 600 });
  await page.goto('file://' + sheetFile, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, 'options.png'), fullPage: true });

  // --- pink shades, judged on white, because that is Etsy's page colour ------
  const pinkSheet = `<!DOCTYPE html><html><head><meta charset="utf-8">${FONTS}<style>${BASE}
    body{width:1500px;background:#fff;color:#1C1A17;padding:56px;overflow:auto}
    h1{font-size:30px;font-weight:300;letter-spacing:-.03em;margin-bottom:6px}
    p{color:#6B665F;font-size:14px;margin-bottom:40px}
    .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:30px}
    figure{margin:0}
    .big{width:100%;border-radius:18px;display:block}
    .row{display:flex;align-items:center;gap:12px;margin-top:14px;
      font-size:12px;color:#6B665F;letter-spacing:.04em}
    .sm{width:48px;height:48px;border-radius:9px}
    .sm.circ{border-radius:50%}
    .row b{font-weight:400;color:#1C1A17;text-transform:capitalize}
    .bn{margin-top:12px;width:100%;border-radius:8px;display:block}
  </style></head><body>
    <h1>Window · Sand — pink shades</h1>
    <p>On white, because that is what an Etsy page is. Each one shown full size,
       at 48px square and 48px circle, then with its matching ink banner.</p>
    <div class="grid">${pinks.map((p) => `<figure>
      <img class="big" src="file://${p.file}" alt="">
      <div class="row">
        <img class="sm" src="file://${p.file}" alt="">
        <img class="sm circ" src="file://${p.file}" alt="">
        <span><b>${p.shade}</b><br>${p.hex}</span>
      </div>
      <img class="bn" src="file://${path.join(OUT, `banner-ink-${p.shade}-1600x400.png`)}" alt="">
    </figure>`).join('')}</div>
  </body></html>`;

  fs.writeFileSync(sheetFile, pinkSheet);
  await page.goto('file://' + sheetFile, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, 'options-pink.png'), fullPage: true });

  await browser.close();
  fs.rmSync(path.join(ROOT, 'build/logo-tmp.html'), { force: true });
  console.log(`${made.length} icons + 8 banners -> ${OUT}`);
})().catch((e) => { console.error(e); process.exit(1); });

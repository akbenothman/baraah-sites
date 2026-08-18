// Builds the Etsy listing gallery — ten square 2000x2000 images.
//
//   node tools/etsy_images.js
//
// Output: media/etsy/01-thumbnail.jpg … 10-choose.jpg
//
// Square because Etsy crops to different ratios across search, the listing page
// and the app; a square never loses anything important. Dark, because Etsy's UI
// is white and every competing listing in this category is pastel — this stands
// out in the grid, which is the thumbnail's only job.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { ROOT, EXE, serveFonts, settle, fileUrl } = require('./capture');

const OUT = path.join(ROOT, 'media/etsy');
const PHONE = path.join(ROOT, 'build/phone');

const SITES = [
  { key: 'verano', name: 'Verano', kind: 'Coffee, bakery & food retail' },
  { key: 'lacquer', name: 'Lacquer', kind: 'Salons, barbers & appointments' },
  { key: 'halo', name: 'Halo', kind: 'Product brands & e-commerce' },
  { key: 'ora', name: 'Ora', kind: 'Studios, gyms & memberships' },
  { key: 'fig', name: 'Fig & Vine', kind: 'Restaurants, bars & hospitality' },
];

/** Capture each demo at phone width — needed for the mobile-proof tile. */
async function phoneShots(browser) {
  fs.mkdirSync(PHONE, { recursive: true });
  for (const s of SITES) {
    const p = await browser.newPage({
      viewport: { width: 430, height: 932 }, deviceScaleFactor: 2,
    });
    await serveFonts(p);
    await p.goto(fileUrl(`sites/${s.key}/index.html`), { waitUntil: 'load' });
    await settle(p, 1600);
    await p.screenshot({ path: path.join(PHONE, `${s.key}.jpg`), type: 'jpeg', quality: 92 });
    await p.close();
  }
}

const CSS = `
  @font-face{font-family:x}
  *{margin:0;box-sizing:border-box}
  body{background:#0E0E10;color:#EAE7E0;
    font-family:'Inter','Helvetica Neue',system-ui,sans-serif;font-weight:300;
    -webkit-font-smoothing:antialiased}
  .tile{width:2000px;height:2000px;padding:130px;display:flex;flex-direction:column;
    position:relative;overflow:hidden;background:#0E0E10}
  .mark{display:flex;align-items:center;gap:18px;font-size:38px;letter-spacing:-.02em}
  .mark i{width:26px;height:26px;border-radius:50%;background:#D8CFC0;display:block}
  h1{font-size:150px;line-height:.98;letter-spacing:-.045em;font-weight:300}
  h2{font-size:104px;line-height:1.02;letter-spacing:-.04em;font-weight:300}
  em{font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-weight:400;color:#D8CFC0}
  .eyebrow{font-size:30px;letter-spacing:.24em;text-transform:uppercase;color:#8E8B84}
  .sub{font-size:48px;color:#8E8B84;line-height:1.4}
  .fill{flex:1;display:flex;flex-direction:column;justify-content:center}
  .foot{margin-top:auto;padding-top:44px;border-top:2px solid rgba(234,231,224,.16);
    display:flex;justify-content:space-between;align-items:center;
    font-size:28px;letter-spacing:.18em;text-transform:uppercase;color:#8E8B84}

  /* device frames */
  .laptop{width:100%;background:#22222A;border-radius:34px;padding:26px;
    box-shadow:0 60px 120px -40px rgba(0,0,0,.9)}
  .laptop .screen{border-radius:14px;overflow:hidden;background:#000;aspect-ratio:16/10}
  .laptop img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
  .laptop .base{height:20px;background:#2E2E38;border-radius:0 0 22px 22px;
    margin:16px -70px -18px;box-shadow:0 26px 50px -26px rgba(0,0,0,.9)}
  .phone{width:520px;background:#22222A;border-radius:74px;padding:20px;
    box-shadow:0 60px 120px -40px rgba(0,0,0,.9);position:relative}
  .phone .screen{border-radius:56px;overflow:hidden;background:#000;aspect-ratio:430/932}
  .phone img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
  .phone .notch{position:absolute;top:44px;left:50%;transform:translateX(-50%);
    width:150px;height:32px;border-radius:20px;background:#0b0b0e;z-index:2}

  .list{display:grid;gap:34px;margin-top:66px}
  .list li{list-style:none;font-size:52px;color:#EAE7E0;position:relative;padding-left:80px}
  .list li:before{content:'✓';position:absolute;left:0;color:#D8CFC0}
  .list li span{color:#8E8B84}

  .tiers{display:grid;grid-template-columns:repeat(3,1fr);gap:34px;margin-top:80px}
  .tier{background:#151518;border-radius:28px;padding:56px 46px;display:flex;flex-direction:column}
  .tier.best{background:#1A1A1E;box-shadow:inset 0 0 0 3px rgba(216,207,192,.34)}
  .tier b{font-size:30px;letter-spacing:.16em;text-transform:uppercase;color:#8E8B84;font-weight:400}
  .tier .p{font-size:96px;letter-spacing:-.04em;color:#D8CFC0;margin:22px 0 8px;line-height:1}
  .tier .d{font-size:34px;color:#8E8B84}
  .tier u{text-decoration:none;font-size:34px;color:#EAE7E0;margin-top:auto;padding-top:34px;
    border-top:2px solid rgba(234,231,224,.16)}

  .steps{display:grid;gap:46px;margin-top:80px}
  .step{display:flex;gap:44px;align-items:flex-start}
  .step b{font-family:'Instrument Serif',Georgia,serif;font-size:86px;color:#D8CFC0;
    font-weight:400;line-height:1;min-width:110px}
  .step .t{font-size:54px;letter-spacing:-.02em}
  .step .s{font-size:38px;color:#8E8B84;margin-top:10px;line-height:1.4}

  .grid5{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-top:64px}
  .cell{border-radius:20px;overflow:hidden;background:#1A1A1E;box-shadow:inset 0 0 0 2px rgba(234,231,224,.13)}
  .cell img{width:100%;aspect-ratio:16/10;object-fit:cover;object-position:top center;display:block}
  .cell p{padding:22px 26px;font-size:27px;color:#8E8B84;line-height:1.35}
  .cell p b{color:#EAE7E0;font-weight:400;display:block;font-size:34px;margin-bottom:5px}
`;

// absolute, so the tile file can live anywhere without breaking the images
const shot = (site) => 'file://' + path.join(ROOT, `media/gallery/${site}.jpg`);
const phone = (site) => 'file://' + path.join(PHONE, `${site}.jpg`);

function tiles() {
  const demo = (s, i) => `
  <section class="tile">
    <div class="mark"><i></i> baraah-sites</div>
    <div class="fill">
      <p class="eyebrow">Design 0${i} · ${s.kind}</p>
      <h2 style="margin:26px 0 60px">${s.name}</h2>
      <div class="laptop"><div class="screen"><img src="${shot(s.key)}"></div><div class="base"></div></div>
    </div>
    <div class="foot"><span>One of five designs</span><span>baraah-sites</span></div>
  </section>`;

  return `
  <!-- 01 thumbnail -->
  <section class="tile">
    <div class="mark"><i></i> baraah-sites</div>
    <div class="fill">
      <h1>Custom<br>website<br><em>design.</em></h1>
      <p class="sub" style="margin-top:44px">Hand-coded · Live in 3 days · You own the files</p>
      <div class="laptop" style="margin-top:70px"><div class="screen">
        <img src="${shot('verano')}"></div><div class="base"></div></div>
    </div>
  </section>

  <!-- 02 mobile -->
  <section class="tile">
    <div class="mark"><i></i> baraah-sites</div>
    <div class="fill" style="align-items:center">
      <h2 style="text-align:center">Looks right on<br><em>every phone.</em></h2>
      <div class="phone" style="margin-top:80px"><div class="notch"></div>
        <div class="screen"><img src="${phone('lacquer')}"></div></div>
    </div>
    <div class="foot"><span>Mobile first, always</span><span>baraah-sites</span></div>
  </section>

  <!-- 03 what's included -->
  <section class="tile">
    <div class="mark"><i></i> baraah-sites</div>
    <div class="fill">
      <p class="eyebrow">What you get</p>
      <h2 style="margin-top:26px">Everything,<br><em>and the files.</em></h2>
      <ul class="list">
        <li>A custom site, up to 5 pages</li>
        <li>Hand-coded <span>— no Wix, no page builder</span></li>
        <li>Fast on phones, tablets and desktop</li>
        <li>Working contact or booking form</li>
        <li>Basic SEO so Google can find you</li>
        <li>All source files <span>— you own it outright</span></li>
      </ul>
    </div>
    <div class="foot"><span>No monthly fees, ever</span><span>baraah-sites</span></div>
  </section>

  ${demo(SITES[1], 2)}
  ${demo(SITES[2], 3)}
  ${demo(SITES[3], 4)}
  ${demo(SITES[4], 5)}

  <!-- 08 pricing -->
  <section class="tile">
    <div class="mark"><i></i> baraah-sites</div>
    <div class="fill">
      <p class="eyebrow">Pick a size</p>
      <h2 style="margin-top:26px">Three ways in.</h2>
      <div class="tiers">
        <div class="tier"><b>Landing page</b><span class="p">$99</span>
          <span class="d">One page, done properly</span><u>3 days · 1 revision</u></div>
        <div class="tier best"><b>Full website</b><span class="p">$199</span>
          <span class="d">Up to 5 pages</span><u>2 days · 3 revisions</u></div>
        <div class="tier"><b>Online store</b><span class="p">$349</span>
          <span class="d">Products and checkout</span><u>1 day · unlimited</u></div>
      </div>
    </div>
    <div class="foot"><span>$39 homepage concept if you'd rather see it first</span><span>baraah-sites</span></div>
  </section>

  <!-- 09 how it works -->
  <section class="tile">
    <div class="mark"><i></i> baraah-sites</div>
    <div class="fill">
      <p class="eyebrow">How it works</p>
      <h2 style="margin-top:26px">No calls. No fuss.</h2>
      <div class="steps">
        <div class="step"><b>01</b><div><div class="t">You order and pick a design</div>
          <div class="s">Tell me which of the five fits your business</div></div></div>
        <div class="step"><b>02</b><div><div class="t">I send a questionnaire</div>
          <div class="s">Within 24 hours — your colours, words, photos</div></div></div>
        <div class="step"><b>03</b><div><div class="t">You get a live preview</div>
          <div class="s">A real working page, not a mockup</div></div></div>
        <div class="step"><b>04</b><div><div class="t">You ask for changes</div>
          <div class="s">Revisions included with every package</div></div></div>
        <div class="step"><b>05</b><div><div class="t">I hand over every file</div>
          <div class="s">Yours to keep. No subscription, no lock-in</div></div></div>
      </div>
    </div>
  </section>

  <!-- 10 choose -->
  <section class="tile">
    <div class="mark"><i></i> baraah-sites</div>
    <div class="fill">
      <h2>Five designs.<br><em>Pick yours.</em></h2>
      <div class="grid5">
        ${SITES.map((s) => `<div class="cell"><img src="${shot(s.key)}">
          <p><b>${s.name}</b>${s.kind}</p></div>`).join('')}
      </div>
    </div>
  </section>`;
}

const NAMES = ['01-thumbnail', '02-mobile', '03-included', '04-lacquer', '05-halo',
               '06-ora', '07-fig', '08-pricing', '09-how-it-works', '10-choose'];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: EXE });

  console.log('capturing phone views…');
  await phoneShots(browser);

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>${tiles()}</body></html>`;

  const tmp = path.join(ROOT, 'build/etsy-tiles.html');
  fs.writeFileSync(tmp, html);

  const page = await browser.newPage({ viewport: { width: 2000, height: 2000 } });
  await serveFonts(page);
  await page.goto('file://' + tmp, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);

  const els = await page.$$('.tile');
  for (const [i, el] of els.entries()) {
    await el.screenshot({ path: path.join(OUT, `${NAMES[i]}.jpg`), type: 'jpeg', quality: 92 });
    console.log('  ', NAMES[i]);
  }

  await browser.close();
  fs.unlinkSync(tmp);
})().catch((e) => { console.error(e.message); process.exit(1); });

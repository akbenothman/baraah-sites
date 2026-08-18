// Renders the setup guide that ships inside each template download.
//
//   node tools/guide.js
//
// One PDF per template, written to build/guides/<site>.pdf. Each is tailored:
// it lists that template's real colour variables and its real section names,
// so a buyer can find the thing they want to change without reading code.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { ROOT, EXE, serveFonts } = require('./capture');

const OUT = path.join(ROOT, 'build/guides');

const TEMPLATES = {
  verano:  { name: 'Verano',      kind: 'Coffee shop, bakery & food retail' },
  lacquer: { name: 'Lacquer',     kind: 'Salons, barbers & appointment businesses' },
  halo:    { name: 'Halo',        kind: 'Product brands & small e-commerce' },
  ora:     { name: 'Ora',         kind: 'Studios, gyms & membership businesses' },
  fig:     { name: 'Fig & Vine',  kind: 'Restaurants, bars & hospitality' },
};

/** The section comments as they actually appear in that template's index.html. */
function sections(site) {
  const html = fs.readFileSync(path.join(ROOT, `sites/${site}/index.html`), 'utf8');
  return [...html.matchAll(/<!--([^>]*)-->/g)]
    .map((m) => m[1].replace(/[\u2500-\u257F]/g, '').trim())
    .filter(Boolean);
}

/** Pull the palette straight out of the template's stylesheet. */
function palette(site) {
  const css = fs.readFileSync(path.join(ROOT, `sites/${site}/css/style.css`), 'utf8');
  const root = /:root\{([\s\S]*?)\}/.exec(css);
  if (!root) return [];
  return [...root[1].matchAll(/--([a-z0-9-]+):\s*(#[0-9A-Fa-f]{3,8})/g)]
    .map((m) => ({ name: `--${m[1]}`, hex: m[2].toUpperCase() }))
    .slice(0, 8);
}

const page = (site, t) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>${t.name} — Setup Guide</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 0 }
  *{margin:0;box-sizing:border-box}
  body{font:300 10.5pt/1.62 'Inter','Helvetica Neue',system-ui,sans-serif;
    color:#1c1a17;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .pg{width:210mm;height:297mm;padding:20mm 20mm 16mm;display:flex;flex-direction:column;
    break-after:page;page-break-after:always;position:relative}
  .pg:last-child{break-after:auto;page-break-after:auto}
  .mark{display:flex;align-items:center;gap:2.2mm;font-size:9.5pt;letter-spacing:-.02em}
  .mark i{width:2.8mm;height:2.8mm;border-radius:50%;background:#b4562f;display:block}
  h1{font-size:30pt;line-height:1.05;letter-spacing:-.03em;font-weight:300;margin:14mm 0 4mm}
  h1 em{font-family:'Instrument Serif',Georgia,serif;font-style:italic;color:#b4562f}
  h2{font-size:15pt;font-weight:400;letter-spacing:-.02em;margin:9mm 0 3mm}
  h3{font-size:11pt;font-weight:500;margin:6mm 0 1.5mm}
  p{margin:0 0 3mm;color:#4a4540}
  .lead{font-size:12pt;color:#4a4540;max-width:60ch}
  .eyebrow{font-size:7.5pt;letter-spacing:.22em;text-transform:uppercase;color:#b4562f;font-weight:600}
  ol,ul{margin:0 0 4mm;padding-left:6mm;color:#4a4540}
  li{margin-bottom:1.8mm}
  code{font:10pt ui-monospace,Menlo,Consolas,monospace;background:#f4efe9;
    padding:.6mm 1.4mm;border-radius:1mm;color:#1c1a17}
  pre{background:#221f1c;color:#f2ece4;border-radius:2mm;padding:5mm 6mm;margin:0 0 4mm;
    font:9pt/1.6 ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap}
  .box{border:.35mm solid #e5ded4;border-radius:2.5mm;padding:6mm;margin:0 0 5mm;background:#fbf8f4}
  .warn{border-left:1mm solid #b4562f;background:#fdf1ea;border-radius:0 2mm 2mm 0;
    padding:5mm 6mm;margin:0 0 5mm}
  .swatches{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;margin:0 0 4mm}
  .sw{border:.3mm solid #e5ded4;border-radius:2mm;overflow:hidden}
  .sw .chip{height:14mm}
  .sw .meta{padding:2mm 2.5mm}
  .sw b{display:block;font:9pt ui-monospace,Menlo,monospace;font-weight:500}
  .sw span{font-size:7.5pt;color:#4a4540}
  table{width:100%;border-collapse:collapse;font-size:9.5pt;margin:0 0 4mm}
  th{text-align:left;font-size:7.5pt;letter-spacing:.1em;text-transform:uppercase;
    color:#4a4540;border-bottom:.5mm solid #1c1a17;padding:2mm}
  td{padding:2mm;border-bottom:.3mm solid #e5ded4;vertical-align:top;color:#4a4540}
  .foot{margin-top:auto;padding-top:4mm;border-top:.3mm solid #e5ded4;display:flex;
    justify-content:space-between;font-size:7.5pt;letter-spacing:.14em;text-transform:uppercase;color:#8a837a}
</style></head><body>

<section class="pg">
  <div class="mark"><i></i> baraah-sites</div>
  <p class="eyebrow" style="margin-top:12mm">${t.kind}</p>
  <h1>${t.name}<br><em>setup guide</em></h1>
  <p class="lead">Everything in this template is plain HTML and CSS. There is no
  software to install, no account to make and nothing to sign up for. If you can
  use a text editor, you can change every word, colour and picture in here.</p>

  <h2>What's in the folder</h2>
  <table>
    <tr><th>File</th><th>What it's for</th></tr>
    <tr><td><code>index.html</code></td><td>All the words and the page structure. This is the file you'll edit most.</td></tr>
    <tr><td><code>css/style.css</code></td><td>All the colours, fonts and spacing.</td></tr>
    <tr><td><code>js/main.js</code></td><td>The interactive bits — menus, forms, tabs. You can leave this alone.</td></tr>
    <tr><td><code>img/</code></td><td>Every picture on the page. Replace these with your own.</td></tr>
    <tr><td><code>SETUP-GUIDE.pdf</code></td><td>This document.</td></tr>
  </table>

  <h2>Opening it</h2>
  <ol>
    <li>Unzip the folder anywhere on your computer.</li>
    <li>Double-click <code>index.html</code> — it opens in your browser. That's the whole site, running on your machine.</li>
    <li>To edit, open the folder in a free text editor. <strong>VS Code</strong>
        (code.visualstudio.com) is the usual choice, but Notepad or TextEdit work too.</li>
  </ol>
  <div class="warn">
    <p style="margin:0"><strong>Before you change anything:</strong> duplicate the whole
    folder and keep a copy. If an edit goes wrong, you can always start again from the original.</p>
  </div>
  <div class="foot"><span>${t.name} — setup guide</span><span>1 / 3</span></div>
</section>

<section class="pg">
  <div class="mark"><i></i> baraah-sites</div>
  <h2 style="margin-top:10mm">1. Change the words</h2>
  <p>Open <code>index.html</code>. The text you see on the page is the text in the
  file — find the words you want to replace and type over them. Everything inside
  angle brackets, like <code>&lt;h1&gt;</code>, is structure; leave those alone and
  edit only what sits between them.</p>
  <pre>&lt;h1&gt;<span style="color:#e8b98a">Your headline goes here&lt;/h1&gt;</span></pre>
  <p>The page is laid out in labelled sections, so you can find things quickly.
  Search the file for these comments:</p>
  <div class="box">
    <p style="margin:0">${sections(site).map((x) => `<code>${x}</code>`).join(' &nbsp; ')}</p>
  </div>

  <h2>2. Change the colours</h2>
  <p>Every colour in this template is set once, at the very top of
  <code>css/style.css</code>, in a block called <code>:root</code>. Change a value
  there and it updates everywhere on the page at once — you never need to hunt
  through the file.</p>
  <div class="swatches">
    ${palette(site).map((c) => `<div class="sw"><div class="chip" style="background:${c.hex}"></div>
      <div class="meta"><b>${c.name}</b><span>${c.hex}</span></div></div>`).join('')}
  </div>
  <p>Replace a hex code with your own brand colour and save. Refresh the browser
  and the whole site has changed. If you don't know your hex codes, upload your
  logo to a free tool like <strong>imagecolorpicker.com</strong> and it will tell you.</p>
  <div class="foot"><span>${t.name} — setup guide</span><span>2 / 3</span></div>
</section>

<section class="pg">
  <div class="mark"><i></i> baraah-sites</div>
  <h2 style="margin-top:10mm">3. Change the pictures</h2>
  <p>Every image lives in the <code>img/</code> folder. The artwork that comes with
  this template is drawn artwork, not photography — it's there so the page looks
  finished out of the box. Swap it for your own photos.</p>
  <ol>
    <li>Find the picture you want to change in <code>img/</code>.</li>
    <li>Save your own photo into that folder.</li>
    <li>In <code>index.html</code>, find that filename and change it to yours:</li>
  </ol>
  <pre>&lt;img src="img/<span style="color:#e8b98a">hero.svg</span>"&gt;  →  &lt;img src="img/<span style="color:#e8b98a">my-photo.jpg</span>"&gt;</pre>
  <p>Aim for photos about <strong>1800 pixels wide</strong> for the big header image
  and <strong>1200 pixels</strong> for the smaller ones. Save as JPG. If a photo is
  enormous the page will load slowly — run it through <strong>squoosh.app</strong>
  (free) first.</p>

  <h2>4. Put it online</h2>
  <p>The site is finished files, so almost any host will take it. Two free options:</p>
  <ul>
    <li><strong>Netlify</strong> — go to netlify.com, drag your folder onto the page.
        It's live in about ten seconds.</li>
    <li><strong>GitHub Pages</strong> — free, and works well if you already use GitHub.</li>
  </ul>
  <p>Both let you connect your own domain name later.</p>

  <div class="warn">
    <p style="margin:0 0 2mm"><strong>The contact form</strong></p>
    <p style="margin:0">The form validates and shows a confirmation, but it doesn't
    send anywhere yet — that needs one line pointed at a form service. <strong>Formspree.io</strong>
    is free for low volume and takes about five minutes. Stuck? Email me.</p>
  </div>

  <h2>If you get stuck</h2>
  <p>Message me and I'll help — that's included. If you'd rather I set the whole
  thing up for you with your words, pictures and domain, that's what the full
  build service is for.</p>
  <div class="foot"><span>baraah-sites</span><span>3 / 3</span></div>
</section>

</body></html>`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: EXE });

  for (const [site, t] of Object.entries(TEMPLATES)) {
    const tmp = path.join(OUT, `${site}.html`);
    fs.writeFileSync(tmp, page(site, t));
    const p = await browser.newPage();
    await serveFonts(p);
    await p.goto('file://' + tmp, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.pdf({ path: path.join(OUT, `${site}.pdf`), printBackground: true,
                  preferCSSPageSize: true });
    // KEEP=1 leaves the intermediate HTML behind for visual checking
    if (!process.env.KEEP) { await p.close(); fs.unlinkSync(tmp); }
    else {
      await p.setViewportSize({ width: 794, height: 1123 });
      const pages = await p.$$('.pg');
      for (const [i, el] of pages.entries()) {
        await el.screenshot({ path: path.join(OUT, `${site}-p${i + 1}.png`) });
      }
      await p.close();
      fs.unlinkSync(tmp);
    }
    console.log('guide ->', site);
  }
  await browser.close();
})().catch((e) => { console.error(e.message); process.exit(1); });

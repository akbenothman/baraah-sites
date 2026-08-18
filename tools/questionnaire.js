// Renders the file every buyer receives the moment they pay.
//
//   node tools/questionnaire.js
//
// Output: media/etsy/Welcome-and-Project-Questionnaire.pdf
//
// This is the digital file attached to each service listing. It does two jobs:
// the buyer gets something real immediately (so a service listing behaves like
// a proper digital delivery), and it collects everything needed to start,
// which is what otherwise costs days of back-and-forth messages.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { ROOT, EXE, serveFonts } = require('./capture');

const OUT = path.join(ROOT, 'media/etsy/Welcome-and-Project-Questionnaire.pdf');

const HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<title>Welcome &amp; Project Questionnaire — baraah-sites</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>
  @page{size:A4;margin:0}
  *{margin:0;box-sizing:border-box}
  body{font:300 10.5pt/1.6 'Inter','Helvetica Neue',system-ui,sans-serif;color:#1c1a17;
    background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .pg{width:210mm;height:297mm;padding:18mm 20mm 14mm;display:flex;flex-direction:column;
    break-after:page;page-break-after:always}
  .pg:last-child{break-after:auto;page-break-after:auto}
  .mark{display:flex;align-items:center;gap:2.2mm;font-size:9.5pt;letter-spacing:-.02em}
  .mark i{width:2.8mm;height:2.8mm;border-radius:50%;background:#b4562f;display:block}
  h1{font-size:30pt;line-height:1.04;letter-spacing:-.03em;font-weight:300;margin:12mm 0 4mm}
  h1 em{font-family:'Instrument Serif',Georgia,serif;font-style:italic;color:#b4562f}
  h2{font-size:14pt;font-weight:400;letter-spacing:-.02em;margin:8mm 0 3mm}
  p{margin:0 0 3mm;color:#4a4540}
  .lead{font-size:11.5pt;color:#4a4540;max-width:62ch}
  .eyebrow{font-size:7.5pt;letter-spacing:.22em;text-transform:uppercase;color:#b4562f;font-weight:600}
  ol,ul{margin:0 0 4mm;padding-left:6mm;color:#4a4540}
  li{margin-bottom:2mm}
  .steps{display:grid;gap:3mm;margin:5mm 0}
  .st{display:flex;gap:5mm;align-items:baseline;padding-bottom:3mm;border-bottom:.3mm solid #e5ded4}
  .st b{font-family:'Instrument Serif',Georgia,serif;font-size:15pt;color:#b4562f;
    font-weight:400;min-width:9mm}
  .st .t{font-size:11pt;color:#1c1a17}
  .st .s{font-size:9.5pt;color:#4a4540;margin-top:.8mm}
  .q{margin:0 0 5mm}
  .q .label{font-size:10pt;color:#1c1a17;margin-bottom:2mm}
  .q .label span{color:#8a837a;font-size:9pt}
  .rule{height:.3mm;background:#cfc7bc;margin-bottom:3.2mm}
  .rule.tall{margin-bottom:6.5mm}
  .box{border:.35mm solid #e5ded4;border-radius:2.5mm;padding:5mm 6mm;background:#fbf8f4;margin:0 0 4mm}
  .warn{border-left:1mm solid #b4562f;background:#fdf1ea;border-radius:0 2mm 2mm 0;
    padding:4.5mm 6mm;margin:0 0 4mm}
  .cols{display:grid;grid-template-columns:1fr 1fr;gap:4mm 8mm}
  .foot{margin-top:auto;padding-top:3.5mm;border-top:.3mm solid #e5ded4;display:flex;
    justify-content:space-between;font-size:7.5pt;letter-spacing:.14em;text-transform:uppercase;color:#8a837a}
</style></head><body>

<section class="pg">
  <div class="mark"><i></i> baraah-sites</div>
  <p class="eyebrow" style="margin-top:10mm">Thank you for your order</p>
  <h1>Welcome.<br><em>Here's what happens now.</em></h1>
  <p class="lead">You've just bought a website, and the only thing standing between
  you and it is a handful of answers. Fill in page two, send it back through Etsy
  Messages, and I'll start the same day.</p>

  <h2>The timeline</h2>
  <div class="steps">
    <div class="st"><b>01</b><div><div class="t">You send this back</div>
      <div class="s">Page two, plus your logo and photos if you have them. Nothing needs to be perfect.</div></div></div>
    <div class="st"><b>02</b><div><div class="t">I confirm within a few hours</div>
      <div class="s">I'll tell you if anything's missing, and confirm the delivery date.</div></div></div>
    <div class="st"><b>03</b><div><div class="t">You get a live preview link</div>
      <div class="s">A real, working site you can open on your phone — not a picture of one.</div></div></div>
    <div class="st"><b>04</b><div><div class="t">You ask for changes</div>
      <div class="s">Send them in one message where you can. Your package includes revisions.</div></div></div>
    <div class="st"><b>05</b><div><div class="t">I hand over everything</div>
      <div class="s">All the files, yours to keep. I'll help you put it online if you'd like.</div></div></div>
  </div>

  <div class="warn">
    <p style="margin:0"><strong>Don't have your text or photos ready?</strong> Order anyway
    and send what you've got. I can write placeholder copy that reads properly and swap in
    your words later, and I can work from your Instagram photos.</p>
  </div>
  <div class="foot"><span>Welcome &amp; project questionnaire</span><span>1 / 3</span></div>
</section>

<section class="pg">
  <div class="mark"><i></i> baraah-sites</div>
  <h2 style="margin-top:8mm">The questionnaire</h2>
  <p style="margin-bottom:6mm">Type your answers into a reply, or print this and photograph it —
  whichever is easier. Short answers are completely fine.</p>

  <div class="q"><div class="label">1. Business name, and what you do <span>— one line is plenty</span></div>
    <div class="rule"></div><div class="rule tall"></div></div>

  <div class="q"><div class="label">2. Who are your customers? <span>— who walks in, who buys</span></div>
    <div class="rule"></div><div class="rule tall"></div></div>

  <div class="q"><div class="label">3. Which of the five designs do you want? <span>— Verano, Lacquer, Halo, Ora or Fig &amp; Vine</span></div>
    <div class="rule tall"></div></div>

  <div class="q"><div class="label">4. What should the site do first? <span>— get bookings, sell products, show a menu, take enquiries</span></div>
    <div class="rule"></div><div class="rule tall"></div></div>

  <div class="q"><div class="label">5. Pages or sections you need</div>
    <div class="rule"></div><div class="rule tall"></div></div>

  <div class="cols">
    <div class="q"><div class="label">6. Brand colours <span>— or "use the design's"</span></div>
      <div class="rule tall"></div></div>
    <div class="q"><div class="label">7. Do you have a logo?</div>
      <div class="rule tall"></div></div>
    <div class="q"><div class="label">8. Domain name <span>— if you have one</span></div>
      <div class="rule tall"></div></div>
    <div class="q"><div class="label">9. Where should enquiries go?</div>
      <div class="rule tall"></div></div>
  </div>

  <div class="q"><div class="label">10. Two or three websites you like the look of <span>— any industry</span></div>
    <div class="rule"></div><div class="rule tall"></div></div>

  <div class="q"><div class="label">11. Anything you definitely don't want</div>
    <div class="rule"></div><div class="rule tall"></div></div>

  <div class="foot"><span>Welcome &amp; project questionnaire</span><span>2 / 3</span></div>
</section>

<section class="pg">
  <div class="mark"><i></i> baraah-sites</div>
  <h2 style="margin-top:8mm">What to send with it</h2>
  <div class="box">
    <ul style="margin:0">
      <li><strong>Your logo</strong> — any format. PNG with a transparent background is ideal; a photo of a business card works if that's all you have.</li>
      <li><strong>Photos</strong> — of your work, your space, your products. Straight from your phone is fine. Instagram photos are fine.</li>
      <li><strong>Words</strong> — an About paragraph, service names and prices, opening hours, address.</li>
      <li><strong>Links</strong> — your Instagram, Facebook, existing site, booking system.</li>
    </ul>
  </div>
  <p>Send them however is easiest — attached to an Etsy message, a Google Drive link,
  a WeTransfer link. If a file is too big for Etsy, a link is fine.</p>

  <h2>A few honest notes</h2>
  <ul>
    <li><strong>Photos matter more than you'd think.</strong> The single biggest difference between a site that looks expensive and one that doesn't is picture quality. Daylight, clean background, hold the phone still.</li>
    <li><strong>Less text reads better.</strong> If you're torn between a paragraph and a sentence, send the sentence.</li>
    <li><strong>Tell me what you don't like.</strong> It's more useful than being polite, and it's faster for both of us.</li>
    <li><strong>The clock starts when your answers land</strong>, not when you order — so send them whenever you're ready.</li>
  </ul>

  <h2>Questions before we start?</h2>
  <p>Message me through Etsy. I answer everything, including "is this the right
  package for me?" — I'd rather move you to a cheaper option than sell you the
  wrong thing.</p>

  <div class="warn">
    <p style="margin:0 0 1.5mm"><strong>One small ask, at the end</strong></p>
    <p style="margin:0">If you're happy with how it turns out, a review makes a real
    difference to a small shop. And if something isn't right, message me first —
    that's what the revisions are for, and I'd always rather fix it.</p>
  </div>

  <div class="foot"><span>baraah-sites</span><span>3 / 3</span></div>
</section>

</body></html>`;

(async () => {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const tmp = path.join(ROOT, 'build/questionnaire.html');
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, HTML);

  const browser = await chromium.launch({ executablePath: EXE });
  const page = await browser.newPage();
  await serveFonts(page);
  await page.goto('file://' + tmp, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);

  if (process.env.KEEP) {
    await page.setViewportSize({ width: 794, height: 1123 });
    for (const [i, el] of (await page.$$('.pg')).entries()) {
      await el.screenshot({ path: path.join(ROOT, `build/q-p${i + 1}.png`) });
    }
  }

  await page.pdf({ path: OUT, printBackground: true, preferCSSPageSize: true });
  await browser.close();
  fs.unlinkSync(tmp);
  console.log(`wrote ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
})().catch((e) => { console.error(e.message); process.exit(1); });

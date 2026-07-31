# Portfolio — five demo websites

A portfolio hub plus five complete demo sites, built to show range on a Fiverr
profile. Every site is plain HTML, CSS and vanilla JavaScript: no build step, no
framework, no dependencies. Open `index.html` and everything works.

| Demo | Business | What it demonstrates |
|---|---|---|
| [`sites/verano`](sites/verano/) | Speciality coffee roaster | Product cards, add-to-bag, café menu, review slider, two locations |
| [`sites/lacquer`](sites/lacquer/) | Nail studio | Colour picker that re-themes the page, booking form with time slots, FAQ accordion |
| [`sites/halo`](sites/halo/) | Skincare label | Product page with shade switching, quantity, ingredients table, bundle upsell |
| [`sites/ora`](sites/ora/) | Movement studio | Dark UI, seven-day class schedule with live spots, monthly/yearly pricing toggle |
| [`sites/fig`](sites/fig/) | Restaurant & wine bar | Tabbed menu (dinner / brunch / wine), reservation flow with sittings |

Each demo is a **different design language on purpose** — warm editorial, soft and
rounded, minimal luxury, dark and structural, candlelit high-contrast — so the
portfolio reads as range rather than one template recoloured five times.

---

## Running it

No server needed:

```bash
open index.html          # macOS
start index.html         # Windows
```

If you'd rather serve it (recommended, matches production exactly):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

---

## Layout

```
index.html              portfolio hub — the page you link from Fiverr
assets/
  css/style.css         hub styles
  js/main.js            hub scripts
  img/thumb-*.jpg       generated previews of each demo
sites/
  verano/               each demo is fully self-contained:
    index.html            one page, semantic markup
    css/style.css         one stylesheet, CSS custom properties at the top
    js/main.js            one script, no dependencies
    img/*.svg             all artwork, vector
  lacquer/  halo/  ora/  fig/
tools/                  build helpers (only needed if you regenerate art)
```

Because every demo folder is self-contained, you can hand a client the single
folder — say `sites/lacquer/` — and it will run anywhere with nothing missing.

---

## Using one of these for a real client

**1. Copy the folder.** `cp -r sites/verano client-name/`

**2. Change the colours.** Every site's palette lives in the `:root` block at the
top of its stylesheet. Change those handful of values and the whole page
re-themes:

```css
:root{
  --cream:#F3EBDD;    /* page background */
  --ink:#241811;      /* body text       */
  --clay:#C4643C;     /* accent          */
}
```

**3. Change the copy.** It's ordinary HTML — no templating, no CMS, nothing
hidden. Search for the text you want to replace and replace it.

**4. Swap the images.** Every image is a plain `<img>` with a fixed aspect
ratio. Drop a real photo in with the same filename and the layout keeps working:

```
sites/verano/img/hero.svg   →   sites/verano/img/hero.jpg
```

…then update the `src` in `index.html`. Photos want to be ~1800px wide for heroes
and ~1200px for cards; export as WebP or JPEG at quality 80.

**5. Wire up the forms.** Every form is currently client-side only — it
validates and shows a confirmation, but nothing is sent anywhere. To make one
live, point it at a form service (Formspree, Basin, Netlify Forms) or your own
endpoint. The submit handler in each `js/main.js` is where to do it.

---

## About the artwork

All imagery is **generated vector art**, drawn in code — an espresso bar, a
rosetta in a cup, a pour-over, a hand mid-manicure, a reformer, plated food.
That keeps the repo tiny, sharp at any size, and free of stock-photo licensing.

For a paying client you'd normally replace it with their real photography.
The art is there so the demos look finished, not so you have to keep it.

To redraw it after changing a palette:

```bash
python3 tools/gen_scenes.py     # all artwork (calls gen_art.py itself)
```

To rebuild the hub's preview thumbnails after changing a demo's design:

```bash
npm install                     # once, for Playwright
node tools/thumbs.js
```

---

## Marketing assets

`media/` holds the images and video used for the Fiverr gig listing:

```
media/gallery/*.jpg   1280x769 at 2x — Fiverr's recommended gig image ratio
media/full/*.jpg      each page top to bottom, for portfolio/work-sample slots
media/portfolio-walkthrough.mp4   61s scroll-through of all six pages
```

Rebuild them after a design change:

```bash
python3 tools/fetch_fonts.py    # once — caches the webfonts locally
node tools/shots.js             # stills
node tools/video.js             # walkthrough video
```

The font cache exists because Chromium in some sandboxes can't reach
fonts.googleapis.com; the capture scripts serve the cached copies via request
interception so screenshots show the real typefaces rather than fallbacks.

---

## Fonts

Each site loads its typefaces from Google Fonts and falls back to a
metrically-similar system stack if that request fails, so nothing breaks
offline. If you'd rather self-host, download the families listed in each
`<head>` and swap the `<link>` for an `@font-face` block.

---

## Deploying

It's static, so anything works. Two easy options:

**GitHub Pages** — push, then Settings → Pages → deploy from `main`, root.
Your hub lands at `https://<user>.github.io/<repo>/`.

**Netlify / Vercel** — drag the folder onto the dashboard. No build command,
publish directory is the repo root.

For a single client site, upload just that one folder and point their domain at
it.

---

## Before you publish this as your portfolio

- Point the *Start a project* buttons at your actual Fiverr gig URL.
- Adjust the prices in the "What I build" section to match your gigs.
- The five brands are fictional. Keep it that way, or say plainly that they're
  concept pieces — don't present them as delivered client work.

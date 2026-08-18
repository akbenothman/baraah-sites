#!/usr/bin/env python3
"""
Builds the template downloads sold on Etsy.

Each zip contains the working site, its tailored setup guide, and a plain-text
README for anyone who opens the folder before the PDF. Run tools/guide.js first
so the guides exist.

    node tools/guide.js && python3 tools/package_templates.py

Output: media/templates/<Name>-Website-Template.zip
"""

import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GUIDES = ROOT / "build/guides"
OUT = ROOT / "media/templates"
STAGE = ROOT / "build/stage"

TEMPLATES = {
    "verano": ("Verano", "Coffee shop, bakery and food retail"),
    "lacquer": ("Lacquer", "Salons, barbers and appointment businesses"),
    "halo": ("Halo", "Product brands and small e-commerce"),
    "ora": ("Ora", "Studios, gyms and membership businesses"),
    "fig": ("Fig-and-Vine", "Restaurants, bars and hospitality"),
}

README = """{name} — website template
{rule}

Made for: {kind}

WHAT TO DO FIRST
  1. Double-click index.html. That's your site, running in your browser.
  2. Read SETUP-GUIDE.pdf. It's three pages and covers everything below.

WHAT'S IN HERE
  index.html        every word on the page
  css/style.css     every colour, font and spacing value
  js/main.js        the interactive parts — you can leave this alone
  img/              every picture — replace these with your own
  SETUP-GUIDE.pdf   how to change the words, colours, pictures, and put it online

THE THREE THINGS PEOPLE CHANGE
  Words     open index.html, type over the text you see
  Colours   open css/style.css, edit the values in the :root block at the top
  Pictures  drop your photos into img/ and update the filenames in index.html

GOOD TO KNOW
  Nothing to install. No accounts, no subscriptions, no build step.
  Works in every modern browser, on phones and desktop.
  The contact form validates but doesn't send yet — the guide explains how to
  connect it free in about five minutes.

LICENCE
  Use this on one website, personal or commercial, for yourself or one client.
  Change anything you like. Please don't resell or redistribute the template
  itself, as-is or modified.

HELP
  Stuck on something? Message me through Etsy — help is included.
  If you'd rather I set the whole thing up for you with your words, pictures
  and domain, that's what the full build service is for.

  baraah-sites
"""


def main():
    if not GUIDES.exists():
        raise SystemExit("No guides yet. Run: node tools/guide.js")

    OUT.mkdir(parents=True, exist_ok=True)
    shutil.rmtree(STAGE, ignore_errors=True)

    for site, (name, kind) in TEMPLATES.items():
        folder = f"{name}-Website-Template"
        stage = STAGE / folder
        stage.mkdir(parents=True)

        # the site itself
        src = ROOT / "sites" / site
        for part in ("index.html", "css", "js", "img"):
            s = src / part
            (shutil.copytree if s.is_dir() else shutil.copy2)(s, stage / part)

        shutil.copy2(GUIDES / f"{site}.pdf", stage / "SETUP-GUIDE.pdf")
        (stage / "README.txt").write_text(
            README.format(name=name.replace("-", " "), kind=kind,
                          rule="=" * (len(name.replace("-", " ")) + 20)),
            encoding="utf-8")

        target = OUT / f"{folder}.zip"
        with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
            for f in sorted(stage.rglob("*")):
                if f.is_file():
                    z.write(f, f"{folder}/{f.relative_to(stage)}")

        kb = target.stat().st_size / 1024
        print(f"  {target.name:42} {kb:6.0f} KB")

    shutil.rmtree(STAGE, ignore_errors=True)


if __name__ == "__main__":
    main()

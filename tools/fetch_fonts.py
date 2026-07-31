#!/usr/bin/env python3
"""
Caches the Google Fonts each site uses, so screenshots and video render with
the real typefaces instead of fallbacks.

Pulls every stylesheet referenced by a site's <head>, downloads the woff2
files it points at, and rewrites the CSS to reference the local copies. The
capture scripts then serve these from disk via request interception, which
means the pages themselves need no modification.

    python3 tools/fetch_fonts.py
"""

import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / ".fontcache"

# Google serves woff2 only to browsers that advertise support.
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")


def fetch(url: str) -> bytes:
    out = subprocess.run(
        ["curl", "-sSL", "--fail", "-A", UA, url],
        capture_output=True, check=True,
    )
    return out.stdout


def main():
    CACHE.mkdir(exist_ok=True)

    pages = [ROOT / "index.html"] + sorted(ROOT.glob("sites/*/index.html"))
    css_urls = set()
    for page in pages:
        css_urls.update(re.findall(
            r'href="(https://fonts\.googleapis\.com/[^"]+)"', page.read_text()))

    manifest = {}
    for url in sorted(css_urls):
        css = fetch(url).decode("utf-8")

        # pull down each font file and point the CSS at the local copy
        for font_url in sorted(set(re.findall(r'url\((https://fonts\.gstatic\.com/[^)]+)\)', css))):
            name = hashlib.sha1(font_url.encode()).hexdigest()[:16] + ".woff2"
            target = CACHE / name
            if not target.exists():
                target.write_bytes(fetch(font_url))
            css = css.replace(font_url, f"/__fonts/{name}")

        key = hashlib.sha1(url.encode()).hexdigest()[:16] + ".css"
        (CACHE / key).write_text(css, encoding="utf-8")
        manifest[url] = key

    (CACHE / "manifest.json").write_text(json.dumps(manifest, indent=2))
    fonts = len(list(CACHE.glob("*.woff2")))
    print(f"cached {len(manifest)} stylesheets, {fonts} font files")


if __name__ == "__main__":
    main()

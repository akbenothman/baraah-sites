#!/usr/bin/env python3
"""
Flattens each site into a single self-contained HTML file.

Stylesheet, script and every SVG are inlined, so the output is one file you can
email to a client, drop on any host, or publish somewhere that only accepts a
single document. Nothing external is fetched.

    python3 tools/bundle.py [--hub-links a=URL b=URL ...]

Output lands in build/. Two notes on the flattened copies:

  * Web fonts are stripped. The single-file build is meant to survive with no
    network at all, so it renders in each site's fallback stack. The normal
    multi-file site still loads its real typefaces.
  * The <!DOCTYPE>/<html>/<head>/<body> wrapper is omitted, because the hosts
    these are built for supply their own. Add it back if you need a standalone
    document.
"""

import base64
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / "build"

SITES = ["verano", "lacquer", "halo", "ora", "fig"]

MIME = {".svg": "image/svg+xml", ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg", ".png": "image/png"}


def data_uri(path: Path) -> str:
    payload = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{MIME[path.suffix.lower()]};base64,{payload}"


def flatten(html_path: Path, css_path: Path, js_path: Path, asset_root: Path,
            asset_prefix: str, link_map: dict | None = None) -> str:
    html = html_path.read_text(encoding="utf-8")

    title = re.search(r"<title>(.*?)</title>", html, re.S).group(1).strip()
    body = re.search(r"<body>(.*?)</body>", html, re.S).group(1)

    # the script tag is replaced by the inlined script at the end
    body = re.sub(r'\s*<script src="[^"]+"></script>', "", body)

    # inline every image reference
    def swap(match):
        rel = match.group(1)
        return f'src="{data_uri(asset_root / rel)}"'

    body = re.sub(rf'src="{re.escape(asset_prefix)}([^"]+)"', swap, body)

    # point cross-site links at wherever those pages actually live
    if link_map:
        for site, url in link_map.items():
            body = body.replace(f'href="sites/{site}/index.html"', f'href="{url}"')
    # the demos credit the hub with a relative path that won't exist here
    body = re.sub(r'<a href="\.\./\.\./index\.html">(.*?)</a>', r"\1", body)

    css = css_path.read_text(encoding="utf-8")
    js = js_path.read_text(encoding="utf-8")

    # The host page may carry its own light/dark styling. These sites are brand
    # sites -- they're meant to look identical for every visitor -- so pin the
    # ground colour and the form-control scheme rather than inheriting either.
    bg = re.search(r"--bg[^:]*:\s*(#[0-9A-Fa-f]{3,8})", css)
    ground = bg.group(1) if bg else re.search(r"body\{[^}]*background:\s*var\(--([\w-]+)\)", css)
    if not bg and ground:
        token = re.search(rf"--{ground.group(1)}:\s*(#[0-9A-Fa-f]{{3,8}})", css)
        ground = token.group(1) if token else "#ffffff"
    else:
        ground = bg.group(1) if bg else "#ffffff"

    dark = int(ground[1:3], 16) + int(ground[3:5], 16) + int(ground[5:7], 16) < 330
    pin = (f"\n/* pinned for single-file hosting */\n"
           f":root{{color-scheme:{'dark' if dark else 'light'}}}\n"
           f"html,body{{background:{ground}}}\n")

    return (f"<title>{title}</title>\n"
            f"<style>\n{css}{pin}</style>\n"
            f"{body}\n"
            f"<script>\n{js}</script>\n")


def main():
    links = {}
    if "--hub-links" in sys.argv:
        for pair in sys.argv[sys.argv.index("--hub-links") + 1:]:
            name, _, url = pair.partition("=")
            links[name] = url

    BUILD.mkdir(exist_ok=True)

    for site in SITES:
        base = ROOT / "sites" / site
        out = flatten(base / "index.html", base / "css/style.css",
                      base / "js/main.js", base / "img", "img/")
        (BUILD / f"{site}.html").write_text(out, encoding="utf-8")
        print(f"{site:9} {len(out) / 1024:6.0f} KB")

    hub = flatten(ROOT / "index.html", ROOT / "assets/css/style.css",
                  ROOT / "assets/js/main.js", ROOT / "assets/img",
                  "assets/img/", links)
    (BUILD / "hub.html").write_text(hub, encoding="utf-8")
    print(f"{'hub':9} {len(hub) / 1024:6.0f} KB")


if __name__ == "__main__":
    main()

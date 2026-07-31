#!/usr/bin/env python3
"""
Generates the placeholder artwork used across the demo sites.

Everything is vector (SVG) so the sites stay fully self-contained, load
instantly and stay sharp at any size. Each image is a small poster: a flat
ground, one or two confident shapes, a gradient sheen and a film-grain
overlay -- art direction rather than stock photography.

Every image slot in the markup is a plain <img> with a fixed aspect ratio, so
dropping a real photo in with the same filename is a one-file swap.

    python3 tools/gen_art.py
"""

import math
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


# ---------------------------------------------------------------- compositions

def c_dunes(w, h, p, rng):
    """Stacked hills. Warm, organic, very editorial."""
    out = []
    layers = 5
    for i in range(layers):
        top = h * (0.30 + 0.135 * i)
        amp = h * rng.uniform(0.05, 0.11)
        shift = rng.uniform(0, math.tau)
        freq = rng.choice([0.8, 1.0, 1.35])
        pts = []
        steps = 64
        for k in range(steps + 1):
            x = w * k / steps
            t = k / steps
            y = top - math.sin(t * math.pi * freq + shift) * amp
            pts.append(f"{x:.1f},{y:.1f}")
        out.append(
            f'<path d="M0,{h} L' + " L".join(pts) +
            f' L{w},{h} Z" fill="{p[(i % (len(p) - 1)) + 1]}"/>'
        )
    return "".join(out)


def c_arc(w, h, p, rng):
    """A sun / horizon composition."""
    cx = w * rng.uniform(0.34, 0.66)
    cy = h * rng.uniform(0.44, 0.60)
    r = min(w, h) * rng.uniform(0.30, 0.40)
    horizon = h * 0.72
    return f"""
  <rect y="{horizon}" width="{w}" height="{h - horizon}" fill="{p[2]}"/>
  <circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r:.0f}" fill="{p[1]}"/>
  <circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r * 1.42:.0f}" fill="none" \
stroke="{p[3]}" stroke-width="{max(2, r * 0.018):.1f}" opacity="0.65"/>
  <circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r * 1.86:.0f}" fill="none" \
stroke="{p[3]}" stroke-width="{max(2, r * 0.014):.1f}" opacity="0.4"/>
  <rect y="{horizon - 2}" width="{w}" height="3" fill="{p[4]}" opacity="0.5"/>"""


def c_arch(w, h, p, rng):
    """A window / doorway -- reads as interior architecture."""
    aw = w * 0.56
    ax = (w - aw) / 2
    ay = h * 0.14
    ah = h * 0.74
    return f"""
  <rect y="{h * 0.86:.0f}" width="{w}" height="{h * 0.14:.0f}" fill="{p[3]}"/>
  <path d="M{ax:.0f} {ay + ah:.0f} V{ay + aw / 2:.0f} a{aw / 2:.0f} {aw / 2:.0f} \
0 0 1 {aw:.0f} 0 V{ay + ah:.0f} Z" fill="{p[1]}"/>
  <path d="M{ax + aw * 0.16:.0f} {ay + ah:.0f} V{ay + aw / 2:.0f} \
a{aw * 0.34:.0f} {aw * 0.34:.0f} 0 0 1 {aw * 0.68:.0f} 0 V{ay + ah:.0f} Z" \
fill="{p[2]}" opacity="0.85"/>"""


def c_bands(w, h, p, rng):
    """Uneven colour bands with a thin rule -- graphic and calm."""
    out = []
    y = 0
    i = 0
    while y < h:
        bh = h * rng.uniform(0.10, 0.26)
        out.append(f'<rect y="{y:.0f}" width="{w}" height="{bh + 1:.0f}" '
                   f'fill="{p[(i % (len(p) - 1)) + 1]}"/>')
        y += bh
        i += 1
    out.append(f'<rect x="{w * 0.5 - 1:.0f}" width="2" height="{h}" '
               f'fill="{p[0]}" opacity="0.35"/>')
    return "".join(out)


def c_stones(w, h, p, rng):
    """Hard-edged overlapping ovals -- sticker-like, playful."""
    out = []
    for i in range(3):
        cx = w * rng.uniform(0.2, 0.8)
        cy = h * rng.uniform(0.25, 0.75)
        rx = min(w, h) * rng.uniform(0.22, 0.38)
        ry = rx * rng.uniform(0.7, 1.25)
        rot = rng.uniform(-35, 35)
        out.append(
            f'<ellipse cx="{cx:.0f}" cy="{cy:.0f}" rx="{rx:.0f}" ry="{ry:.0f}" '
            f'fill="{p[i + 1]}" opacity="0.92" '
            f'transform="rotate({rot:.0f} {cx:.0f} {cy:.0f})"/>'
        )
    return "".join(out)


def c_halftone(w, h, p, rng):
    """Dot matrix fading across a two-tone ground."""
    out = [f'<rect width="{w}" height="{h * 0.55:.0f}" fill="{p[1]}"/>']
    step = max(w, h) / 26
    r0 = step * 0.42
    y = step
    row = 0
    while y < h:
        x = step
        while x < w:
            t = 1 - (y / h) * 0.85
            r = r0 * max(0.12, t) * (1.0 if row % 2 == 0 else 0.86)
            out.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.1f}" '
                       f'fill="{p[3]}" opacity="0.55"/>')
            x += step
        y += step
        row += 1
    return "".join(out)


def c_glow(w, h, p, rng):
    """Soft radial bloom -- used sparingly, for product close-ups."""
    cx, cy = w * rng.uniform(0.35, 0.65), h * rng.uniform(0.35, 0.6)
    r = max(w, h) * 0.62
    return f"""
  <defs><radialGradient id="bloom" cx="{cx / w:.2f}" cy="{cy / h:.2f}" r="0.8">
    <stop offset="0%" stop-color="{p[1]}"/>
    <stop offset="55%" stop-color="{p[2]}"/>
    <stop offset="100%" stop-color="{p[0]}"/>
  </radialGradient></defs>
  <rect width="{w}" height="{h}" fill="url(#bloom)"/>
  <circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r * 0.40:.0f}" fill="{p[3]}" \
opacity="0.42"/>
  <circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r * 0.52:.0f}" fill="none" \
stroke="{p[4]}" stroke-width="{max(2, w * 0.0022):.1f}" opacity="0.45"/>
  <circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r * 0.68:.0f}" fill="none" \
stroke="{p[4]}" stroke-width="{max(1.5, w * 0.0014):.1f}" opacity="0.28"/>
  <rect y="{h * 0.80:.0f}" width="{w}" height="{h * 0.20:.0f}" fill="{p[2]}" \
opacity="0.75"/>"""


COMPS = {
    "dunes": c_dunes, "arc": c_arc, "arch": c_arch, "bands": c_bands,
    "stones": c_stones, "halftone": c_halftone, "glow": c_glow,
}


# ------------------------------------------------------------------- subjects

def s_cup(w, h, stroke):
    cx, cy, s = w / 2, h * 0.52, min(w, h) * 0.0015
    return f"""<g transform="translate({cx:.0f} {cy:.0f}) scale({s:.3f})" \
fill="none" stroke="{stroke}" stroke-width="10" stroke-linecap="round" \
opacity="0.62">
    <path d="M-150 -110 h300 v110 a150 150 0 0 1 -300 0 z"/>
    <path d="M150 -70 a70 70 0 0 1 0 140"/>
    <path d="M-215 130 h430" stroke-width="12"/>
    <path d="M-60 -190 c0 -30 26 -30 26 -60 M12 -190 c0 -30 26 -30 26 -60" \
stroke-width="8" opacity="0.8"/>
  </g>"""


def s_bottle(w, h, stroke):
    cx, cy, s = w / 2, h * 0.52, min(w, h) * 0.0017
    return f"""<g transform="translate({cx:.0f} {cy:.0f}) scale({s:.3f})" \
fill="none" stroke="{stroke}" stroke-width="10" stroke-linejoin="round" \
opacity="0.62">
    <path d="M-44 -212 h88 v56 h-88 z"/>
    <path d="M-86 -156 h172 a26 26 0 0 1 26 26 v250 a26 26 0 0 1 -26 26 \
h-172 a26 26 0 0 1 -26 -26 v-250 a26 26 0 0 1 26 -26 z"/>
    <path d="M-50 20 h100 M-50 66 h64" stroke-width="8" opacity="0.7"/>
  </g>"""


def s_leaf(w, h, stroke):
    cx, cy, s = w / 2, h * 0.5, min(w, h) * 0.0019
    return f"""<g transform="translate({cx:.0f} {cy:.0f}) scale({s:.3f})" \
fill="none" stroke="{stroke}" stroke-width="9" stroke-linecap="round" \
opacity="0.55">
    <path d="M0 200 C0 40 -62 -60 0 -200 C62 -60 0 40 0 200 z"/>
    <path d="M0 150 V-150"/>
    <path d="M0 60 L-54 8 M0 60 L54 8 M0 -22 L-46 -68 M0 -22 L46 -68" \
opacity="0.75"/>
  </g>"""


def s_polish(w, h, stroke):
    cx, cy, s = w / 2, h * 0.52, min(w, h) * 0.0018
    return f"""<g transform="translate({cx:.0f} {cy:.0f}) scale({s:.3f})" \
fill="none" stroke="{stroke}" stroke-width="10" stroke-linejoin="round" \
opacity="0.6">
    <path d="M-26 -230 h52 v72 h-52 z"/>
    <path d="M-72 -158 h144 v250 a34 34 0 0 1 -34 34 h-76 a34 34 0 0 1 -34 -34 z"/>
    <path d="M-72 -60 h144" stroke-width="8" opacity="0.7"/>
  </g>"""


def s_fork(w, h, stroke):
    cx, cy, s = w / 2, h * 0.5, min(w, h) * 0.0016
    return f"""<g transform="translate({cx:.0f} {cy:.0f}) scale({s:.3f})" \
fill="none" stroke="{stroke}" stroke-width="10" stroke-linecap="round" \
opacity="0.55">
    <circle cx="0" cy="0" r="150"/>
    <circle cx="0" cy="0" r="196" opacity="0.5"/>
    <path d="M-250 -190 v120 a34 34 0 0 0 68 0 v-120 M-216 -190 v120" \
opacity="0.8"/>
    <path d="M216 -190 c40 0 40 130 0 130 v250 M216 60 v-250" opacity="0.8"/>
  </g>"""


SUBJECTS = {"cup": s_cup, "bottle": s_bottle, "leaf": s_leaf,
            "polish": s_polish, "fork": s_fork}


# ------------------------------------------------------------------- palettes
# [ground, shape a, shape b, shape c, line, deep]
PALETTES = {
    "verano":  ["#EFE5D5", "#C4643C", "#D9BE96", "#8E7350", "#5B3D28", "#F7F1E6"],
    "lacquer": ["#F5E9E5", "#D89A93", "#E7C6BF", "#B98A92", "#7E555C", "#FBF3F0"],
    "halo":    ["#EDE7DD", "#BFA98A", "#D6C8B2", "#9C8462", "#6B5B44", "#F6F2EB"],
    "ora":     ["#151A17", "#3E5140", "#27332A", "#59704F", "#9FB394", "#0D110E"],
    "fig":     ["#171210", "#7A4326", "#2E1F19", "#A86B32", "#D9AA5C", "#0E0A08"],
    "hub":     ["#0D0D0F", "#23232B", "#17171C", "#33333E", "#6E6E80", "#08080A"],
}

STROKES = {"verano": "#5B3D28", "lacquer": "#7E555C", "halo": "#7A6A54",
           "ora": "#C3D3B7", "fig": "#E0B472", "hub": "#8A8A99"}


def render(rel, w, h, pal, comp, subject=None, grain=0.30, vignette=0.16):
    seed = sum(ord(c) * (i + 3) for i, c in enumerate(rel)) % 9000 + 11
    rng = random.Random(seed)
    p = PALETTES[pal]
    body = COMPS[comp](w, h, p, rng)
    subj = SUBJECTS[subject](w, h, STROKES[pal]) if subject else ""

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" \
width="{w}" height="{h}" preserveAspectRatio="xMidYMid slice" role="img">
  <defs>
    <filter id="g{seed}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="4" \
seed="{seed}" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <linearGradient id="sh{seed}" x1="0.1" y1="0" x2="0.6" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.10"/>
      <stop offset="60%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="{vignette}"/>
    </linearGradient>
  </defs>
  <rect width="{w}" height="{h}" fill="{p[0]}"/>
  {body}
  {subj}
  <rect width="{w}" height="{h}" fill="url(#sh{seed})"/>
  <rect width="{w}" height="{h}" filter="url(#g{seed})" opacity="{grain}" \
style="mix-blend-mode:overlay"/>
</svg>
"""
    target = (ROOT / "sites" / rel).resolve()
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(svg.strip() + "\n", encoding="utf-8")


# name, w, h, palette, composition, subject
JOBS = [
    # Verano -- speciality coffee
    ("verano/img/hero.svg",   1800, 1150, "verano", "dunes",    None),
    ("verano/img/beans.svg",  1100, 1400, "verano", "arc",      "cup"),
    ("verano/img/room.svg",   1400, 1000, "verano", "arch",     None),
    ("verano/img/pour.svg",   1000, 1250, "verano", "halftone", None),
    ("verano/img/bag-1.svg",   900, 1100, "verano", "glow",     "bottle"),
    ("verano/img/bag-2.svg",   900, 1100, "verano", "bands",    "bottle"),
    ("verano/img/bag-3.svg",   900, 1100, "verano", "stones",   "bottle"),
    ("verano/img/story.svg",  1200, 1500, "verano", "dunes",    "leaf"),

    # Lacquer -- nail studio
    ("lacquer/img/hands.svg",  1100, 1400, "lacquer", "arc",      None),
    ("lacquer/img/studio.svg", 1400, 1000, "lacquer", "arch",     None),
    ("lacquer/img/work-1.svg",  900, 1150, "lacquer", "glow",     "polish"),
    ("lacquer/img/work-2.svg",  900, 1150, "lacquer", "halftone", None),
    ("lacquer/img/work-3.svg",  900, 1150, "lacquer", "bands",    "polish"),
    ("lacquer/img/work-4.svg",  900, 1150, "lacquer", "dunes",    None),

    # Halo -- skin + colour
    ("halo/img/hero.svg",     1800, 1250, "halo", "glow",     None),
    ("halo/img/product.svg",  1200, 1500, "halo", "arc",      "bottle"),
    ("halo/img/texture.svg",  1200, 1200, "halo", "halftone", None),
    ("halo/img/ritual.svg",   1400, 1000, "halo", "dunes",    None),
    ("halo/img/shade-1.svg",   800, 1000, "halo", "glow",     "bottle"),
    ("halo/img/shade-2.svg",   800, 1000, "halo", "stones",   "bottle"),
    ("halo/img/shade-3.svg",   800, 1000, "halo", "bands",    "bottle"),

    # Ora -- movement studio
    ("ora/img/hero.svg",    1800, 1150, "ora", "arc",      None),
    ("ora/img/space.svg",   1400, 1000, "ora", "arch",     None),
    ("ora/img/coach-1.svg",  800, 1000, "ora", "glow",     None),
    ("ora/img/coach-2.svg",  800, 1000, "ora", "halftone", None),
    ("ora/img/coach-3.svg",  800, 1000, "ora", "stones",   None),

    # Fig & Vine -- restaurant
    ("fig/img/hero.svg",     1800, 1150, "fig", "glow",     None),
    ("fig/img/room.svg",     1400, 1000, "fig", "arch",     None),
    ("fig/img/plate-1.svg",  1000, 1000, "fig", "arc",      "fork"),
    ("fig/img/plate-2.svg",  1000, 1000, "fig", "dunes",    "leaf"),
    ("fig/img/plate-3.svg",  1000, 1000, "fig", "halftone", "fork"),
    ("fig/img/chef.svg",     1100, 1400, "fig", "bands",    None),

    # Portfolio hub
]


def main():
    for rel, w, h, pal, comp, subject in JOBS:
        vig = 0.26 if pal in ("ora", "fig", "hub") else 0.16
        render(rel, w, h, pal, comp, subject, vignette=vig)
    print(f"wrote {len(JOBS)} svg files")


if __name__ == "__main__":
    main()

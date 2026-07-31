#!/usr/bin/env python3
"""
Draws the illustrated scenes for the demo sites.

gen_art.py lays down abstract colour fields; this file draws the things that
make a site read as *its business* -- an espresso bar, a rosetta in a cup, a
pour-over, labelled bags of beans. Flat vector, one palette per brand, grain
on top so it sits with the rest of the art.

Run this (it calls gen_art first, then overwrites the illustrated slots):

    python3 tools/gen_scenes.py
"""

from pathlib import Path

import gen_art

ROOT = Path(__file__).resolve().parent.parent

# Verano's colours
CREAM = "#EFE5D5"
PAPER = "#FBF7F0"
SAND = "#E4D2B2"
TAN = "#D9BE96"
CLAY = "#C4643C"
CLAY_D = "#A64F2C"
WOOD = "#9E7448"
BROWN = "#6B4A32"
DEEP = "#3E2A1C"
INK = "#241811"
SAGE = "#8A9A7B"
SAGE_D = "#6E7F60"


def write(rel, w, h, body, ground=CREAM, grain=0.22, seed=None):
    seed = seed or (sum(ord(c) * (i + 3) for i, c in enumerate(rel)) % 9000 + 11)
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" \
width="{w}" height="{h}" preserveAspectRatio="xMidYMid slice" role="img">
  <defs>
    <filter id="n{seed}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" \
seed="{seed}" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>
  <rect width="{w}" height="{h}" fill="{ground}"/>
{body}
  <rect width="{w}" height="{h}" filter="url(#n{seed})" opacity="{grain}" \
style="mix-blend-mode:overlay"/>
</svg>
"""
    target = (ROOT / "sites" / rel).resolve()
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(svg, encoding="utf-8")


# --------------------------------------------------------------- components

def pendant(x, drop, scale=1.0, colour=CLAY):
    """A hanging lamp: cord, cone shade, pool of light."""
    w = 74 * scale
    hh = 60 * scale
    return f"""
  <g>
    <path d="M{x} 0 V{drop}" stroke="{BROWN}" stroke-width="{3 * scale:.1f}"/>
    <path d="M{x - w} {drop + hh} L{x - w * 0.28:.0f} {drop} \
H{x + w * 0.28:.0f} L{x + w} {drop + hh} Z" fill="{colour}"/>
    <ellipse cx="{x}" cy="{drop + hh}" rx="{w}" ry="{9 * scale:.0f}" fill="{DEEP}" opacity=".3"/>
    <ellipse cx="{x}" cy="{drop + hh + 60 * scale:.0f}" rx="{w * 1.5:.0f}" \
ry="{46 * scale:.0f}" fill="{SAND}" opacity=".5"/>
  </g>"""


def bean(cx, cy, r=26, rot=0, colour=DEEP):
    return f"""<g transform="rotate({rot} {cx} {cy})">
    <ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{r * 0.68:.1f}" fill="{colour}"/>
    <path d="M{cx - r * 0.8:.0f} {cy} q{r * 0.8:.0f} {-r * 0.5:.0f} {r * 1.6:.0f} 0" \
fill="none" stroke="{CREAM}" stroke-width="{max(2, r * 0.12):.1f}" opacity=".65"/>
  </g>"""


def plant(x, y, s=1.0):
    """Potted monstera-ish plant sitting with its base at (x, y)."""
    return f"""
  <g transform="translate({x} {y}) scale({s})">
    <path d="M-60 0 h120 l-14 -104 h-92 z" fill="{CLAY_D}"/>
    <path d="M-66 -104 h132 v22 h-132 z" fill="{CLAY}"/>
    <g fill="none" stroke="{SAGE_D}" stroke-width="7" stroke-linecap="round">
      <path d="M0 -110 V-250"/><path d="M0 -170 C-40 -190 -66 -232 -70 -272"/>
      <path d="M0 -196 C40 -216 68 -256 72 -296"/>
    </g>
    <g fill="{SAGE}">
      <ellipse cx="-74" cy="-286" rx="42" ry="26" transform="rotate(-32 -74 -286)"/>
      <ellipse cx="76" cy="-310" rx="44" ry="27" transform="rotate(28 76 -310)"/>
      <ellipse cx="0" cy="-282" rx="38" ry="52"/>
    </g>
  </g>"""


def bag_shape(x, y, w, h, body, band, label=True, name=None):
    """A flat-bottom coffee pouch with a tin tie and a paper label."""
    r = w * 0.06
    out = f"""
    <path d="M{x} {y + h} V{y + r} q0 {-r} {r} {-r} H{x + w - r} q{r} 0 {r} {r} \
V{y + h} Z" fill="{body}"/>
    <path d="M{x - w * 0.03:.0f} {y - h * 0.07:.0f} h{w * 1.06:.0f} \
v{h * 0.09:.0f} h{-w * 1.06:.0f} z" fill="{band}"/>
    <path d="M{x + w * 0.5:.0f} {y + h} V{y}" stroke="{DEEP}" stroke-width="2" opacity=".12"/>"""
    if label:
        lx, ly, lw, lh = x + w * 0.16, y + h * 0.26, w * 0.68, h * 0.42
        out += f"""
    <rect x="{lx:.0f}" y="{ly:.0f}" width="{lw:.0f}" height="{lh:.0f}" rx="{w * 0.03:.0f}" fill="{PAPER}"/>
    <circle cx="{lx + lw / 2:.0f}" cy="{ly + lh * 0.27:.0f}" r="{lw * 0.13:.0f}" fill="none" \
stroke="{CLAY}" stroke-width="{lw * 0.035:.1f}"/>
    <path d="M{lx + lw / 2:.0f} {ly + lh * 0.16:.0f} c{lw * 0.1:.0f} {lh * 0.08:.0f} \
{lw * 0.1:.0f} {lh * 0.14:.0f} 0 {lh * 0.22:.0f} c{-lw * 0.1:.0f} {-lh * 0.08:.0f} \
{-lw * 0.1:.0f} {-lh * 0.14:.0f} 0 {-lh * 0.22:.0f}" fill="{CLAY}"/>
    <g fill="{BROWN}" opacity=".55">
      <rect x="{lx + lw * 0.18:.0f}" y="{ly + lh * 0.52:.0f}" width="{lw * 0.64:.0f}" height="{lh * 0.045:.0f}" rx="3"/>
      <rect x="{lx + lw * 0.28:.0f}" y="{ly + lh * 0.64:.0f}" width="{lw * 0.44:.0f}" height="{lh * 0.035:.0f}" rx="3"/>
      <rect x="{lx + lw * 0.34:.0f}" y="{ly + lh * 0.74:.0f}" width="{lw * 0.32:.0f}" height="{lh * 0.035:.0f}" rx="3"/>
    </g>"""
        if name:
            out += f"""
    <text x="{lx + lw / 2:.0f}" y="{ly + lh * 0.47:.0f}" text-anchor="middle" \
font-family="Georgia,'Times New Roman',serif" font-size="{lw * 0.135:.0f}" \
letter-spacing="{lw * 0.02:.1f}" fill="{INK}">{name}</text>"""
    return f"<g>{out}</g>"


def espresso_machine(x, y, w, h):
    """Two-group machine standing with its base at (x, y)."""
    gh = h * 0.34
    return f"""
  <g>
    <rect x="{x}" y="{y - h}" width="{w}" height="{h}" rx="{w * 0.035:.0f}" fill="{CLAY_D}"/>
    <rect x="{x - w * 0.035:.0f}" y="{y - h - h * 0.12:.0f}" width="{w * 1.07:.0f}" \
height="{h * 0.14:.0f}" rx="{w * 0.02:.0f}" fill="{BROWN}"/>
    <rect x="{x + w * 0.08:.0f}" y="{y - h + h * 0.14:.0f}" width="{w * 0.84:.0f}" \
height="{h * 0.28:.0f}" rx="{w * 0.02:.0f}" fill="{TAN}" opacity=".85"/>
    <circle cx="{x + w * 0.2:.0f}" cy="{y - h + h * 0.28:.0f}" r="{w * 0.05:.0f}" fill="{CLAY}"/>
    <circle cx="{x + w * 0.8:.0f}" cy="{y - h + h * 0.28:.0f}" r="{w * 0.05:.0f}" fill="{CLAY}"/>
    <!-- group heads + portafilters -->
    <g fill="{DEEP}">
      <rect x="{x + w * 0.16:.0f}" y="{y - gh}" width="{w * 0.2:.0f}" height="{gh * 0.34:.0f}" rx="6"/>
      <rect x="{x + w * 0.64:.0f}" y="{y - gh}" width="{w * 0.2:.0f}" height="{gh * 0.34:.0f}" rx="6"/>
      <rect x="{x + w * 0.2:.0f}" y="{y - gh + gh * 0.34:.0f}" width="{w * 0.12:.0f}" height="{gh * 0.16:.0f}"/>
      <rect x="{x + w * 0.68:.0f}" y="{y - gh + gh * 0.34:.0f}" width="{w * 0.12:.0f}" height="{gh * 0.16:.0f}"/>
      <rect x="{x - w * 0.06:.0f}" y="{y - gh + gh * 0.3:.0f}" width="{w * 0.24:.0f}" height="{gh * 0.09:.0f}" rx="6"/>
    </g>
    <!-- steam wand -->
    <path d="M{x + w * 0.95:.0f} {y - h * 0.5:.0f} v{h * 0.3:.0f}" stroke="{DEEP}" \
stroke-width="{w * 0.022:.1f}" stroke-linecap="round"/>
    <!-- cups catching the shots -->
    <g fill="{PAPER}">
      <path d="M{x + w * 0.19:.0f} {y - gh * 0.36:.0f} h{w * 0.14:.0f} v{gh * 0.26:.0f} \
q0 {gh * 0.1:.0f} {-w * 0.07:.0f} {gh * 0.1:.0f} q{-w * 0.07:.0f} 0 {-w * 0.07:.0f} {-gh * 0.1:.0f} z"/>
      <path d="M{x + w * 0.67:.0f} {y - gh * 0.36:.0f} h{w * 0.14:.0f} v{gh * 0.26:.0f} \
q0 {gh * 0.1:.0f} {-w * 0.07:.0f} {gh * 0.1:.0f} q{-w * 0.07:.0f} 0 {-w * 0.07:.0f} {-gh * 0.1:.0f} z"/>
    </g>
  </g>"""


def grinder(x, y, w, h):
    return f"""
  <g>
    <path d="M{x} {y} v{-h * 0.42:.0f} h{w} v{h * 0.42:.0f} z" fill="{BROWN}"/>
    <path d="M{x + w * 0.14:.0f} {y - h * 0.42:.0f} v{-h * 0.2:.0f} h{w * 0.72:.0f} \
v{h * 0.2:.0f} z" fill="{DEEP}"/>
    <path d="M{x + w * 0.2:.0f} {y - h * 0.62:.0f} l{w * 0.1:.0f} {-h * 0.38:.0f} \
h{w * 0.4:.0f} l{w * 0.1:.0f} {h * 0.38:.0f} z" fill="{TAN}"/>
    <rect x="{x + w * 0.3:.0f}" y="{y - h * 0.3:.0f}" width="{w * 0.4:.0f}" \
height="{h * 0.16:.0f}" rx="4" fill="{PAPER}" opacity=".8"/>
  </g>"""


def cup_side(x, y, s=1.0, saucer=True):
    """A cup seen from the side, base at (x, y)."""
    out = f'<path d="M{x - 46 * s:.0f} {y - 62 * s:.0f} h{92 * s:.0f} v{34 * s:.0f} \
a{46 * s:.0f} {46 * s:.0f} 0 0 1 {-92 * s:.0f} 0 z" fill="{PAPER}"/>'
    out += f'<path d="M{x + 46 * s:.0f} {y - 48 * s:.0f} a{22 * s:.0f} {22 * s:.0f} \
0 0 1 0 {44 * s:.0f}" fill="none" stroke="{PAPER}" stroke-width="{10 * s:.0f}"/>'
    if saucer:
        out += f'<ellipse cx="{x}" cy="{y}" rx="{70 * s:.0f}" ry="{12 * s:.0f}" fill="{SAND}"/>'
    return f"<g>{out}</g>"


def steam(x, y, s=1.0, colour=BROWN, op=".45"):
    return f"""<g fill="none" stroke="{colour}" stroke-width="{7 * s:.0f}" \
stroke-linecap="round" opacity="{op}">
    <path d="M{x - 34 * s:.0f} {y} c{-16 * s:.0f} {-30 * s:.0f} {16 * s:.0f} {-46 * s:.0f} 0 {-78 * s:.0f}"/>
    <path d="M{x} {y + 8 * s:.0f} c{-16 * s:.0f} {-32 * s:.0f} {16 * s:.0f} {-50 * s:.0f} 0 {-86 * s:.0f}"/>
    <path d="M{x + 34 * s:.0f} {y} c{-16 * s:.0f} {-30 * s:.0f} {16 * s:.0f} {-46 * s:.0f} 0 {-78 * s:.0f}"/>
  </g>"""


# ------------------------------------------------------------------ scenes

def verano_hero():
    """The bar: window light, pendants, shelf of beans, machine, counter."""
    W, H = 1800, 1150
    counter_y = 830
    body = f"""
  <rect width="{W}" height="{counter_y}" fill="{CREAM}"/>
  <!-- window -->
  <path d="M120 720 V330 a200 200 0 0 1 400 0 V720 Z" fill="{PAPER}"/>
  <path d="M120 720 V330 a200 200 0 0 1 400 0 V720" fill="none" stroke="{BROWN}" stroke-width="9"/>
  <path d="M320 130 V720 M120 470 H520" stroke="{BROWN}" stroke-width="7"/>
  <path d="M150 700 L470 380 M250 710 L510 450" stroke="{SAND}" stroke-width="26" opacity=".7"/>
  <!-- shelf -->
  <rect x="980" y="392" width="740" height="16" fill="{BROWN}"/>
  {bag_shape(1010, 250, 118, 142, CLAY, BROWN, label=False)}
  {bag_shape(1160, 236, 118, 156, TAN, BROWN, label=False)}
  {bag_shape(1310, 258, 118, 134, BROWN, DEEP, label=False)}
  <g fill="{SAND}">
    <rect x="1470" y="286" width="96" height="106" rx="10"/>
    <rect x="1462" y="270" width="112" height="22" rx="8" fill="{BROWN}"/>
    <rect x="1600" y="300" width="90" height="92" rx="10"/>
    <rect x="1592" y="284" width="106" height="22" rx="8" fill="{BROWN}"/>
  </g>
  {pendant(700, 210, 1.15)}
  {pendant(900, 150, 1.15)}
  {pendant(1100, 250, 1.15)}
  <!-- counter -->
  <rect y="{counter_y}" width="{W}" height="{H - counter_y}" fill="{WOOD}"/>
  <rect y="{counter_y}" width="{W}" height="22" fill="{TAN}"/>
  <rect y="{counter_y + 150}" width="{W}" height="10" fill="{DEEP}" opacity=".18"/>
  {espresso_machine(1080, counter_y, 420, 300)}
  {grinder(900, counter_y, 140, 300)}
  {cup_side(720, counter_y, 1.0)}
  {cup_side(600, counter_y, 0.85)}
  {steam(1290, counter_y - 340, 1.2)}
  {plant(1660, counter_y, 1.0)}
  <g>{bean(300, 900, 30, 18)}{bean(390, 930, 26, -24)}{bean(470, 890, 24, 42)}</g>"""
    write("verano/img/hero.svg", W, H, body)


def verano_latte():
    """Top-down: a heart poured into a flat white, beans on the counter."""
    W, H = 1100, 1400
    cx, cy = 550, 660
    k = 250  # heart size
    heart = (f'M{cx} {cy + k * 0.78:.0f} '
             f'C{cx - k * 1.12:.0f} {cy - k * 0.06:.0f} {cx - k * 0.60:.0f} {cy - k * 0.92:.0f} '
             f'{cx} {cy - k * 0.34:.0f} '
             f'C{cx + k * 0.60:.0f} {cy - k * 0.92:.0f} {cx + k * 1.12:.0f} {cy - k * 0.06:.0f} '
             f'{cx} {cy + k * 0.78:.0f} Z')
    body = f"""
  <circle cx="{cx}" cy="{cy}" r="452" fill="{PAPER}"/>
  <circle cx="{cx}" cy="{cy}" r="452" fill="none" stroke="{SAND}" stroke-width="10"/>
  <circle cx="{cx}" cy="{cy}" r="372" fill="none" stroke="{SAND}" stroke-width="6" opacity=".8"/>
  <circle cx="{cx}" cy="{cy}" r="336" fill="{PAPER}"/>
  <circle cx="{cx}" cy="{cy}" r="336" fill="none" stroke="{SAND}" stroke-width="14"/>
  <circle cx="{cx}" cy="{cy}" r="304" fill="{BROWN}"/>
  <circle cx="{cx}" cy="{cy}" r="304" fill="none" stroke="{DEEP}" stroke-width="8" opacity=".5"/>
  <circle cx="{cx}" cy="{cy}" r="264" fill="{DEEP}" opacity=".18"/>
  <path d="{heart}" fill="{PAPER}"/>
  <path d="{heart}" fill="none" stroke="{SAND}" stroke-width="5" opacity=".7"/>
  <g>
    {bean(180, 1180, 34, 22)}{bean(285, 1245, 30, -30)}{bean(150, 1290, 28, 48)}
    {bean(930, 1150, 32, -14)}{bean(860, 1246, 29, 36)}{bean(985, 1290, 27, -42)}
    {bean(240, 180, 28, 18)}{bean(905, 235, 26, -26)}
  </g>"""
    write("verano/img/beans.svg", W, H, body)


def verano_pour():
    """V60 cone, carafe, gooseneck kettle mid-pour."""
    W, H = 1000, 1250
    body = f"""
  <circle cx="520" cy="560" r="392" fill="{SAND}" opacity=".55"/>
  <!-- carafe -->
  <path d="M372 760 h256 l44 330 a40 40 0 0 1 -40 44 H368 a40 40 0 0 1 -40 -44 z" fill="{PAPER}"/>
  <path d="M372 760 h256 l44 330 a40 40 0 0 1 -40 44 H368 a40 40 0 0 1 -40 -44 z" \
fill="none" stroke="{BROWN}" stroke-width="9"/>
  <path d="M348 990 h304 l-16 100 a40 40 0 0 1 -40 44 H404 a40 40 0 0 1 -40 -44 z" fill="{BROWN}"/>
  <path d="M672 852 a58 58 0 0 1 0 116" fill="none" stroke="{BROWN}" stroke-width="16"/>
  <!-- cone -->
  <path d="M300 470 h400 l-96 292 H396 z" fill="{CLAY}"/>
  <path d="M300 470 h400 l-96 292 H396 z" fill="none" stroke="{CLAY_D}" stroke-width="8"/>
  <g stroke="{CLAY_D}" stroke-width="6" opacity=".55">
    <path d="M380 470 L430 762 M460 470 L478 762 M540 470 L522 762 M620 470 L570 762"/>
  </g>
  <rect x="284" y="450" width="432" height="30" rx="15" fill="{CLAY_D}"/>
  <!-- kettle -->
  <g>
    <path d="M118 262 h206 a26 26 0 0 1 26 26 l16 118 a44 44 0 0 1 -44 50 H120 \
a44 44 0 0 1 -44 -50 l16 -118 a26 26 0 0 1 26 -26 z" fill="{DEEP}"/>
    <rect x="168" y="228" width="106" height="36" rx="14" fill="{BROWN}"/>
    <circle cx="221" cy="216" r="18" fill="{BROWN}"/>
    <path d="M112 300 q109 -60 218 0" fill="none" stroke="{BROWN}" stroke-width="15" \
stroke-linecap="round" opacity=".55"/>
    <path d="M62 300 c-52 10 -56 92 -6 118" fill="none" stroke="{DEEP}" stroke-width="20" \
stroke-linecap="round"/>
    <path d="M348 316 c86 4 116 40 142 96 c14 30 12 44 8 58" fill="none" stroke="{DEEP}" \
stroke-width="24" stroke-linecap="round"/>
  </g>
  <path d="M496 476 C500 500 502 500 502 500" stroke="{BROWN}" stroke-width="9" \
stroke-linecap="round" opacity=".75"/>
  {steam(500, 400, 1.1, BROWN, ".35")}"""
    write("verano/img/pour.svg", W, H, body)


def verano_room():
    """The room: arch window, tables, chairs, pendant, plant."""
    W, H = 1400, 1000
    floor = 760
    def table(x, s=1.0):
        return f"""
  <g transform="translate({x} {floor}) scale({s})">
    <ellipse cx="0" cy="-190" rx="128" ry="30" fill="{TAN}"/>
    <rect x="-10" y="-190" width="20" height="170" fill="{BROWN}"/>
    <path d="M-58 0 h116" stroke="{BROWN}" stroke-width="16" stroke-linecap="round"/>
    <g fill="{DEEP}">
      <g transform="translate(-186 0)">
        <rect x="-52" y="-182" width="104" height="20" rx="10"/>
        <rect x="-44" y="-162" width="14" height="162" rx="7"/>
        <rect x="30" y="-162" width="14" height="162" rx="7"/>
        <rect x="-46" y="-320" width="16" height="146" rx="8"/>
        <rect x="24" y="-320" width="16" height="146" rx="8"/>
        <rect x="-46" y="-318" width="86" height="15" rx="7"/>
        <rect x="-46" y="-250" width="86" height="12" rx="6" opacity=".75"/>
      </g>
      <g transform="translate(186 0)">
        <rect x="-52" y="-182" width="104" height="20" rx="10"/>
        <rect x="-44" y="-162" width="14" height="162" rx="7"/>
        <rect x="30" y="-162" width="14" height="162" rx="7"/>
        <rect x="-46" y="-320" width="16" height="146" rx="8"/>
        <rect x="24" y="-320" width="16" height="146" rx="8"/>
        <rect x="-46" y="-318" width="86" height="15" rx="7"/>
        <rect x="-46" y="-250" width="86" height="12" rx="6" opacity=".75"/>
      </g>
    </g>
    {cup_side(0, -190, 0.5)}
  </g>"""
    body = f"""
  <rect width="{W}" height="{floor}" fill="{CREAM}"/>
  <rect y="{floor}" width="{W}" height="{H - floor}" fill="{WOOD}"/>
  <rect y="{floor}" width="{W}" height="12" fill="{DEEP}" opacity=".2"/>
  <path d="M470 700 V330 a230 230 0 0 1 460 0 V700 Z" fill="{PAPER}"/>
  <path d="M470 700 V330 a230 230 0 0 1 460 0 V700" fill="none" stroke="{BROWN}" stroke-width="10"/>
  <path d="M700 100 V700 M470 460 H930" stroke="{BROWN}" stroke-width="8"/>
  <path d="M510 680 L860 340 M600 690 L900 400" stroke="{SAND}" stroke-width="30" opacity=".65"/>
  {pendant(240, 150, 1.0)}
  {pendant(1160, 120, 1.0)}
  {table(300, 0.92)}
  {table(1080, 0.92)}
  {plant(700, floor, 0.9)}"""
    write("verano/img/room.svg", W, H, body)


def verano_story():
    """The roaster: drum, hopper, chimney, sack of green coffee."""
    W, H = 1200, 1500
    floor = 1230
    body = f"""
  <rect width="{W}" height="{floor}" fill="{CREAM}"/>
  <rect y="{floor}" width="{W}" height="{H - floor}" fill="{WOOD}"/>
  <circle cx="620" cy="620" r="400" fill="{SAND}" opacity=".5"/>
  <!-- chimney -->
  <path d="M792 180 h74 v300 h-74 z" fill="{BROWN}"/>
  <path d="M780 160 h98 v34 h-98 z" fill="{DEEP}"/>
  <!-- hopper -->
  <path d="M300 300 h300 l-56 130 H356 z" fill="{TAN}"/>
  <rect x="286" y="278" width="328" height="30" rx="15" fill="{BROWN}"/>
  <!-- drum body -->
  <rect x="250" y="430" width="620" height="360" rx="46" fill="{CLAY_D}"/>
  <rect x="250" y="430" width="620" height="72" rx="36" fill="{BROWN}"/>
  <circle cx="470" cy="620" r="126" fill="{DEEP}"/>
  <circle cx="470" cy="620" r="94" fill="{TAN}"/>
  <circle cx="470" cy="620" r="94" fill="none" stroke="{BROWN}" stroke-width="10"/>
  <path d="M470 526 V714 M376 620 H564" stroke="{BROWN}" stroke-width="8" opacity=".7"/>
  <g fill="{TAN}">
    <circle cx="716" cy="560" r="34"/><circle cx="716" cy="660" r="34"/>
    <rect x="666" y="716" width="100" height="26" rx="13"/>
  </g>
  <!-- legs + tray -->
  <g fill="{BROWN}">
    <rect x="286" y="790" width="34" height="180"/>
    <rect x="800" y="790" width="34" height="180"/>
    <rect x="250" y="950" width="620" height="30" rx="15"/>
  </g>
  <path d="M360 790 h400 l-30 120 H390 z" fill="{DEEP}"/>
  <!-- sack of green coffee -->
  <g transform="translate(890 {floor})">
    <path d="M-176 0 q-16 -180 8 -276 q6 -26 34 -34 h124 q28 8 34 34 q24 96 8 276 z" fill="{SAND}"/>
    <path d="M-134 -310 q56 -40 116 -18 q34 12 56 18 q-30 34 -114 34 q-46 0 -58 -34 z" fill="{TAN}"/>
    <g stroke="{TAN}" stroke-width="11" opacity=".8">
      <path d="M-166 -196 h228 M-172 -120 h240 M-176 -44 h248"/>
    </g>
    <path d="M-40 -276 v240" stroke="{TAN}" stroke-width="9" opacity=".5"/>
  </g>
  <g>{bean(700, 1290, 30, 20)}{bean(790, 1330, 27, -28)}{bean(620, 1340, 25, 44)}
     {bean(520, 1296, 28, -16)}{bean(410, 1340, 26, 30)}</g>
  {steam(866, 150, 1.3, BROWN, ".3")}"""
    write("verano/img/story.svg", W, H, body)


def verano_bags():
    """Three pack shots, one per roast."""
    for name, body_c, band_c, spot, label in (
        ("bag-1", CLAY, CLAY_D, SAND, "VERANO"),
        ("bag-2", BROWN, DEEP, TAN, "VERANO"),
        ("bag-3", DEEP, INK, CLAY, "VERANO"),
    ):
        W, H = 900, 1100
        art = f"""
  <circle cx="450" cy="520" r="330" fill="{spot}" opacity=".55"/>
  <ellipse cx="450" cy="940" rx="270" ry="34" fill="{DEEP}" opacity=".14"/>
  {bag_shape(240, 240, 420, 690, body_c, band_c, name=label)}
  <g>{bean(190, 970, 28, 22)}{bean(700, 960, 26, -30)}{bean(760, 1010, 24, 40)}</g>"""
        write(f"verano/img/{name}.svg", W, H, art)




# ============================================================== Lacquer
L_BG = "#F7EFEC"
L_PAPER = "#FFFBF9"
L_ROSE = "#D89A93"
L_ROSE_D = "#B0505A"
L_BLUSH = "#EBCEC7"
L_PLUM = "#7E555C"
L_INK = "#2B2225"
L_SKIN = "#E8C6AF"
L_SKIN_D = "#D3A98F"
L_SAGE = "#8FA394"


def polish_bottle(x, y, s=1.0, colour=L_ROSE_D, cap=L_INK):
    """A polish bottle standing with its base at (x, y)."""
    return f"""
  <g transform="translate({x} {y}) scale({s})">
    <ellipse cx="0" cy="6" rx="86" ry="14" fill="{L_INK}" opacity=".12"/>
    <path d="M-78 0 v-150 q0 -22 22 -22 h112 q22 0 22 22 V0 z" fill="{colour}"/>
    <path d="M-78 -56 h156" stroke="{L_PAPER}" stroke-width="4" opacity=".28"/>
    <rect x="-30" y="-196" width="60" height="26" fill="{colour}" opacity=".8"/>
    <rect x="-44" y="-286" width="88" height="92" rx="12" fill="{cap}"/>
    <rect x="-44" y="-286" width="88" height="16" rx="8" fill="{L_PAPER}" opacity=".18"/>
    <rect x="-52" y="-128" width="104" height="66" rx="8" fill="{L_PAPER}" opacity=".92"/>
    <g fill="{L_PLUM}" opacity=".5">
      <rect x="-34" y="-112" width="68" height="7" rx="3.5"/>
      <rect x="-24" y="-96" width="48" height="6" rx="3"/>
    </g>
  </g>"""


def hand(x, y, s=1.0, nail=L_ROSE_D, tip=None, skin=L_SKIN):
    """A simplified hand seen from above, fingertips pointing up."""
    # (offset from centre, splay angle, length above the knuckle, width)
    fingers = [(-128, -9, 336, 80), (-43, -3, 392, 84),
               (43, 4, 360, 80), (128, 13, 288, 72)]
    out = []
    for fx, rot, length, w in fingers:
        top = -length
        nh = w * 1.18
        base = nail if not tip else tip
        out.append(f"""
    <g transform="rotate({rot} {fx} 60)">
      <rect x="{fx - w / 2:.0f}" y="{top}" width="{w}" height="{length + 150}" \
rx="{w / 2:.0f}" fill="{skin}"/>
      <rect x="{fx - w * 0.34:.0f}" y="{top + 12}" width="{w * 0.68:.0f}" \
height="{nh:.0f}" rx="{w * 0.30:.0f}" fill="{base}"/>""")
        if tip:
            out.append(f"""      <rect x="{fx - w * 0.34:.0f}" y="{top + 12 + nh * 0.34:.0f}" \
width="{w * 0.68:.0f}" height="{nh * 0.66:.0f}" rx="{w * 0.26:.0f}" fill="{nail}"/>""")
        out.append(f"""      <rect x="{fx - w * 0.20:.0f}" y="{top + 26}" \
width="{w * 0.12:.0f}" height="{nh * 0.42:.0f}" rx="{w * 0.06:.0f}" fill="{L_PAPER}" opacity=".45"/>
    </g>""")

    tw, tl = 92, 250
    thumb = f"""
    <g transform="rotate(-40 -168 190)">
      <rect x="{-168 - tw:.0f}" y="150" width="{tw}" height="{tl}" rx="{tw / 2:.0f}" fill="{skin}"/>
      <rect x="{-168 - tw * 0.83:.0f}" y="164" width="{tw * 0.66:.0f}" \
height="{tw * 1.12:.0f}" rx="{tw * 0.3:.0f}" fill="{nail if not tip else tip}"/>
    </g>"""

    return f"""
  <g transform="translate({x} {y}) scale({s})">
    <path d="M-176 60 q0 -46 52 -50 h248 q52 4 52 50 v246 q0 118 -136 118 \
q-136 0 -136 -118 z" fill="{skin}"/>
    {thumb}
    {''.join(out)}
    <g fill="none" stroke="{L_SKIN_D}" stroke-width="7" stroke-linecap="round" opacity=".45">
      <path d="M-118 250 q118 52 236 0"/>
      <path d="M-96 330 q96 40 192 0"/>
    </g>
  </g>"""


def lacquer_hands():
    """Hero: a finished manicure, hand resting on the table."""
    W, H = 1100, 1400
    body = f"""
  <circle cx="550" cy="620" r="430" fill="{L_BLUSH}" opacity=".8"/>
  <rect y="1120" width="{W}" height="280" fill="{L_PAPER}"/>
  <rect y="1120" width="{W}" height="10" fill="{L_ROSE}" opacity=".35"/>
  {hand(560, 800, 1.02, nail=L_ROSE_D)}
  {polish_bottle(180, 1240, 0.62, L_ROSE_D)}
  {polish_bottle(940, 1250, 0.54, L_PLUM)}"""
    write("lacquer/img/hands.svg", W, H, body, ground=L_BG)


def lacquer_studio():
    """The salon floor: stations, colour wall, lamp, plant."""
    W, H = 1400, 1000
    floor = 640
    wall = ""
    for r in range(3):
        for c in range(9):
            cx = 880 + c * 56
            cy = 210 + r * 96
            col = [L_ROSE, L_ROSE_D, L_PLUM, L_BLUSH, "#C8BFD4", "#8FA394",
                   "#E4C07A", "#2E2A2C", L_ROSE][(r * 9 + c) % 9]
            wall += f"""
    <rect x="{cx - 16}" y="{cy - 44}" width="32" height="52" rx="6" fill="{col}"/>
    <rect x="{cx - 9}" y="{cy - 62}" width="18" height="20" rx="4" fill="{L_INK}"/>"""
    body = f"""
  <rect width="{W}" height="{floor}" fill="{L_BG}"/>
  <rect y="{floor}" width="{W}" height="{H - floor}" fill="{L_PAPER}"/>
  <rect y="{floor}" width="{W}" height="8" fill="{L_ROSE}" opacity=".3"/>
  <!-- colour wall -->
  <rect x="840" y="140" width="530" height="330" rx="18" fill="{L_PAPER}"/>
  <g stroke="{L_BLUSH}" stroke-width="6">
    <path d="M856 236 h500 M856 332 h500 M856 428 h500"/>
  </g>
  {wall}
  <!-- window -->
  <path d="M120 620 V300 a180 180 0 0 1 360 0 V620 Z" fill="{L_PAPER}"/>
  <path d="M120 620 V300 a180 180 0 0 1 360 0 V620" fill="none" stroke="{L_PLUM}" stroke-width="9"/>
  <path d="M300 120 V620 M120 430 H480" stroke="{L_PLUM}" stroke-width="7"/>
  <path d="M150 600 L430 340 M230 610 L460 400" stroke="{L_BLUSH}" stroke-width="26" opacity=".7"/>
  <ellipse cx="700" cy="900" rx="620" ry="86" fill="{L_BLUSH}" opacity=".45"/>
  <!-- manicure stations -->
  <g>
    <rect x="140" y="700" width="480" height="28" rx="14" fill="{L_ROSE}"/>
    <rect x="180" y="728" width="24" height="130" fill="{L_PLUM}"/>
    <rect x="556" y="728" width="24" height="130" fill="{L_PLUM}"/>
    <rect x="250" y="648" width="170" height="52" rx="14" fill="{L_PAPER}"/>
    {polish_bottle(474, 700, 0.32, L_ROSE_D)}
    {polish_bottle(530, 700, 0.32, L_PLUM)}
  </g>
  <g opacity=".92">
    <rect x="700" y="716" width="420" height="24" rx="12" fill="{L_ROSE}"/>
    <rect x="734" y="740" width="20" height="118" fill="{L_PLUM}"/>
    <rect x="1066" y="740" width="20" height="118" fill="{L_PLUM}"/>
    {polish_bottle(1000, 716, 0.28, "#C8BFD4")}
  </g>
  <!-- chairs -->
  <g fill="{L_PLUM}">
    <g transform="translate(350 862)">
      <path d="M-86 -96 v-52 a86 86 0 0 1 172 0 v52 z"/>
      <ellipse cx="0" cy="-92" rx="94" ry="20"/>
      <rect x="-74" y="-92" width="16" height="92" rx="8"/>
      <rect x="58" y="-92" width="16" height="92" rx="8"/>
    </g>
    <g transform="translate(886 866)" opacity=".9">
      <path d="M-76 -86 v-46 a76 76 0 0 1 152 0 v46 z"/>
      <ellipse cx="0" cy="-82" rx="84" ry="18"/>
      <rect x="-64" y="-82" width="14" height="82" rx="7"/>
      <rect x="50" y="-82" width="14" height="82" rx="7"/>
    </g>
  </g>
  <!-- lamp -->
  <g>
    <path d="M1180 0 V180" stroke="{L_PLUM}" stroke-width="4"/>
    <path d="M1112 258 L1152 180 H1208 L1248 258 Z" fill="{L_ROSE_D}"/>
    <ellipse cx="1180" cy="258" rx="68" ry="9" fill="{L_INK}" opacity=".28"/>
  </g>
  <!-- plant -->
  <g transform="translate(1300 880)">
    <path d="M-54 0 h108 l-12 -94 h-84 z" fill="{L_ROSE}"/>
    <g fill="none" stroke="{L_SAGE}" stroke-width="7" stroke-linecap="round">
      <path d="M0 -98 V-230"/><path d="M0 -150 C-38 -172 -60 -208 -62 -246"/>
      <path d="M0 -178 C38 -200 62 -234 64 -272"/>
    </g>
    <g fill="{L_SAGE}">
      <ellipse cx="-66" cy="-258" rx="38" ry="23" transform="rotate(-32 -66 -258)"/>
      <ellipse cx="68" cy="-284" rx="40" ry="24" transform="rotate(28 68 -284)"/>
      <ellipse cx="0" cy="-256" rx="34" ry="46"/>
    </g>
  </g>"""
    write("lacquer/img/studio.svg", W, H, body, ground=L_BG)


def lacquer_work():
    """Four detail shots: a set, the bottles, a French tip, the swatch fan."""
    W, H = 900, 1150

    write("lacquer/img/work-1.svg", W, H, f"""
  <circle cx="450" cy="520" r="350" fill="{L_BLUSH}" opacity=".85"/>
  {hand(450, 760, 0.86, nail="#B0505A")}""", ground=L_BG)

    bottles = "".join(
        polish_bottle(210 + i * 240, 880, 0.86, c)
        for i, c in enumerate([L_ROSE, L_ROSE_D, L_PLUM]))
    write("lacquer/img/work-2.svg", W, H, f"""
  <rect y="880" width="{W}" height="{H - 880}" fill="{L_PAPER}"/>
  <circle cx="450" cy="520" r="330" fill="{L_BLUSH}" opacity=".6"/>
  {bottles}""", ground=L_BG)

    write("lacquer/img/work-3.svg", W, H, f"""
  <circle cx="450" cy="540" r="340" fill="#E3D8E4" opacity=".9"/>
  {hand(450, 780, 0.86, nail="#E8CFC6", tip=L_PAPER)}""", ground=L_BG)

    fan = ""
    cols = ["#E8CFC6", L_ROSE, L_ROSE_D, L_PLUM, "#C8BFD4", "#8FA394", "#E4C07A", "#2E2A2C"]
    for i, c in enumerate(cols):
        a = -62 + i * 17.5
        fan += f"""
    <g transform="rotate({a} 450 940)">
      <rect x="418" y="440" width="64" height="500" rx="32" fill="{c}"/>
      <circle cx="450" cy="490" r="17" fill="{L_PAPER}" opacity=".55"/>
    </g>"""
    write("lacquer/img/work-4.svg", W, H, f"""
  <circle cx="450" cy="560" r="360" fill="{L_BLUSH}" opacity=".55"/>
  {fan}
  <circle cx="450" cy="940" r="34" fill="{L_INK}"/>""", ground=L_BG)


# ================================================================== Halo
H_BG = "#EFEAE1"
H_PAPER = "#F7F4EE"
H_INK = "#231F1A"
H_SAND = "#D8CBB6"
H_TAN = "#B79B77"
H_STONE = "#C6B69C"
H_DEEP = "#6B6257"


def dropper(x, y, s=1.0, glass=H_SAND, liquid=H_TAN, cap=H_INK):
    """A serum bottle with a dropper cap, standing at (x, y)."""
    return f"""
  <g transform="translate({x} {y}) scale({s})">
    <ellipse cx="0" cy="8" rx="96" ry="16" fill="{H_INK}" opacity=".10"/>
    <path d="M-88 0 v-286 q0 -20 20 -20 h136 q20 0 20 20 V0 z" fill="{glass}"/>
    <path d="M-88 -86 h176 v66 q0 20 -20 20 h-136 q-20 0 -20 -20 z" fill="{liquid}"/>
    <path d="M-88 -190 h176" stroke="{H_PAPER}" stroke-width="3" opacity=".45"/>
    <rect x="-58" y="-334" width="116" height="30" rx="6" fill="{cap}" opacity=".85"/>
    <rect x="-44" y="-436" width="88" height="104" rx="10" fill="{cap}"/>
    <rect x="-44" y="-436" width="88" height="14" rx="7" fill="{H_PAPER}" opacity=".18"/>
    <rect x="-62" y="-250" width="124" height="120" rx="6" fill="{H_PAPER}" opacity=".9"/>
    <circle cx="0" cy="-216" r="17" fill="none" stroke="{H_INK}" stroke-width="4"/>
    <g fill="{H_DEEP}" opacity=".5">
      <rect x="-42" y="-186" width="84" height="7" rx="3.5"/>
      <rect x="-30" y="-168" width="60" height="6" rx="3"/>
    </g>
  </g>"""


def jar(x, y, s=1.0, body=H_PAPER, lid=H_STONE):
    return f"""
  <g transform="translate({x} {y}) scale({s})">
    <ellipse cx="0" cy="8" rx="110" ry="17" fill="{H_INK}" opacity=".10"/>
    <path d="M-104 0 v-138 h208 V0 z" fill="{body}"/>
    <ellipse cx="0" cy="-138" rx="104" ry="24" fill="{body}"/>
    <path d="M-112 -152 h224 v58 h-224 z" fill="{lid}"/>
    <ellipse cx="0" cy="-152" rx="112" ry="26" fill="{lid}"/>
    <ellipse cx="0" cy="-158" rx="86" ry="19" fill="{H_PAPER}" opacity=".28"/>
    <g fill="{H_DEEP}" opacity=".45">
      <rect x="-46" y="-84" width="92" height="8" rx="4"/>
      <rect x="-30" y="-62" width="60" height="6" rx="3"/>
    </g>
  </g>"""


def tube(x, y, s=1.0, body=H_STONE, cap=H_INK):
    return f"""
  <g transform="translate({x} {y}) scale({s})">
    <ellipse cx="0" cy="8" rx="72" ry="13" fill="{H_INK}" opacity=".10"/>
    <path d="M-66 0 v-300 q0 -18 18 -18 h96 q18 0 18 18 V0 z" fill="{body}"/>
    <path d="M-66 -344 h132 v26 h-132 z" fill="{cap}"/>
    <rect x="-40" y="-390" width="80" height="46" rx="8" fill="{cap}"/>
    <rect x="-46" y="-236" width="92" height="96" rx="5" fill="{H_PAPER}" opacity=".9"/>
    <g fill="{H_DEEP}" opacity=".5">
      <rect x="-30" y="-206" width="60" height="7" rx="3.5"/>
      <rect x="-20" y="-188" width="40" height="6" rx="3"/>
    </g>
  </g>"""


def halo_hero():
    """The range, lined up on a plinth."""
    W, H = 1800, 1250
    body = f"""
  <circle cx="900" cy="600" r="520" fill="{H_SAND}" opacity=".75"/>
  <g fill="none" stroke="{H_TAN}" stroke-width="3" opacity=".45">
    <circle cx="900" cy="600" r="596"/>
  </g>
  <rect y="1090" width="{W}" height="160" fill="{H_PAPER}"/>
  <rect y="1090" width="{W}" height="6" fill="{H_TAN}" opacity=".35"/>
  <rect x="420" y="1024" width="960" height="68" rx="6" fill="{H_STONE}" opacity=".5"/>
  {tube(600, 1024, 1.16, H_PAPER)}
  {dropper(900, 1024, 1.24)}
  {jar(1216, 1024, 1.16)}"""
    write("halo/img/hero.svg", W, H, body, ground=H_BG)


def halo_product():
    W, H = 1200, 1500
    body = f"""
  <circle cx="600" cy="700" r="400" fill="{H_SAND}" opacity=".8"/>
  <rect y="1180" width="{W}" height="320" fill="{H_PAPER}"/>
  {dropper(600, 1180, 1.5)}"""
    write("halo/img/product.svg", W, H, body, ground=H_BG)


def halo_ritual():
    W, H = 1400, 1000
    body = f"""
  <rect y="760" width="{W}" height="240" fill="{H_PAPER}"/>
  <circle cx="700" cy="450" r="330" fill="{H_SAND}" opacity=".7"/>
  {jar(700, 760, 1.35)}
  {tube(300, 760, 0.7, H_PAPER)}
  {dropper(1090, 760, 0.7)}"""
    write("halo/img/ritual.svg", W, H, body, ground=H_BG)


def halo_texture():
    """A swatch: one broad smear and a dollop, the way a PDP shows texture."""
    W, H = 1200, 1200
    body = f"""
  <path d="M150 720 C300 520 520 470 700 520 C900 576 1010 660 1046 760
           C1076 846 980 900 800 894 C600 888 380 880 250 838 C160 808 120 776 150 720 Z"
        fill="{H_STONE}" opacity=".95"/>
  <path d="M232 726 C360 596 560 560 700 596 C860 636 950 700 984 772"
        fill="none" stroke="{H_PAPER}" stroke-width="26" stroke-linecap="round" opacity=".7"/>
  <path d="M300 790 C420 700 590 676 700 700" fill="none" stroke="{H_TAN}"
        stroke-width="14" stroke-linecap="round" opacity=".45"/>
  <circle cx="880" cy="360" r="118" fill="{H_PAPER}"/>
  <circle cx="854" cy="330" r="40" fill="{H_SAND}" opacity=".8"/>
  <circle cx="336" cy="336" r="62" fill="{H_TAN}" opacity=".5"/>"""
    write("halo/img/texture.svg", W, H, body, ground=H_BG)


def halo_shades():
    """The same bottle, three finishes."""
    for n, (glass, liquid) in enumerate((
        (H_SAND, "#E4D6C2"), ("#DFCDB2", "#D7B98F"), ("#D2BC9C", "#B79B77")), start=1):
        W, H = 800, 1000
        body = f"""
  <circle cx="400" cy="450" r="300" fill="{liquid}" opacity=".35"/>
  <rect y="820" width="{W}" height="180" fill="{H_PAPER}"/>
  {dropper(400, 820, 0.92, glass, liquid)}"""
        write(f"halo/img/shade-{n}.svg", W, H, body, ground=H_BG)


# =================================================================== Ora
O_BG = "#121714"
O_WALL = "#182019"
O_FLOOR = "#263024"
O_CARD = "#1B241C"
O_IVORY = "#E9E6DC"
O_SAGE = "#9FB394"
O_SAGE_D = "#6E8265"
O_MUTE = "#4A5A46"


def reformer(x, y, s=1.0):
    """A pilates reformer seen from the side, base at (x, y)."""
    return f"""
  <g transform="translate({x} {y}) scale({s})">
    <rect x="-300" y="-54" width="600" height="20" rx="10" fill="{O_SAGE_D}"/>
    <rect x="-300" y="-40" width="600" height="10" rx="5" fill="{O_MUTE}"/>
    <rect x="-280" y="-30" width="26" height="30" rx="6" fill="{O_MUTE}"/>
    <rect x="254" y="-30" width="26" height="30" rx="6" fill="{O_MUTE}"/>
    <rect x="-170" y="-96" width="290" height="44" rx="12" fill="{O_IVORY}" opacity=".88"/>
    <rect x="-186" y="-104" width="70" height="16" rx="8" fill="{O_SAGE}"/>
    <path d="M250 -54 v-96" stroke="{O_MUTE}" stroke-width="14" stroke-linecap="round"/>
    <path d="M250 -150 h-64" stroke="{O_MUTE}" stroke-width="14" stroke-linecap="round"/>
    <g stroke="{O_SAGE_D}" stroke-width="6" fill="none" opacity=".85">
      <path d="M-296 -74 c40 -30 70 -30 110 0"/>
      <path d="M-296 -74 c50 -14 80 -14 120 0"/>
    </g>
    <path d="M-300 -150 v96 M-300 -150 h56" stroke="{O_MUTE}" stroke-width="12" stroke-linecap="round"/>
  </g>"""


def rolled_mat(x, y, s=1.0, colour=O_SAGE_D):
    return f"""
  <g transform="translate({x} {y}) scale({s})">
    <rect x="-34" y="-120" width="68" height="120" rx="34" fill="{colour}"/>
    <ellipse cx="0" cy="-120" rx="34" ry="12" fill="{O_SAGE}"/>
    <ellipse cx="0" cy="-120" rx="13" ry="5" fill="{O_MUTE}"/>
  </g>"""


def o_plant(x, y, s=1.0):
    return f"""
  <g transform="translate({x} {y}) scale({s})">
    <path d="M-52 0 h104 l-12 -92 h-80 z" fill="{O_MUTE}"/>
    <g fill="none" stroke="{O_SAGE_D}" stroke-width="7" stroke-linecap="round">
      <path d="M0 -96 V-240"/><path d="M0 -150 C-40 -176 -62 -212 -64 -252"/>
      <path d="M0 -180 C40 -206 64 -240 66 -280"/>
    </g>
    <g fill="{O_SAGE}" opacity=".85">
      <ellipse cx="-68" cy="-264" rx="40" ry="24" transform="rotate(-32 -68 -264)"/>
      <ellipse cx="70" cy="-292" rx="42" ry="25" transform="rotate(28 70 -292)"/>
      <ellipse cx="0" cy="-266" rx="36" ry="48"/>
    </g>
  </g>"""


def ora_hero():
    """The studio at first light: reformers in a row, tall windows."""
    W, H = 1800, 1150
    floor = 640
    body = f"""
  <rect width="{W}" height="{floor}" fill="{O_WALL}"/>
  <rect y="{floor}" width="{W}" height="{H - floor}" fill="{O_FLOOR}"/>
  <rect y="{floor}" width="{W}" height="8" fill="{O_SAGE}" opacity=".22"/>
  <!-- tall windows -->
  <g>
    <path d="M180 570 V230 a170 170 0 0 1 340 0 V570 Z" fill="{O_CARD}"/>
    <path d="M180 570 V230 a170 170 0 0 1 340 0 V570" fill="none" stroke="{O_SAGE_D}" stroke-width="8"/>
    <path d="M350 60 V570 M180 350 H520" stroke="{O_SAGE_D}" stroke-width="6"/>
    <path d="M210 552 L470 300 M280 562 L500 360" stroke="{O_SAGE}" stroke-width="24" opacity=".28"/>
  </g>
  <g>
    <path d="M700 570 V230 a170 170 0 0 1 340 0 V570 Z" fill="{O_CARD}"/>
    <path d="M700 570 V230 a170 170 0 0 1 340 0 V570" fill="none" stroke="{O_SAGE_D}" stroke-width="8"/>
    <path d="M870 60 V570 M700 350 H1040" stroke="{O_SAGE_D}" stroke-width="6"/>
    <path d="M730 552 L990 300 M800 562 L1020 360" stroke="{O_SAGE}" stroke-width="24" opacity=".28"/>
  </g>
  <!-- wall bars -->
  <g stroke="{O_MUTE}" stroke-width="12" stroke-linecap="round">
    <path d="M1280 150 V570 M1520 150 V570"/>
    <path d="M1280 230 H1520 M1280 320 H1520 M1280 410 H1520 M1280 500 H1520" stroke-width="9"/>
  </g>
  {reformer(600, 810, 1.0)}
  {reformer(1330, 780, 0.78)}
  {rolled_mat(1650, 830, 1.0)}
  {rolled_mat(1718, 830, 0.9, O_MUTE)}
  {o_plant(140, 830, 0.88)}"""
    write("ora/img/hero.svg", W, H, body, ground=O_BG, grain=0.16)


def ora_space():
    W, H = 1400, 1000
    floor = 700
    body = f"""
  <rect width="{W}" height="{floor}" fill="{O_WALL}"/>
  <rect y="{floor}" width="{W}" height="{H - floor}" fill="{O_FLOOR}"/>
  <rect y="{floor}" width="{W}" height="7" fill="{O_SAGE}" opacity=".22"/>
  <path d="M760 620 V300 a150 150 0 0 1 300 0 V620 Z" fill="{O_CARD}"/>
  <path d="M760 620 V300 a150 150 0 0 1 300 0 V620" fill="none" stroke="{O_SAGE_D}" stroke-width="8"/>
  <path d="M910 150 V620 M760 420 H1060" stroke="{O_SAGE_D}" stroke-width="6"/>
  <path d="M790 604 L1020 380" stroke="{O_SAGE}" stroke-width="22" opacity=".26"/>
  <g stroke="{O_MUTE}" stroke-width="11" stroke-linecap="round">
    <path d="M180 260 V620 M400 260 V620"/>
    <path d="M180 330 H400 M180 420 H400 M180 510 H400" stroke-width="8"/>
  </g>
  {reformer(700, 880, 0.86)}
  {rolled_mat(150, 890, 1.0)}
  {rolled_mat(222, 890, 0.9, O_MUTE)}
  {rolled_mat(288, 890, 0.85, O_SAGE_D)}
  {o_plant(1270, 890, 0.85)}"""
    write("ora/img/space.svg", W, H, body, ground=O_BG, grain=0.16)


def ora_coaches():
    """Three portrait plates -- silhouette busts on tinted grounds."""
    people = [
        ("coach-1", "#2B3629", "#8FA684", "bun"),
        ("coach-2", "#232D22", "#7E9472", "crop"),
        ("coach-3", "#2F3A2C", "#A3B899", "long"),
    ]
    for name, ground, fig, hair in people:
        W, H = 800, 1000
        if hair == "bun":
            back = (f'<circle cx="298" cy="330" r="52" fill="{fig}"/>'
                    f'<path d="M286 420 a114 108 0 0 1 228 0 z" fill="{fig}"/>')
        elif hair == "long":
            back = (f'<path d="M280 700 V420 a120 120 0 0 1 240 0 V700 '
                    f'q-44 -34 -120 -34 q-76 0 -120 34 z" fill="{fig}"/>')
        else:
            back = f'<path d="M292 430 a108 104 0 0 1 216 0 z" fill="{fig}"/>'
        body = f"""
  <circle cx="400" cy="440" r="272" fill="{fig}" opacity=".14"/>
  {back}
  <path d="M358 540 h84 v104 q-42 26 -84 0 z" fill="{fig}" opacity=".78"/>
  <ellipse cx="400" cy="436" rx="108" ry="126" fill="{fig}"/>
  <path d="M116 1000 v-118 q0 -136 132 -184 q66 -24 152 -24 q86 0 152 24
           q132 48 132 184 v118 z" fill="{fig}"/>"""
        write(f"ora/img/{name}.svg", W, H, body, ground=ground, grain=0.18)



# ============================================================ Fig & Vine
F_BG = "#14100E"
F_WALL = "#1C1613"
F_CARD = "#221A16"
F_IVORY = "#F2EAD9"
F_OCHRE = "#C79A4E"
F_OCHRE_D = "#8A6A34"
F_WOOD = "#4A3324"
F_WOOD_D = "#2E1F19"
F_EMBER = "#C4552A"
F_GREEN = "#4E5A38"


def candle(x, y, s=1.0):
    return f"""
  <g transform="translate({x} {y}) scale({s})">
    <circle cx="0" cy="-46" r="70" fill="{F_OCHRE}" opacity=".13"/>
    <rect x="-9" y="-46" width="18" height="46" rx="4" fill="{F_IVORY}" opacity=".85"/>
    <path d="M0 -76 c14 14 14 24 0 30 c-14 -6 -14 -16 0 -30 z" fill="{F_OCHRE}"/>
  </g>"""


def plate(cx, cy, r, rim=F_IVORY, face="#E7DCC6"):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{rim}"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r * 0.84:.0f}" fill="{face}"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r * 0.84:.0f}" fill="none" '
            f'stroke="{F_OCHRE_D}" stroke-width="3" opacity=".35"/>')


def fig_hero():
    """The room at service: hearth, hanging bulbs, tables, bottle shelf."""
    W, H = 1800, 1150
    floor = 700
    tables = ""
    for tx, ts in ((300, 1.0), (760, 0.92), (1230, 0.86)):
        tables += f"""
  <g transform="translate({tx} {floor + 210}) scale({ts})">
    <ellipse cx="0" cy="0" rx="176" ry="34" fill="{F_WOOD}"/>
    <ellipse cx="0" cy="-10" rx="176" ry="34" fill="{F_WOOD}"/>
    <rect x="-14" y="-10" width="28" height="120" fill="{F_WOOD_D}"/>
    <ellipse cx="0" cy="112" rx="76" ry="16" fill="{F_WOOD_D}"/>
    {candle(-52, -18, 0.9)}
    {candle(46, -22, 0.75)}
    <ellipse cx="112" cy="-16" rx="34" ry="9" fill="{F_IVORY}" opacity=".55"/>
  </g>"""
    bulbs = "".join(f"""
  <g>
    <path d="M{bx} 0 V{by}" stroke="{F_WOOD}" stroke-width="3"/>
    <circle cx="{bx}" cy="{by + 26}" r="26" fill="{F_OCHRE}" opacity=".9"/>
    <circle cx="{bx}" cy="{by + 26}" r="86" fill="{F_OCHRE}" opacity=".10"/>
  </g>""" for bx, by in ((420, 190), (900, 140), (1380, 220)))

    body = f"""
  <rect width="{W}" height="{floor}" fill="{F_WALL}"/>
  <rect y="{floor}" width="{W}" height="{H - floor}" fill="{F_CARD}"/>
  <rect y="{floor}" width="{W}" height="7" fill="{F_OCHRE}" opacity=".22"/>
  <!-- hearth -->
  <g>
    <path d="M1470 {floor} V430 a190 190 0 0 1 380 0 V{floor} Z" fill="{F_WOOD_D}"/>
    <path d="M1530 {floor} V470 a130 130 0 0 1 260 0 V{floor} Z" fill="#0C0907"/>
    <circle cx="1660" cy="600" r="150" fill="{F_EMBER}" opacity=".22"/>
    <path d="M1600 660 q30 -70 60 -96 q30 26 60 96 z" fill="{F_EMBER}"/>
    <path d="M1626 660 q22 -46 34 -62 q18 20 34 62 z" fill="{F_OCHRE}"/>
    <rect x="1560" y="648" width="200" height="14" rx="7" fill="{F_WOOD}"/>
  </g>
  <!-- bottle shelf -->
  <g>
    <rect x="120" y="330" width="620" height="12" fill="{F_WOOD}"/>
    <rect x="120" y="210" width="620" height="12" fill="{F_WOOD}"/>
    {''.join(f'<g><rect x="{150 + i * 56}" y="{258}" width="26" height="72" rx="5" fill="{F_GREEN if i % 2 else F_WOOD_D}"/><rect x="{159 + i * 56}" y="{236}" width="8" height="24" fill="{F_GREEN if i % 2 else F_WOOD_D}"/></g>' for i in range(10))}
    {''.join(f'<g><rect x="{150 + i * 56}" y="{138}" width="26" height="72" rx="5" fill="{F_OCHRE_D if i % 2 else F_WOOD_D}"/><rect x="{159 + i * 56}" y="{116}" width="8" height="24" fill="{F_OCHRE_D if i % 2 else F_WOOD_D}"/></g>' for i in range(10))}
  </g>
  {bulbs}
  {tables}"""
    write("fig/img/hero.svg", W, H, body, ground=F_BG, grain=0.16)


def fig_room():
    W, H = 1400, 1000
    floor = 620
    body = f"""
  <rect width="{W}" height="{floor}" fill="{F_WALL}"/>
  <rect y="{floor}" width="{W}" height="{H - floor}" fill="{F_CARD}"/>
  <rect y="{floor}" width="{W}" height="6" fill="{F_OCHRE}" opacity=".2"/>
  <!-- banquette -->
  <path d="M80 {floor} v-210 q0 -40 40 -40 h520 q40 0 40 40 v210 z" fill="{F_WOOD}"/>
  <path d="M110 {floor - 90} h500" stroke="{F_WOOD_D}" stroke-width="10" opacity=".6"/>
  <!-- arch window -->
  <path d="M840 560 V300 a140 140 0 0 1 280 0 V560 Z" fill="#0F0C0A"/>
  <path d="M840 560 V300 a140 140 0 0 1 280 0 V560" fill="none" stroke="{F_WOOD}" stroke-width="9"/>
  <path d="M980 160 V560 M840 410 H1120" stroke="{F_WOOD}" stroke-width="7"/>
  <g>
    <path d="M300 0 V150" stroke="{F_WOOD}" stroke-width="3"/>
    <circle cx="300" cy="176" r="26" fill="{F_OCHRE}" opacity=".9"/>
    <circle cx="300" cy="176" r="88" fill="{F_OCHRE}" opacity=".1"/>
    <path d="M1000 0 V120" stroke="{F_WOOD}" stroke-width="3"/>
    <circle cx="1000" cy="146" r="22" fill="{F_OCHRE}" opacity=".9"/>
    <circle cx="1000" cy="146" r="76" fill="{F_OCHRE}" opacity=".1"/>
  </g>
  <g transform="translate(380 800)">
    <ellipse cx="0" cy="0" rx="200" ry="38" fill="{F_WOOD}"/>
    <ellipse cx="0" cy="-12" rx="200" ry="38" fill="{F_WOOD}"/>
    <rect x="-16" y="-12" width="32" height="130" fill="{F_WOOD_D}"/>
    {candle(-70, -22, 1.0)}
    {candle(60, -26, 0.8)}
    <ellipse cx="132" cy="-18" rx="40" ry="11" fill="{F_IVORY}" opacity=".5"/>
  </g>
  <g transform="translate(1080 830)">
    <ellipse cx="0" cy="0" rx="150" ry="30" fill="{F_WOOD}"/>
    <ellipse cx="0" cy="-10" rx="150" ry="30" fill="{F_WOOD}"/>
    <rect x="-13" y="-10" width="26" height="110" fill="{F_WOOD_D}"/>
    {candle(-40, -18, 0.85)}
  </g>"""
    write("fig/img/room.svg", W, H, body, ground=F_BG, grain=0.16)


def fig_chef():
    """At the pass: a figure plating, hearth glow, hanging pans."""
    W, H = 1100, 1400
    pass_y = 980
    body = f"""
  <rect width="{W}" height="{pass_y}" fill="{F_WALL}"/>
  <rect y="{pass_y}" width="{W}" height="{H - pass_y}" fill="{F_CARD}"/>
  <circle cx="560" cy="520" r="360" fill="{F_OCHRE}" opacity=".10"/>
  <!-- hanging pans -->
  <g>
    <rect x="180" y="150" width="740" height="12" rx="6" fill="{F_WOOD}"/>
    {''.join(f'<g><path d="M{px} 162 v40" stroke="{F_WOOD}" stroke-width="6"/><circle cx="{px}" cy="{242}" r="{r}" fill="{F_WOOD_D}"/><circle cx="{px}" cy="{242}" r="{r - 10}" fill="{F_CARD}"/></g>' for px, r in ((280, 54), (420, 44), (560, 60), (700, 46), (830, 52)))}
  </g>
  <!-- figure -->
  <g>
    <ellipse cx="560" cy="560" rx="104" ry="120" fill="{F_IVORY}" opacity=".82"/>
    <path d="M456 500 a104 100 0 0 1 208 0 z" fill="{F_WOOD_D}"/>
    <path d="M452 472 h216 v-34 a108 30 0 0 0 -216 0 z" fill="{F_IVORY}" opacity=".9"/>
    <path d="M330 {pass_y} v-160 q0 -150 230 -150 q230 0 230 150 v160 z" fill="{F_IVORY}" opacity=".82"/>
    <path d="M560 682 v298" stroke="{F_WOOD_D}" stroke-width="8" opacity=".35"/>
  </g>
  <!-- the pass -->
  <rect y="{pass_y}" width="{W}" height="26" fill="{F_WOOD}"/>
  {plate(300, 1080, 92)}
  {plate(830, 1096, 78)}
  <g>{candle(560, 1070, 1.1)}</g>"""
    write("fig/img/chef.svg", W, H, body, ground=F_BG, grain=0.16)


def fig_plates():
    """Three plated dishes, seen from above."""
    W = H = 1000
    cx = cy = 500

    bread = "".join(f"""
    <g transform="translate({dx} {dy}) rotate({a} {cx} {cy})">
      <rect x="{cx - 190}" y="{cy - 52}" width="250" height="104" rx="30" fill="#D9B278"/>
      <rect x="{cx - 190}" y="{cy - 52}" width="250" height="104" rx="30" fill="none"
            stroke="{F_WOOD}" stroke-width="8" opacity=".5"/>
      <path d="M{cx - 150} {cy - 16} h170 M{cx - 140} {cy + 18} h150" stroke="{F_WOOD}"
            stroke-width="6" stroke-linecap="round" opacity=".25"/>
    </g>""" for a, dx, dy in ((-22, 40, -120), (4, 10, 0), (24, 60, 120)))
    write("fig/img/plate-1.svg", W, H, f"""
  {plate(cx, cy, 400)}
  {bread}
  <g transform="translate(660 560)">
    <ellipse cx="0" cy="0" rx="76" ry="52" transform="rotate(-18)" fill="#F0E2C0"/>
    <path d="M-40 -8 q40 -26 78 -6" fill="none" stroke="{F_OCHRE}" stroke-width="7"
          stroke-linecap="round" opacity=".6"/>
  </g>
  <circle cx="330" cy="700" r="11" fill="{F_WOOD}" opacity=".6"/>
  <circle cx="378" cy="726" r="8" fill="{F_WOOD}" opacity=".5"/>""", ground=F_BG, grain=0.18)

    wedges = "".join(f"""
    <g transform="rotate({a} {cx} {cy})">
      <path d="M{cx - 96} {cy + 120} L{cx} {cy - 160} L{cx + 96} {cy + 120} Z" fill="{F_GREEN}"/>
      <path d="M{cx - 60} {cy + 40} L{cx + 60} {cy + 40} M{cx - 40} {cy - 30} L{cx + 40} {cy - 30}"
            stroke="{F_WOOD_D}" stroke-width="9" stroke-linecap="round" opacity=".75"/>
    </g>""" for a in (-30, 6, 40))
    write("fig/img/plate-2.svg", W, H, f"""
  {plate(cx, cy, 400)}
  {wedges}
  <g transform="translate(690 660)">
    <path d="M0 0 a70 70 0 0 1 0 -110 z" fill="#E9C86A"/>
    <path d="M0 0 a70 70 0 0 1 0 -110" fill="none" stroke="{F_IVORY}" stroke-width="8"/>
  </g>
  <g fill="{F_OCHRE}" opacity=".7">
    <circle cx="320" cy="700" r="9"/><circle cx="360" cy="726" r="7"/><circle cx="286" cy="656" r="6"/>
  </g>""", ground=F_BG, grain=0.18)

    write("fig/img/plate-3.svg", W, H, f"""
  {plate(cx, cy, 400)}
  <g transform="translate({cx} {cy}) rotate(-12)">
    <path d="M-250 0 q120 -140 250 -140 q130 0 190 140 q-60 140 -190 140 q-130 0 -250 -140 z"
          fill="#9A8A72"/>
    <path d="M-250 0 l-96 -104 v208 z" fill="#9A8A72"/>
    <path d="M-140 -60 q80 -46 170 -46 M-120 60 q80 46 170 46" fill="none"
          stroke="{F_WOOD}" stroke-width="8" stroke-linecap="round" opacity=".5"/>
    <path d="M40 -140 q40 60 0 120" fill="none" stroke="{F_WOOD}" stroke-width="9"
          stroke-linecap="round" opacity=".45"/>
    <circle cx="330" cy="-18" r="17" fill="{F_WOOD_D}"/>
    <path d="M120 -104 q60 -40 96 -8" fill="none" stroke="{F_WOOD}" stroke-width="7"
          stroke-linecap="round" opacity=".4"/>
  </g>
  <g transform="translate(300 730)">
    <path d="M0 0 a64 64 0 0 1 0 -100 z" fill="#E9C86A"/>
  </g>""", ground=F_BG, grain=0.18)


def main():
    gen_art.main()
    verano_hero()
    verano_latte()
    verano_pour()
    verano_room()
    verano_story()
    verano_bags()
    lacquer_hands()
    lacquer_studio()
    lacquer_work()
    halo_hero()
    halo_product()
    halo_ritual()
    halo_texture()
    halo_shades()
    ora_hero()
    ora_space()
    ora_coaches()
    fig_hero()
    fig_room()
    fig_chef()
    fig_plates()
    print("wrote scenes")


if __name__ == "__main__":
    main()

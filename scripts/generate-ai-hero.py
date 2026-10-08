"""Create an abstract, text-free hero image for an AI research team page.

Run with the bundled Python environment (Pillow and NumPy required):
    python scripts/generate-ai-hero.py
Writes public/images/research/ai/hero.png (2880x940, 2x of the 1440x470 banner).
All motifs stay inside the vertical safe band 0.30H-0.70H and x <= 2380, so the
object-fit: cover crop on wide monitors and on mobile never cuts them.
"""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


OUT = Path(__file__).resolve().parents[1] / "public" / "images" / "research" / "ai" / "hero.png"
W, H, SCALE = 2880, 940, 2
SW, SH = W * SCALE, H * SCALE
RNG = np.random.default_rng(14)
CY = H / 2  # vertical centre of the composition
BAND = (0.30 * H, 0.70 * H)  # always visible under object-fit: cover

CYAN = (93, 222, 230)
BLUE = (105, 151, 255)
VIOLET = (175, 150, 255)
AMBER = (255, 177, 119)
WHITE = (218, 242, 250)


def pt(x: float, y: float) -> tuple[int, int]:
    return round(x * SCALE), round(y * SCALE)


def box(x0: float, y0: float, x1: float, y1: float) -> tuple[int, int, int, int]:
    return (*pt(x0, y0), *pt(x1, y1))


def bezier(points: list[tuple[float, float]], steps: int = 70) -> list[tuple[int, int]]:
    p0, p1, p2, p3 = points
    path = []
    for t in np.linspace(0, 1, steps):
        u = 1 - t
        x = u**3 * p0[0] + 3 * u**2 * t * p1[0] + 3 * u * t**2 * p2[0] + t**3 * p3[0]
        y = u**3 * p0[1] + 3 * u**2 * t * p1[1] + 3 * u * t**2 * p2[1] + t**3 * p3[1]
        path.append(pt(x, y))
    return path


def stroke(draw: ImageDraw.ImageDraw, xy, color, width=1):
    draw.line(xy, fill=color, width=max(1, round(width * SCALE)), joint="curve")


def dot(draw: ImageDraw.ImageDraw, x, y, r, color):
    draw.ellipse(box(x - r, y - r, x + r, y + r), fill=color)


# Deep blue background, with most light concentrated behind the artwork.
yy, xx = np.mgrid[0:SH, 0:SW].astype(np.float32)
xn, yn = xx / SCALE, yy / SCALE
base = np.zeros((SH, SW, 3), dtype=np.float32)
base[:] = (7, 18, 35)
right_light = np.exp(-(((xn - 1740) / 960) ** 2 + ((yn - CY) / 520) ** 2) * 1.5)
upper_light = np.exp(-(((xn - 2300) / 840) ** 2 + ((yn - 20) / 400) ** 2) * 1.6)
base += right_light[..., None] * np.array([5, 24, 42])
base += upper_light[..., None] * np.array([5, 5, 24])
noise = RNG.normal(0, 0.48, (SH, SW, 1))
base = np.clip(base + noise, 0, 255).astype(np.uint8)
image = Image.fromarray(base, "RGB").convert("RGBA")

lines = Image.new("RGBA", (SW, SH))
glow = Image.new("RGBA", (SW, SH))
d = ImageDraw.Draw(lines)
g = ImageDraw.Draw(glow)


def placer(ox, oy, px, py, s):
    """Map a motif drawn around (ox, oy) to centre (px, py) at scale s."""
    return lambda x, y: (px + s * (x - ox), py + s * (y - oy))


# Quiet technical grid, deliberately faint under the future page title.
for x in range(40, W, 84):
    alpha = 6 if x < 1100 else 13
    stroke(d, [pt(x, 0), pt(x, H)], (125, 190, 235, alpha), 0.7)
for y in range(15, H, 84):
    stroke(d, [pt(0, y), pt(W, y)], (125, 190, 235, 9), 0.7)

# Layout: hub in the right ~60%, four satellites inside the safe band.
hub = (1740, CY)
MS = 0.88  # motif scale
SAT_DY = 95
UL, UR = (1290, CY - SAT_DY), (2230, CY - SAT_DY)
LL, LR = (1265, CY + SAT_DY), (2235, CY + SAT_DY)

# Sweeping data paths draw the eye from the title area to the research network.
for offset, alpha in [(0, 17), (32, 10), (-32, 10)]:
    path = bezier([(760, CY + 160 + offset), (1100, CY - 20 + offset),
                   (1250, CY), (1590, CY)])
    stroke(d, path, (*CYAN, alpha), 1.4)
for offset in (-45, 0, 45):
    path = bezier([(900, CY - 130 + offset), (1180, CY - 90 + offset),
                   (1300, CY - 40), (1590, CY - 10)])
    stroke(d, path, (*BLUE, 11), 1)

# Research nodes and elegant curved connections around a shared AI core.
satellites = [
    (UL, CYAN, [(1620, CY - 50), (1480, CY - 85)]),
    (UR, AMBER, [(1860, CY - 50), (1990, CY - 85)]),
    (LL, VIOLET, [(1620, CY + 50), (1480, CY + 85)]),
    (LR, BLUE, [(1860, CY + 50), (1990, CY + 85)]),
]
for end, color, controls in satellites:
    p = bezier([hub, controls[0], controls[1], end])
    stroke(g, p, (*color, 75), 10)
    stroke(d, p, (*color, 95), 2)
    stroke(d, p, (*WHITE, 84), 0.7)
    for t in (0.3, 0.57, 0.82):
        q = p[round(t * (len(p) - 1))]
        g.ellipse((q[0] - 11 * SCALE, q[1] - 11 * SCALE,
                   q[0] + 11 * SCALE, q[1] + 11 * SCALE), fill=(*color, 90))
        d.ellipse((q[0] - 2 * SCALE, q[1] - 2 * SCALE,
                   q[0] + 2 * SCALE, q[1] + 2 * SCALE), fill=(*WHITE, 225))

# A translucent central processor with concentric orbital guides.
HS = 0.78  # hub scale: outer ring (r=168) stays inside the safe band
for radius, alpha in [(215, 14), (178, 25), (145, 48), (112, 63)]:
    r = radius * HS
    d.ellipse(box(hub[0] - r, hub[1] - r, hub[0] + r, hub[1] + r),
              outline=(*CYAN, alpha), width=2 * SCALE)
for radius, alpha in [(124, 80), (86, 100)]:
    r = radius * HS
    g.ellipse(box(hub[0] - r, hub[1] - r, hub[0] + r, hub[1] + r),
              outline=(*CYAN, alpha), width=12 * SCALE)
for k in range(48):
    a = k * math.tau / 48
    r = (178 if k % 4 else 184) * HS
    x, y = hub[0] + r * math.cos(a), hub[1] + r * math.sin(a)
    dot(d, x, y, (1.5 if k % 4 else 2.7) * HS, (*CYAN, 60 if k % 4 else 120))

chip = (hub[0] - 77 * HS, hub[1] - 77 * HS, hub[0] + 77 * HS, hub[1] + 77 * HS)
d.rounded_rectangle(box(*chip), radius=24 * HS * SCALE,
                    fill=(19, 57, 84, 235), outline=(*CYAN, 185), width=2 * SCALE)
g.rounded_rectangle(box(*chip), radius=24 * HS * SCALE,
                    outline=(*CYAN, 130), width=13 * SCALE)
for i in range(5):
    for j in range(5):
        cx, cy = hub[0] + (i - 2) * 27 * HS, hub[1] + (j - 2) * 27 * HS
        dot(d, cx, cy, 3.2 * HS, (*WHITE, 200 if (i + j) % 3 == 0 else 110))
        if i < 4 and (i + j) % 2 == 0:
            stroke(d, [pt(cx + 4 * HS, cy), pt(cx + 23 * HS, cy)], (*CYAN, 68), 1)
        if j < 4 and (i + j) % 2:
            stroke(d, [pt(cx, cy + 4 * HS), pt(cx, cy + 23 * HS)], (*CYAN, 68), 1)
for i in range(6):
    p = hub[0] + (i - 2.5) * 25 * HS
    q = hub[1] + (i - 2.5) * 25 * HS
    for a, b in [((p, chip[1] - 10 * HS), (p, chip[1])),
                 ((p, chip[3]), (p, chip[3] + 10 * HS)),
                 ((chip[0] - 10 * HS, q), (chip[0], q)),
                 ((chip[2], q), (chip[2] + 10 * HS, q))]:
        stroke(d, [pt(*a), pt(*b)], (*CYAN, 150), 2)

# Upper left: a single bright route through a branching model.
T = placer(1280, 213 - 16, *UL, MS)
bx, by = 1280, 213
levels = [[(bx, by - 74)], [(bx - 50, by - 22), (bx + 50, by - 22)],
          [(bx - 85, by + 42), (bx - 18, by + 42),
           (bx + 22, by + 42), (bx + 90, by + 42)]]
for parent, children in [(levels[0][0], levels[1]),
                         (levels[1][0], levels[2][:2]),
                         (levels[1][1], levels[2][2:])]:
    for child in children:
        selected = child in [levels[1][1], levels[2][2]] and parent in [levels[0][0], levels[1][1]]
        c = CYAN if selected else BLUE
        stroke(d, [pt(*T(*parent)), pt(*T(*child))], (*c, 220 if selected else 72),
               (2.5 if selected else 1.2) * MS)
        if selected:
            stroke(g, [pt(*T(*parent)), pt(*T(*child))], (*CYAN, 135), 10)
for level in levels:
    for node in level:
        active = node in [levels[0][0], levels[1][1], levels[2][2]]
        dot(g, *T(*node), (13 if active else 7) * MS, (*CYAN, 100 if active else 30))
        node_color = WHITE if active else BLUE
        dot(d, *T(*node), (5.5 if active else 3.5) * MS, (*node_color, 240 if active else 95))

# Upper right: temperature distribution in a perspective room/cube.
T = placer(2050, 223 + 13, *UR, MS)
cx, cy = 2050, 223
front = [(cx - 92, cy - 20), (cx + 44, cy - 20),
         (cx + 44, cy + 101), (cx - 92, cy + 101)]
back = [(x + 53, y - 54) for x, y in front]
for poly in (front, back):
    stroke(d, [pt(*T(*p)) for p in poly + [poly[0]]], (*AMBER, 135), 1.4 * MS)
for a, b in zip(front, back):
    stroke(d, [pt(*T(*a)), pt(*T(*b))], (*AMBER, 110), 1.4 * MS)
for j in range(4):
    y = cy + 6 + j * 24
    path = bezier([T(cx - 88, y), T(cx - 30, y - 23),
                   T(cx + 20, y + 27), T(cx + 92, y - 13)])
    stroke(d, path, (*AMBER, 50 + j * 13), 1.2 * MS)
for i in range(25):
    x = cx - 65 + (i % 5) * 34
    y = cy + (i // 5) * 23
    dot(d, *T(x, y), 2.3 * MS, (*AMBER, 45 + (i % 4) * 26))
g.ellipse(box(*T(cx - 18, cy + 1), *T(cx + 76, cy + 92)), fill=(*AMBER, 43))

# Lower left: redacted medical record with a privacy shield.
dx, dy = 1254, 770
T = placer(dx + 15, dy - 3, *LL, MS)
d.rounded_rectangle(box(*T(dx - 76, dy - 97), *T(dx + 57, dy + 90)),
                    radius=11 * MS * SCALE, fill=(26, 39, 72, 220),
                    outline=(*VIOLET, 155), width=2 * SCALE)
for j, length in enumerate([65, 88, 74, 85, 58]):
    y = dy - 56 + j * 25
    stroke(d, [pt(*T(dx - 50, y)), pt(*T(dx - 50 + length, y))],
           (*WHITE, 110 if j != 2 else 35), 3 * MS)
for x, y, width in [(dx - 27, dy - 32, 40), (dx - 50, dy + 18, 65)]:
    d.rounded_rectangle(box(*T(x, y - 7), *T(x + width, y + 7)), radius=3 * MS * SCALE,
                        fill=(*VIOLET, 180))
shield = [(dx + 49, dy + 18), (dx + 98, dy - 4),
          (dx + 105, dy + 47), (dx + 78, dy + 81),
          (dx + 51, dy + 47)]
d.polygon([pt(*T(*p)) for p in shield], fill=(26, 49, 86, 240))
stroke(d, [pt(*T(*p)) for p in shield + [shield[0]]], (*VIOLET, 205), 2)
stroke(g, [pt(*T(*p)) for p in shield + [shield[0]]], (*VIOLET, 90), 10)
stroke(d, [pt(*T(dx + 65, dy + 38)), pt(*T(dx + 76, dy + 49)),
           pt(*T(dx + 91, dy + 27))], (*WHITE, 225), 3 * MS)

# Lower right: collaborating devices and batches of data.
T = placer(2055, 755, *LR, MS)
centers = [T(1950, 805), T(2055, 707), T(2162, 806)]
for a, b in [(centers[0], centers[1]), (centers[1], centers[2]),
             (centers[0], centers[2])]:
    stroke(d, [pt(*a), pt(*b)], (*BLUE, 96), 1.4)
    stroke(g, [pt(*a), pt(*b)], (*BLUE, 55), 8)
for i, (x, y) in enumerate(centers):
    w, h = ((75, 59) if i != 1 else (82, 65))
    w, h = w * MS, h * MS
    d.rounded_rectangle(box(x - w / 2, y - h / 2, x + w / 2, y + h / 2),
                        radius=8 * MS * SCALE, fill=(22, 49, 85, 235),
                        outline=(*BLUE, 188), width=2 * SCALE)
    for k in range(3):
        dot(d, x + (k - 1) * 17 * MS, y, 3.4 * MS, (*WHITE, 190 if k == 1 else 100))
    stroke(d, [pt(x - 16 * MS, y + h / 2 + 6 * MS), pt(x + 16 * MS, y + h / 2 + 6 * MS)],
           (*BLUE, 125), 2)
for x, y in [(2002, 765), (2108, 761), (2055, 805)]:
    dot(g, *T(x, y), 15 * MS, (*CYAN, 75))
    dot(d, *T(x, y), 4 * MS, (*WHITE, 205))

# Small star-like data samples give the composition depth without becoming busy.
for _ in range(180):
    x = RNG.uniform(1100, 2380)
    y = RNG.uniform(BAND[0] - 120, BAND[1] + 120)
    if math.hypot(x - hub[0], y - hub[1]) < 190:
        continue
    r = RNG.uniform(0.5, 1.5)
    dot(d, x, y, r, (*WHITE, int(RNG.uniform(20, 85))))

image = Image.alpha_composite(image, glow.filter(ImageFilter.GaussianBlur(15 * SCALE)))
image = Image.alpha_composite(image, lines)
image = image.convert("RGB").resize((W, H), Image.Resampling.LANCZOS)
image.save(OUT, optimize=True)
print(OUT)

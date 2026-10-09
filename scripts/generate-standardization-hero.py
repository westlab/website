"""Create the hero image for the technical standardization research topic.

Run with the bundled Python environment (Pillow and NumPy required):
    python scripts/generate-standardization-hero.py
Writes public/images/research/standardization/hero.jpg (1920x627, JPEG).
Drawing happens at 2880x940 and is downscaled on save to stay within the
image size limits (scripts/image-limits.mjs).
Irregular hexagons (diverse, unstandardized) converge into a uniform hexagon cluster (the
standard). The banner is shown with object-fit: cover at a fixed 470px height, so every
motif stays inside the safe band y in [0.30H, 0.70H] and x in [1100, 2380]; the left stays
calm for the white page title. Only background stars/grid span the full canvas.
"""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


OUT = Path(__file__).resolve().parents[1] / "public" / "images" / "research" / "standardization" / "hero.jpg"
W, H = 2880, 940
OUT_W, OUT_H = 1920, 627  # committed size; matches the size limits
CY = H / 2
BAND = (0.30 * H, 0.70 * H)  # always visible under object-fit: cover
RNG = np.random.default_rng(42)

NAVY_DARK = (2, 3, 36)
NAVY_MID = (6, 14, 56)
ACCENT = (0, 60, 245)
STEEL = (37, 86, 133)
STEEL_LIGHT = (58, 104, 141)
BRIGHT_CYAN = (120, 210, 240)
HAZE = (130, 150, 158)


def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def build_background() -> Image.Image:
    img = Image.new("RGB", (W, H))
    px = img.load()
    for y in range(H):
        row = lerp(NAVY_DARK, NAVY_MID, y / (H - 1))
        for x in range(W):
            px[x, y] = row
    return img


def add_glow(img, cx, cy, rx, ry, color, strength):
    glow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(glow).ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=int(255 * strength))
    glow = glow.filter(ImageFilter.GaussianBlur(rx / 2.2))
    img.paste(Image.new("RGB", (W, H), color), (0, 0), glow)
    return img


def add_grid(img, spacing=81, color=(90, 140, 200), alpha=9):
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for x in range(0, W, spacing):
        od.line([(x, 0), (x, H)], fill=color + (alpha,), width=1)
    for y in range(0, H, spacing):
        od.line([(0, y), (W, y)], fill=color + (alpha,), width=1)
    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")


def add_particles(img, n=360):
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for _ in range(n):
        x = RNG.uniform(0, W)
        y = RNG.uniform(0, H)
        r = RNG.uniform(0.6, 2.2)
        a = int(RNG.uniform(40, 160))
        od.ellipse([x - r, y - r, x + r, y + r], fill=HAZE + (a,))
    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")


def hexagon(cx, cy, r, rotation_deg, jitter):
    pts = []
    for k in range(6):
        ang = math.radians(60 * k + rotation_deg)
        rad = r * (1 + (RNG.uniform(-1, 1) * jitter if jitter > 0 else 0))
        pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
    return pts


def draw_convergence(img) -> None:
    draw = ImageDraw.Draw(img, "RGBA")

    # A gentle upward arc: jitter and rotation fade to zero as t -> 1.
    start = (1180, CY + 90)
    end = (2000, CY)
    n_steps = 9
    base_r = 40

    centers = []
    for i in range(n_steps):
        t = i / (n_steps - 1)
        ease = t * t
        cx = start[0] + (end[0] - start[0]) * t + RNG.uniform(-12, 12) * (1 - ease)
        cy = start[1] + (end[1] - start[1]) * t + RNG.uniform(-12, 12) * (1 - ease)
        centers.append((cx, cy, t))

    path_pts = [(c[0], c[1]) for c in centers]
    for i in range(len(path_pts) - 1):
        a = int(30 + 90 * (i / len(path_pts)))
        draw.line([path_pts[i], path_pts[i + 1]], fill=BRIGHT_CYAN + (a,), width=2)

    for cx, cy, t in centers:
        jitter = max(0.0, 0.55 * (1 - t) ** 1.6)
        rotation = RNG.uniform(-25, 25) * (1 - t)
        r = base_r * (0.85 + 0.3 * t)
        color = lerp(STEEL, BRIGHT_CYAN, min(1.0, t * 1.15))
        outline = lerp(STEEL_LIGHT, (220, 245, 255), t)
        alpha = int(90 + 140 * t)
        draw.polygon(hexagon(cx, cy, r, rotation, jitter), fill=color + (alpha,), outline=outline + (255,))

    # The resolved standard: an aligned hex cluster at the end of the arc.
    grid_r = 56
    g = 1.06  # small gap between flat-top hexagons
    grid_center = (2190, CY)
    add_glow(img, int(grid_center[0]), int(grid_center[1]), 240, 130, ACCENT, 0.4)
    draw = ImageDraw.Draw(img, "RGBA")

    for ox, oy in [(0, 0), (0, -1.732), (0, 1.732), (1.5, -0.866), (1.5, 0.866), (-1.5, -0.866), (-1.5, 0.866)]:
        gx = grid_center[0] + ox * grid_r * g
        gy = grid_center[1] + oy * grid_r * g
        draw.polygon(hexagon(gx, gy, grid_r, 0, 0.0), fill=BRIGHT_CYAN + (235,), outline=(230, 250, 255, 255))


def main() -> None:
    img = build_background()
    img = add_glow(img, int(W * 0.20), int(H * 0.5), 540, 360, STEEL, 0.15)
    img = add_grid(img)
    img = add_particles(img)
    draw_convergence(img)

    img = img.filter(ImageFilter.SMOOTH_MORE)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img = img.convert("RGB").resize((OUT_W, OUT_H), Image.Resampling.LANCZOS)
    img.save(OUT, quality=80, optimize=True)
    print(f"saved {OUT} {img.size}")


if __name__ == "__main__":
    main()

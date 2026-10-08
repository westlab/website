"""Create the hero image for the anonymization research topic.

Run with the bundled Python environment (Pillow and NumPy required):
    python scripts/generate-anonymization-hero.py
Writes public/images/research/anonymization/hero.jpg (2880x940, 2x of the
1440x470 banner). A bust silhouette with a pixelated (mosaic) face in the site's
blue palette, placed right of centre so the page title (top left) stays readable.
The head and mosaic face stay inside the vertical safe band 0.30H-0.70H and
x in [1100, 2380], so the object-fit: cover crop on wide monitors and on mobile
never cuts them; the neck and shoulders run off the bottom edge on purpose.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


OUT = Path(__file__).resolve().parents[1] / "public" / "images" / "research" / "anonymization" / "hero.jpg"
W, H = 2880, 940
BAND = (0.30 * H, 0.70 * H)  # always visible under object-fit: cover
RNG = np.random.default_rng(7)

NAVY_DARK = (2, 3, 36)
NAVY_MID = (6, 14, 56)
ACCENT = (0, 60, 245)
STEEL = (37, 86, 133)
STEEL_LIGHT = (58, 104, 141)
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
        r = RNG.uniform(0.9, 3.3)
        a = int(RNG.uniform(40, 160))
        od.ellipse([x - r, y - r, x + r, y + r], fill=HAZE + (a,))
    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")


def draw_silhouette(img, cx, head_top, head_w, head_h):
    draw = ImageDraw.Draw(img, "RGBA")
    silhouette = (3, 5, 20, 255)
    head_bottom = head_top + head_h
    neck_w = head_w * 0.42
    neck_bottom = head_bottom + head_h * 0.20
    shoulder_top_w = head_w * 1.55
    shoulder_bottom_w = head_w * 3.3
    shoulder_top_y = neck_bottom - 6

    draw.polygon(
        [
            (cx - shoulder_top_w / 2, shoulder_top_y),
            (cx + shoulder_top_w / 2, shoulder_top_y),
            (cx + shoulder_bottom_w / 2, H + 20),
            (cx - shoulder_bottom_w / 2, H + 20),
        ],
        fill=silhouette,
    )
    draw.rectangle(
        [cx - neck_w / 2, head_bottom - head_h * 0.10, cx + neck_w / 2, neck_bottom],
        fill=silhouette,
    )
    ear_y = head_top + head_h * 0.54
    ear_r = head_h * 0.09
    draw.ellipse(
        [cx - head_w / 2 - ear_r * 0.7, ear_y - ear_r, cx - head_w / 2 + ear_r * 0.5, ear_y + ear_r],
        fill=silhouette,
    )
    draw.ellipse(
        [cx + head_w / 2 - ear_r * 0.5, ear_y - ear_r, cx + head_w / 2 + ear_r * 0.7, ear_y + ear_r],
        fill=silhouette,
    )
    draw.ellipse([cx - head_w / 2, head_top, cx + head_w / 2, head_bottom], fill=silhouette)
    return {"head_cx": cx, "head_top": head_top, "head_w": head_w, "head_h": head_h}


def draw_mosaic_face(img, head):
    cx = head["head_cx"]
    w = head["head_w"] * 0.86
    h = head["head_h"] * 0.78
    face_top = head["head_top"] + head["head_h"] * 0.16
    left = cx - w / 2
    cols, rows = 8, 9

    # Smooth underlying shading so the blocks read as a pixelated face, not noise.
    coarse = RNG.uniform(0.15, 0.95, size=(5, 4))
    field = Image.fromarray((coarse * 255).astype(np.uint8)).resize((cols, rows), Image.BILINEAR)
    field = np.asarray(field).astype(np.float32) / 255.0

    cell_w = w / cols
    cell_h = h / rows
    cx_face = left + w / 2
    cy_face = face_top + h / 2
    draw = ImageDraw.Draw(img)

    for r in range(rows):
        for c in range(cols):
            px = left + c * cell_w + cell_w / 2
            py = face_top + r * cell_h + cell_h / 2
            nx = (px - cx_face) / (w / 2)
            ny = (py - cy_face) / (h / 2)
            if nx * nx + ny * ny > 1.05:
                continue
            v = float(field[r, c])
            if v < 0.4:
                color = lerp(NAVY_DARK, STEEL, v / 0.4)
            elif v < 0.75:
                color = lerp(STEEL, STEEL_LIGHT, (v - 0.4) / 0.35)
            else:
                color = lerp(STEEL_LIGHT, (150, 210, 235), (v - 0.75) / 0.25)
            draw.rectangle(
                [left + c * cell_w, face_top + r * cell_h, left + (c + 1) * cell_w, face_top + (r + 1) * cell_h],
                fill=color,
            )


def main() -> None:
    img = build_background()
    img = add_glow(img, 1740, int(H * 0.5), 700, 480, ACCENT, 0.35)
    img = add_glow(img, int(W * 0.2), int(H * 0.8), 560, 320, STEEL, 0.18)
    img = add_grid(img)
    img = add_particles(img)

    head = draw_silhouette(img, cx=1740, head_top=int(BAND[0]) + 8, head_w=330, head_h=int(BAND[1] - BAND[0]) - 16)
    draw_mosaic_face(img, head)

    img = img.filter(ImageFilter.SMOOTH_MORE)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(OUT, quality=88, optimize=True)
    print(f"saved {OUT} {img.size}")


if __name__ == "__main__":
    main()

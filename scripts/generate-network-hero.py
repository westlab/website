"""Create the IoT + edge computing hero image for the network research page.

Pure Pillow, no text in the image. Run:
    python scripts/generate-network-hero.py
Writes public/images/research/network/hero.jpg (2880x940).
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter
import math

# ============================================================
# IoT + Edge Computing Hero
# Pure Python / Pillow
# ============================================================

W, H = 2880, 940
CY = H / 2
BAND = (0.30 * H, 0.70 * H)  # always visible under object-fit: cover

# The motif is drawn in a design space (DW x DH, origin DO = layout (0, 0)) and
# scaled into the safe band: x in [1100, 2380], y in [BAND0, BAND1].
DW, DH = 1800, 700
DO = (900, 350)
MS = 0.72
HUB_X, HUB_Y = 1740, CY + 42 * MS  # where design origin lands in the final image

BG_TOP    = (7, 20, 35)
BG_BOTTOM = (12, 43, 57)

CYAN      = (70, 218, 212)
CYAN_SOFT = (125, 238, 226)
BLUE      = (75, 155, 225)
GREEN     = (95, 215, 160)
WHITE     = (235, 248, 248)
MUTED     = (105, 145, 160)

# ============================================================
# Background
# ============================================================

img = Image.new("RGB", (W, H))
px = img.load()

for y in range(H):
    t = y / (H - 1)

    c = tuple(
        int(BG_TOP[i] * (1-t) + BG_BOTTOM[i] * t)
        for i in range(3)
    )

    for x in range(W):
        px[x, y] = c

img = img.convert("RGBA")


# ============================================================
# Central glow
# ============================================================

glow = Image.new("RGBA", (W, H), (0,0,0,0))
gd = ImageDraw.Draw(glow)

for r in range(520, 20, -20):
    alpha = int(16 * (1-r/520))

    gd.ellipse(
        (1740-r, 500-r, 1740+r, 500+r),
        fill=(*CYAN, alpha)
    )

glow = glow.filter(ImageFilter.GaussianBlur(45))

img = Image.alpha_composite(img, glow)
bg = img
img = Image.new("RGBA", (DW, DH), (0, 0, 0, 0))
d = ImageDraw.Draw(img)


# ============================================================
# Layout
# ============================================================

def L(x, y):
    return (DO[0] + x, DO[1] + y)


EDGE = L(0, 20)
CLOUD = L(0, -235)

# Wide ellipse of devices around the edge server.
devices = [
    (*L(-680, -60), "sensor"),
    (*L(-340, -115), "camera"),
    (*L(340, -115), "home"),
    (*L(680, -60), "sensor"),

    (*L(-680, 100), "meter"),
    (*L(-340, 170), "sensor"),
    (*L(340, 170), "camera"),
    (*L(680, 100), "meter"),
]


# ============================================================
# Bezier connection
# ============================================================

def bezier(p0, p1, p2, steps=70):

    points = []

    for i in range(steps + 1):

        t = i / steps

        x = (
            (1-t)**2*p0[0]
            + 2*(1-t)*t*p1[0]
            + t**2*p2[0]
        )

        y = (
            (1-t)**2*p0[1]
            + 2*(1-t)*t*p1[1]
            + t**2*p2[1]
        )

        points.append((x,y))

    return points


# ============================================================
# IoT -> Edge connections
# ============================================================

for x, y, device_type in devices:

    mx = (x + EDGE[0]) // 2
    my = (y + EDGE[1]) // 2

    if x < EDGE[0]:
        mx -= 30
    else:
        mx += 30

    points = bezier(
        (x,y),
        (mx,my),
        EDGE
    )

    # glow
    d.line(
        points,
        fill=(*CYAN, 35),
        width=11
    )

    # connection
    d.line(
        points,
        fill=(*CYAN, 145),
        width=3
    )


# ============================================================
# Edge -> Cloud connection
# ============================================================

points = bezier(
    EDGE,
    L(0,-100),
    (CLOUD[0], CLOUD[1] + 46)
)

d.line(
    points,
    fill=(*BLUE,35),
    width=14
)

d.line(
    points,
    fill=(*CYAN_SOFT,180),
    width=4
)


# Data packets traveling Edge -> Cloud
for y in [DO[1]-165, DO[1]-100, DO[1]-35]:

    d.ellipse(
        (DO[0]-6,y-6,DO[0]+6,y+6),
        fill=(*WHITE,210)
    )


# ============================================================
# EDGE SERVER
# ============================================================

ex, ey = EDGE

# Outer glow
for r, alpha in [
    (110,12),
    (90,20),
    (72,30)
]:

    d.ellipse(
        (ex-r,ey-r,ex+r,ey+r),
        fill=(*CYAN,alpha)
    )


# Server chassis
server_w = 125
server_h = 145

x1 = ex-server_w//2
y1 = ey-server_h//2
x2 = ex+server_w//2
y2 = ey+server_h//2

d.rounded_rectangle(
    (x1,y1,x2,y2),
    radius=14,
    fill=(13,53,65,255),
    outline=(*CYAN_SOFT,235),
    width=4
)


# Server slots
for sy in [ey-42, ey, ey+42]:

    d.rounded_rectangle(
        (
            ex-43,
            sy-13,
            ex+43,
            sy+13
        ),
        radius=5,
        outline=(*CYAN,180),
        width=3
    )

    # status LED
    d.ellipse(
        (
            ex+26,
            sy-4,
            ex+34,
            sy+4
        ),
        fill=(*GREEN,255)
    )


# Small antenna on Edge
d.line(
    (ex, y1, ex, y1-45),
    fill=(*CYAN_SOFT,220),
    width=4
)

d.ellipse(
    (ex-6,y1-53,ex+6,y1-41),
    fill=(*WHITE,255)
)


# Wireless waves around Edge
for radius in [38,55]:

    d.arc(
        (
            ex-radius,
            y1-75-radius,
            ex+radius,
            y1-75+radius
        ),
        205,
        335,
        fill=(*CYAN_SOFT,120),
        width=3
    )


# ============================================================
# IoT icon functions
# ============================================================

def node_circle(x,y):

    # glow
    d.ellipse(
        (x-40,y-40,x+40,y+40),
        fill=(*CYAN,15)
    )

    # outer circle
    d.ellipse(
        (x-30,y-30,x+30,y+30),
        fill=(11,43,56,230),
        outline=(*CYAN,190),
        width=3
    )


def draw_sensor(x,y):

    node_circle(x,y)

    # sensor body
    d.rounded_rectangle(
        (x-9,y-14,x+9,y+14),
        radius=5,
        outline=(*WHITE,230),
        width=3
    )

    d.ellipse(
        (x-4,y-4,x+4,y+4),
        fill=(*GREEN,255)
    )

    # signal
    for r in [37,48]:

        d.arc(
            (x-r,y-r,x+r,y+r),
            205,335,
            fill=(*CYAN_SOFT,110),
            width=3
        )


def draw_camera(x,y):

    node_circle(x,y)

    # camera body
    d.rounded_rectangle(
        (x-17,y-11,x+15,y+11),
        radius=5,
        outline=(*WHITE,230),
        width=3
    )

    # lens
    d.ellipse(
        (x-5,y-5,x+5,y+5),
        outline=(*CYAN_SOFT,255),
        width=3
    )

    # stand
    d.line(
        (x,y+12,x,y+22),
        fill=(*WHITE,200),
        width=3
    )


def draw_home(x,y):

    node_circle(x,y)

    # roof
    d.line(
        (
            x-18,y-2,
            x,y-19,
            x+18,y-2
        ),
        fill=(*WHITE,230),
        width=3
    )

    # house
    d.rectangle(
        (x-14,y-2,x+14,y+18),
        outline=(*WHITE,230),
        width=3
    )

    # smart node
    d.ellipse(
        (x-4,y+5,x+4,y+13),
        fill=(*GREEN,255)
    )


def draw_meter(x,y):

    node_circle(x,y)

    # meter body
    d.rounded_rectangle(
        (x-15,y-18,x+15,y+18),
        radius=5,
        outline=(*WHITE,230),
        width=3
    )

    # meter screen
    d.rectangle(
        (x-8,y-10,x+8,y),
        outline=(*CYAN_SOFT,230),
        width=2
    )

    # indicator
    d.ellipse(
        (x-4,y+7,x+4,y+15),
        fill=(*GREEN,255)
    )


# ============================================================
# Draw IoT devices
# ============================================================

for x,y,device_type in devices:

    if device_type == "sensor":
        draw_sensor(x,y)

    elif device_type == "camera":
        draw_camera(x,y)

    elif device_type == "home":
        draw_home(x,y)

    elif device_type == "meter":
        draw_meter(x,y)


# ============================================================
# Small packets: IoT -> Edge
# ============================================================

packets = [
    ((x + EDGE[0]) / 2 + (-1 if x < EDGE[0] else 1) * 0,
     (y + EDGE[1]) / 2 + (8 if y > EDGE[1] else -2))
    for x, y, _ in devices
]

for x,y in packets:

    d.ellipse(
        (x-5,y-5,x+5,y+5),
        fill=(*WHITE,200)
    )


# ============================================================
# CLOUD
# ============================================================

cx,cy = CLOUD

cloud_layer = Image.new(
    "RGBA",
    (DW,DH),
    (0,0,0,0)
)

cd = ImageDraw.Draw(cloud_layer)

# Cloud glow
cd.ellipse(
    (cx-105,cy-75,cx+105,cy+75),
    fill=(*BLUE,18)
)

cloud_layer = cloud_layer.filter(
    ImageFilter.GaussianBlur(18)
)

img = Image.alpha_composite(
    img,
    cloud_layer
)

d = ImageDraw.Draw(img)


# Cloud outline
cloud = (*CYAN_SOFT,215)

d.arc(
    (cx-85,cy-20,cx-5,cy+55),
    100,280,
    fill=cloud,
    width=4
)

d.arc(
    (cx-45,cy-60,cx+45,cy+35),
    180,350,
    fill=cloud,
    width=4
)

d.arc(
    (cx+5,cy-25,cx+85,cy+55),
    260,80,
    fill=cloud,
    width=4
)

d.line(
    (cx-48,cy+43,cx+50,cy+43),
    fill=cloud,
    width=4
)


# ============================================================
# Place motif in the safe band, add vignette
# ============================================================

mw, mh = round(DW * MS), round(DH * MS)
motif = img.resize((mw, mh), Image.Resampling.LANCZOS)
img = bg.copy()
img.alpha_composite(
    motif,
    (round(HUB_X - DO[0] * MS), round(HUB_Y - DO[1] * MS)),
)

vignette = Image.new("RGBA", (W, H), (0, 0, 0, 0))
vd = ImageDraw.Draw(vignette)

for i in range(420):
    alpha = int((1 - i / 420) * 75)
    vd.rectangle((i, 0, i + 1, H), fill=(0, 0, 0, alpha))
    vd.rectangle((W - i - 1, 0, W - i, H), fill=(0, 0, 0, alpha))

img = Image.alpha_composite(img, vignette)

output = Path(__file__).resolve().parents[1] / "public" / "images" / "research" / "network" / "hero.jpg"

img.convert("RGB").save(output, quality=80, optimize=True)

print("Saved:", output)
print("Resolution:", W, "x", H)

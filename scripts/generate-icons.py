#!/usr/bin/env python3
"""Generate SNS Books PWA app icons.

Renders the SNS Books mark: a deep-black rounded square with the SNS orange
frame, the "SNS" monogram and a book/rule motif. Outputs PNGs in public/icons.
Depends on Pillow (pip install pillow).
"""
import math
import os
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "icons")
OUT = os.path.abspath(OUT)

ORANGE = (255, 106, 0, 255)
BLACK = (5, 5, 5, 255)
ELEVATED = (21, 21, 21, 255)
WHITE = (255, 255, 255, 255)
MUTED = (146, 146, 146, 255)


def find_font(size):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except Exception:
                continue
    return ImageFont.load_default()


def rounded(draw, xy, radius, fill):
    draw.rounded_rectangle(xy, radius=radius, fill=fill)


def render(size, path, maskable=False):
    img = Image.new("RGBA", (size, size), BLACK)
    draw = ImageDraw.Draw(img)

    pad = int(size * 0.06)
    if maskable:
        # Maskable icons: keep critical content inside the inner safe zone.
        pad = int(size * 0.22)

    dim = size - pad * 2
    s = lambda v: int(v * dim / 512)  # scale relative to a 512 design grid

    # Base tile + frame
    rounded(draw, [pad, pad, size - pad, size - pad], s(96), ELEVATED)
    rounded(
        draw,
        [pad + s(26), pad + s(26), size - pad - s(26), size - pad - s(26)],
        s(70),
        None,
    )
    draw.rounded_rectangle(
        [pad + s(26), pad + s(26), size - pad - s(26), size - pad - s(26)],
        radius=s(70),
        outline=ORANGE,
        width=max(2, s(16)),
    )

    # SNS monogram
    font = find_font(s(150))
    text = "SNS"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = pad + (dim - tw) / 2 - bbox[0]
    ty = pad + (dim - th) / 2 - s(90) - bbox[1]
    draw.text((tx, ty), text, font=font, fill=WHITE)

    # Book rule motif
    cx = size / 2
    base_y = pad + int((dim * 0.68))
    rule_w = int(dim * 0.46)
    rw = max(2, s(14))

    draw.rounded_rectangle(
        [cx - rule_w / 2, base_y, cx + rule_w / 2, base_y + rw], radius=rw / 2, fill=MUTED
    )
    # Orange lozenge on the rule
    lw = int(dim * 0.09)
    draw.rounded_rectangle(
        [cx - lw / 2, base_y - rw * 0.4, cx + lw / 2, base_y + rw * 1.4],
        radius=lw / 2,
        fill=ORANGE,
    )

    img.save(path, "PNG")
    print("wrote", path, img.size)


def main():
    os.makedirs(OUT, exist_ok=True)
    render(192, os.path.join(OUT, "icon-192.png"))
    render(512, os.path.join(OUT, "icon-512.png"))
    render(192, os.path.join(OUT, "maskable-192.png"), maskable=True)
    render(512, os.path.join(OUT, "maskable-512.png"), maskable=True)


if __name__ == "__main__":
    main()
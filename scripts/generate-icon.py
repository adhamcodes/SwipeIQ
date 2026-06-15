#!/usr/bin/env python3
"""
Generates the SwipeIQ app icons as PNGs with no external dependencies
(pure stdlib: math + zlib + struct).

Brand: a cyan -> violet orb (matching the Q mascot) with a white lightning
bolt, on a near-black background. 2x supersampled for smooth edges.

Outputs:
  assets/images/icon.png                 1024  opaque, full orb  (iOS + web/base)
  assets/images/splash-icon.png          1024  transparent, full orb (splash)
  assets/images/android-icon-foreground.png  1024 transparent, SMALLER orb so
        Android's adaptive-icon zoom/crop never clips it.
"""
import math
import struct
import zlib

SIZE = 1024
CX = CY = SIZE / 2.0

CYAN = (0, 229, 255)
VIOLET = (124, 92, 255)
BG = (10, 10, 15)

# Lightning bolt polygon (classic 6-point bolt), normalized 0..100.
_BOLT_NORM = [(58, 0), (20, 56), (44, 56), (36, 100), (80, 38), (54, 38)]


def bolt_points(orb_radius):
    # Keep the bolt the same proportion of the orb as the original design.
    scale = 0.01454 * orb_radius
    off = CX - 50 * scale
    return [(off + nx * scale, off + ny * scale) for nx, ny in _BOLT_NORM]


def in_poly(poly, px, py):
    inside = False
    n = len(poly)
    j = n - 1
    for i in range(n):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if ((yi > py) != (yj > py)) and (px < (xj - xi) * (py - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


def make_sampler(transparent, orb_radius):
    R = orb_radius
    R2 = R * R
    glow_out = R + (150.0 if orb_radius > 280 else 90.0)
    glow_out2 = glow_out * glow_out
    bolt = bolt_points(orb_radius)
    # highlight ellipse, proportional to orb
    hx = CX - orb_radius * 0.22
    hy = CY - orb_radius * 0.34
    hrx = orb_radius * 0.41
    hry = orb_radius * 0.29

    def sample(fx, fy):
        dx = fx - CX
        dy = fy - CY
        d2 = dx * dx + dy * dy
        if d2 > glow_out2:
            return (0, 0, 0, 0) if transparent else (BG[0], BG[1], BG[2], 255)
        if d2 <= R2:
            t = (dx + dy) / (2.0 * R) + 0.5
            t = 0.0 if t < 0 else 1.0 if t > 1 else t
            r = CYAN[0] + (VIOLET[0] - CYAN[0]) * t
            g = CYAN[1] + (VIOLET[1] - CYAN[1]) * t
            b = CYAN[2] + (VIOLET[2] - CYAN[2]) * t
            hdx = (fx - hx) / hrx
            hdy = (fy - hy) / hry
            if hdx * hdx + hdy * hdy <= 1.0:
                r += (255 - r) * 0.22
                g += (255 - g) * 0.22
                b += (255 - b) * 0.22
            if in_poly(bolt, fx, fy):
                return (255, 255, 255, 255)
            return (int(r), int(g), int(b), 255)
        dist = math.sqrt(d2)
        f = (glow_out - dist) / (glow_out - R)
        f = 0.0 if f < 0 else f
        f = f * f * 0.55
        if transparent:
            return (CYAN[0], CYAN[1], CYAN[2], int(255 * f))
        r = BG[0] + (CYAN[0] - BG[0]) * f
        g = BG[1] + (CYAN[1] - BG[1]) * f
        b = BG[2] + (CYAN[2] - BG[2]) * f
        return (int(r), int(g), int(b), 255)

    return sample


def render(transparent, orb_radius):
    sample = make_sampler(transparent, orb_radius)
    buf = bytearray(SIZE * SIZE * 4)
    offsets = (0.25, 0.75)
    idx = 0
    for oy in range(SIZE):
        for ox in range(SIZE):
            ar = ag = ab = aa = 0
            for sy in offsets:
                fy = oy + sy
                for sx in offsets:
                    r, g, b, a = sample(ox + sx, fy)
                    ar += r * a
                    ag += g * a
                    ab += b * a
                    aa += a
            if aa == 0:
                idx += 4
                continue
            buf[idx] = min(255, int(ar / aa))
            buf[idx + 1] = min(255, int(ag / aa))
            buf[idx + 2] = min(255, int(ab / aa))
            buf[idx + 3] = min(255, int(aa / 4))
            idx += 4
    return buf


def write_png(path, rgba):
    raw = bytearray()
    stride = SIZE * 4
    for y in range(SIZE):
        raw.append(0)
        raw.extend(rgba[y * stride:(y + 1) * stride])
    comp = zlib.compress(bytes(raw), 9)

    def chunk(typ, data):
        return (struct.pack(">I", len(data)) + typ + data
                + struct.pack(">I", zlib.crc32(typ + data) & 0xffffffff))

    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk(b"IHDR", struct.pack(">IIBBBBB", SIZE, SIZE, 8, 6, 0, 0, 0)))
        f.write(chunk(b"IDAT", comp))
        f.write(chunk(b"IEND", b""))


if __name__ == "__main__":
    print("icon.png ...")
    write_png("assets/images/icon.png", render(transparent=False, orb_radius=330))
    print("splash-icon.png ...")
    write_png("assets/images/splash-icon.png", render(transparent=True, orb_radius=330))
    print("android-icon-foreground.png ...")
    write_png("assets/images/android-icon-foreground.png", render(transparent=True, orb_radius=210))
    print("Done.")

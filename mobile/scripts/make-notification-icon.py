# Draws the Android notification icon: a white awareness ribbon on transparent, 96x96.
# Usage: python3 scripts/make-notification-icon.py assets/images/notification-icon.png
import math, struct, sys, zlib

SIZE = int(sys.argv[2]) if len(sys.argv) > 2 else 96
S = SIZE / 96  # design coordinates are in a 96x96 box
HALF = 7.0     # half the ribbon width
SS = 4         # supersampling per axis

def seg(p, a, b):
    ax, ay = a; bx, by = b; px, py = p
    dx, dy = bx - ax, by - ay
    t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)
    if t < 0 or t > 1:
        return 1e9
    return abs((px - ax) * dy - (py - ay) * dx) / math.hypot(dx, dy)

def ellipse(p, c, rx, ry):
    return ((p[0] - c[0]) / rx) ** 2 + ((p[1] - c[1]) / ry) ** 2

A = ((65, 30), (24, 88))  # behind: loop's right side down to bottom-left
B = ((31, 30), (72, 88))  # in front: loop's left side down to bottom-right

def inside(p):
    x, y = p
    loop = y < 40 and ellipse(p, (48, 31), 21, 25) <= 1 and ellipse(p, (48, 27), 8, 12.5) > 1
    a = y >= 40 and seg(p, *A) <= HALF
    b = y >= 40 and seg(p, *B) <= HALF
    # Gap around the front band where it crosses the back one, so the twist reads.
    gap = a and not b and seg(p, *B) <= HALF + 2.2 and y > 44
    return (loop or a or b) and not gap

rows = []
for j in range(SIZE):
    row = bytearray([0])
    for i in range(SIZE):
        hits = 0
        for sj in range(SS):
            for si in range(SS):
                p = ((i + (si + 0.5) / SS) / S, (j + (sj + 0.5) / SS) / S)
                hits += inside(p)
        row += bytes([255, 255, 255, round(255 * hits / (SS * SS))])
    rows.append(bytes(row))

def chunk(tag, data):
    return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)

png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', SIZE, SIZE, 8, 6, 0, 0, 0))
png += chunk(b'IDAT', zlib.compress(b''.join(rows), 9)) + chunk(b'IEND', b'')
open(sys.argv[1], 'wb').write(png)

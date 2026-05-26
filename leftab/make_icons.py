#!/usr/bin/env python3
"""Generate simple PNG icons for the extension."""
import struct, zlib, math

def png(size, color=(137, 180, 250)):
    """Generate a minimal solid-color PNG."""
    r, g, b = color
    raw = b''
    for y in range(size):
        raw += b'\x00'  # filter type none
        for x in range(size):
            # Draw a rounded-ish tab-list icon: vertical lines on left
            rel_x = x / size
            rel_y = y / size
            margin = 0.15
            if rel_x < margin or rel_x > 1 - margin or rel_y < margin or rel_y > 1 - margin:
                raw += bytes([30, 30, 46, 255])  # background
            elif rel_x < margin + 0.18:
                raw += bytes([r, g, b, 255])  # accent bar
            elif rel_y > 0.3 and rel_y < 0.42 and rel_x > margin + 0.26:
                raw += bytes([r, g, b, 255])  # line 1
            elif rel_y > 0.48 and rel_y < 0.60 and rel_x > margin + 0.26:
                raw += bytes([r, g, b, 255])  # line 2
            elif rel_y > 0.66 and rel_y < 0.78 and rel_x > margin + 0.26:
                raw += bytes([r, g, b, 255])  # line 3
            else:
                raw += bytes([30, 30, 46, 255])  # background

    def chunk(name, data):
        c = zlib.crc32(name + data) & 0xffffffff
        return struct.pack('>I', len(data)) + name + data + struct.pack('>I', c)

    ihdr = struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)
    idat = zlib.compress(raw)
    return (b'\x89PNG\r\n\x1a\n'
            + chunk(b'IHDR', ihdr)
            + chunk(b'IDAT', idat)
            + chunk(b'IEND', b''))

for size, name in [(16, 'icon16'), (48, 'icon48'), (128, 'icon128')]:
    with open(f'{name}.png', 'wb') as f:
        f.write(png(size))
    print(f'wrote {name}.png')

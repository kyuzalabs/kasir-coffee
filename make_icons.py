"""Generate simple PWA icons (coffee cup top-view) without external deps."""
import os
import struct
import zlib


def make_icon(size: int, path: str) -> None:
    bg = (139, 94, 60)  # coffee brown #8B5E3C
    cream = (250, 250, 249)
    cx = size / 2.0
    r_outer = size * 0.36
    r_inner = size * 0.15
    corner = size * 0.18

    raw = bytearray()
    for y in range(size):
        raw.append(0)  # filter type: None
        for x in range(size):
            alpha = 255
            nx = min(x, size - 1 - x)
            ny = min(y, size - 1 - y)
            if nx < corner and ny < corner:
                dx = corner - nx
                dy = corner - ny
                if dx * dx + dy * dy > corner * corner:
                    alpha = 0
            d = ((x - cx) ** 2 + (y - cx) ** 2) ** 0.5
            if alpha and r_inner < d < r_outer:
                r, g, b = cream
            else:
                r, g, b = bg
            raw += bytes((r, g, b, alpha))

    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)  # 8-bit RGBA
    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", ihdr)
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")

    with open(path, "wb") as f:
        f.write(png)
    print("wrote", path, os.path.getsize(path), "bytes")


if __name__ == "__main__":
    os.makedirs("public", exist_ok=True)
    make_icon(192, "public/icon-192.png")
    make_icon(512, "public/icon-512.png")
    # favicon
    make_icon(32, "public/favicon.png")
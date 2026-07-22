#!/usr/bin/env python3
"""
Knock the flat studio backdrop out of a formal ID photo and emit a web-ready
cutout.

The backdrop in a pas foto is a single saturated colour lit fairly evenly, so a
distance-from-key matte with a soft ramp gets clean edges without a trained
model. Two passes matter for quality:

  1. Ramp, not threshold. A hard cut aliases the hair badly. Everything between
     `--lo` and `--hi` normalised distance becomes partial alpha.
  2. Spill suppression. Pixels at the silhouette edge pick up the backdrop's
     colour cast; we pull those back toward neutral so the figure doesn't wear
     a blue rim once it sits on a white page.

Usage:
    cutout.py SRC OUTDIR [--lo 0.22] [--hi 0.55] [--pad 14]
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


def estimate_key(rgb: np.ndarray, band: int = 48) -> np.ndarray:
    """Modal colour of the border ring.

    Deliberately not a median: in a head-and-shoulders crop the subject fills
    the bottom edge, so the ring holds two populations (backdrop and clothing)
    and a median lands uselessly between them. The mode picks whichever
    population is larger — the backdrop — and we then refine to its true mean.
    """
    ring = np.concatenate(
        [
            rgb[:band].reshape(-1, 3),
            rgb[-band:].reshape(-1, 3),
            rgb[:, :band].reshape(-1, 3),
            rgb[:, -band:].reshape(-1, 3),
        ]
    )

    buckets = (ring // 8).astype(np.int32)
    values, counts = np.unique(buckets, axis=0, return_counts=True)
    dominant = values[counts.argmax()].astype(np.float32) * 8 + 4

    near = ring[np.linalg.norm(ring - dominant, axis=1) < 24]
    return near.mean(axis=0) if len(near) else dominant


def build_alpha(rgb: np.ndarray, key: np.ndarray, lo: float, hi: float) -> np.ndarray:
    """Soft matte from normalised distance to the key colour."""
    # Normalising by the key's own magnitude keeps the ramp meaningful whether
    # the backdrop is a deep ultramarine or a pale grey.
    scale = float(np.linalg.norm(key)) or 1.0
    dist = np.linalg.norm(rgb - key, axis=2) / scale

    alpha = (dist - lo) / max(hi - lo, 1e-6)
    return np.clip(alpha, 0.0, 1.0)


def suppress_spill(rgb: np.ndarray, alpha: np.ndarray, key: np.ndarray) -> np.ndarray:
    """Desaturate the key's hue out of semi-transparent edge pixels."""
    dominant = int(np.argmax(key))
    others = [i for i in range(3) if i != dominant]

    out = rgb.copy()
    # Only edge pixels (partial alpha) carry meaningful spill.
    edge = (alpha > 0.02) & (alpha < 0.98)
    ceiling = out[..., others].max(axis=2)
    over = out[..., dominant] - ceiling
    fix = edge & (over > 0)
    out[..., dominant] = np.where(fix, ceiling, out[..., dominant])
    return out


def trim(img: Image.Image, pad: int) -> Image.Image:
    """Crop to the subject's alpha bounding box, keeping a little air."""
    box = img.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    if not box:
        return img
    left, top, right, bottom = box
    return img.crop(
        (
            max(left - pad, 0),
            max(top - pad, 0),
            min(right + pad, img.width),
            min(bottom + pad, img.height),
        )
    )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("src", type=Path)
    ap.add_argument("outdir", type=Path)
    ap.add_argument("--lo", type=float, default=0.22, help="fully transparent below this distance")
    ap.add_argument("--hi", type=float, default=0.55, help="fully opaque above this distance")
    ap.add_argument("--pad", type=int, default=14)
    ap.add_argument("--name", default="ikhsan-cutout")
    args = ap.parse_args()

    if not args.src.exists():
        print(f"source not found: {args.src}", file=sys.stderr)
        return 1

    src = Image.open(args.src).convert("RGB")
    rgb = np.asarray(src).astype(np.float32)

    key = estimate_key(rgb)
    alpha = build_alpha(rgb, key, args.lo, args.hi)
    rgb = suppress_spill(rgb, alpha, key)

    rgba = np.dstack([rgb, alpha * 255.0]).astype(np.uint8)
    img = Image.fromarray(rgba, "RGBA")

    # A sub-pixel blur on alpha only softens the stair-stepping the ramp leaves
    # in fine hair without eating into the silhouette.
    a = img.getchannel("A").filter(ImageFilter.GaussianBlur(0.6))
    img.putalpha(a)

    img = trim(img, args.pad)

    args.outdir.mkdir(parents=True, exist_ok=True)
    # WebP is what the page loads — it keeps the alpha channel at roughly an
    # eighth of the PNG's weight. The PNG stays as the lossless master.
    png = args.outdir / f"{args.name}.png"
    webp = args.outdir / f"{args.name}.webp"
    img.save(png, optimize=True)
    img.save(webp, quality=88, alpha_quality=100, method=6)

    covered = float((np.asarray(img.getchannel("A")) > 127).mean())
    print(f"key colour   : rgb({int(key[0])}, {int(key[1])}, {int(key[2])})")
    print(f"source       : {src.width}x{src.height}")
    print(f"cutout       : {img.width}x{img.height}  ({covered:.0%} opaque)")
    print(f"wrote        : {webp} ({webp.stat().st_size / 1024:.0f} KB)")
    print(f"             : {png} ({png.stat().st_size / 1024:.0f} KB, master)")
    print("\nSet width/height on the <img> in Hero.astro to "
          f"{img.width}x{img.height} so the box reserves the right space.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

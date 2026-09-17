#!/usr/bin/env python3
"""Enhance restaurant photos for the luxury site theme."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "images"


def glow_up(
    src: Path,
    dest: Path,
    *,
    size: tuple[int, int] | None = None,
    crop: str | None = None,
) -> None:
    img = Image.open(src).convert("RGB")

    if crop == "16:9":
        w, h = img.size
        target_ratio = 16 / 9
        current_ratio = w / h
        if current_ratio > target_ratio:
            new_w = int(h * target_ratio)
            left = (w - new_w) // 2
            img = img.crop((left, 0, left + new_w, h))
        else:
            new_h = int(w / target_ratio)
            top = (h - new_h) // 3
            img = img.crop((0, top, w, top + new_h))

    if crop == "4:5":
        w, h = img.size
        target_ratio = 4 / 5
        current_ratio = w / h
        if current_ratio > target_ratio:
            new_w = int(h * target_ratio)
            left = (w - new_w) // 2
            img = img.crop((left, 0, left + new_w, h))
        else:
            new_h = int(w / target_ratio)
            top = (h - new_h) // 4
            img = img.crop((0, top, w, top + new_h))

    if crop == "3:4":
        w, h = img.size
        target_ratio = 3 / 4
        current_ratio = w / h
        if current_ratio > target_ratio:
            new_w = int(h * target_ratio)
            left = (w - new_w) // 2
            img = img.crop((left, 0, left + new_w, h))
        else:
            new_h = int(w / target_ratio)
            top = (h - new_h) // 6
            img = img.crop((0, top, w, top + new_h))

    img = ImageOps.autocontrast(img, cutoff=0.5)
    img = ImageEnhance.Brightness(img).enhance(1.04)
    img = ImageEnhance.Contrast(img).enhance(1.1)
    img = ImageEnhance.Color(img).enhance(1.12)
    img = ImageEnhance.Sharpness(img).enhance(1.25)
    img = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=80, threshold=3))

    if size:
        img = img.resize(size, Image.Resampling.LANCZOS)

    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "JPEG", quality=92, optimize=True, progressive=True)
    print(f"Saved {dest.name} ({img.size[0]}x{img.size[1]})")


def main() -> None:
    src = Path("/tmp/phota-images")

    glow_up(
        src / "finchley-1.jpg",
        OUT / "hero-pho.jpg",
        size=(1920, 1080),
        crop="16:9",
    )
    glow_up(
        src / "finchley-2.jpg",
        OUT / "about-restaurant.jpg",
        size=(1200, 1500),
        crop="4:5",
    )
    glow_up(
        src / "finchley-3.jpg",
        OUT / "restaurant-interior.jpg",
        size=(1600, 1200),
        crop="16:9",
    )
    glow_up(
        src / "13c761_1f71d986c23a4c74bf92c5e9e78c1196~mv2.jpeg",
        OUT / "bun-cha.jpg",
        size=(1200, 1600),
        crop="3:4",
    )
    glow_up(
        src / "13c761_937aec62b1dd41e3a60307000b0a114f~mv2.jpeg",
        OUT / "special-pho.jpg",
        size=(1200, 1600),
        crop="3:4",
    )
    glow_up(
        src / "13c761_c4ba5fe3805f4ac6bd17ede05cfc2d9d~mv2.jpeg",
        OUT / "vegetable-pho.jpg",
        size=(1200, 1600),
        crop="3:4",
    )
    glow_up(
        src / "finchley-4.jpg",
        OUT / "cha-ca.jpg",
        size=(1200, 1600),
        crop="3:4",
    )


if __name__ == "__main__":
    main()

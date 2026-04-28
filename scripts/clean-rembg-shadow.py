from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image


def parse_rgb(value: str) -> tuple[int, int, int]:
    value = value.strip()
    if value.startswith("#"):
        value = value[1:]
    if len(value) != 6:
        raise argparse.ArgumentTypeError("Use a 6-digit hex color, for example #f7fffd")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def clean_alpha_shadow(image: Image.Image, alpha_floor: int) -> Image.Image:
    rgba = np.array(image.convert("RGBA")).astype(np.float32)
    alpha = rgba[..., 3]

    # Rembg often keeps cast shadows as very low alpha pixels. Rescale the
    # remaining alpha range so anti-aliased edges stay soft after the floor.
    cleaned_alpha = np.where(
        alpha <= alpha_floor,
        0,
        (alpha - alpha_floor) * 255.0 / (255.0 - alpha_floor),
    )

    rgba[..., 3] = np.clip(cleaned_alpha, 0, 255)
    return Image.fromarray(np.clip(rgba, 0, 255).astype(np.uint8), "RGBA")


def save_preview(image: Image.Image, preview_path: Path, background: tuple[int, int, int]) -> None:
    preview_path.parent.mkdir(parents=True, exist_ok=True)
    bg = Image.new("RGBA", image.size, (*background, 255))
    Image.alpha_composite(bg, image.convert("RGBA")).save(preview_path)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Remove low-alpha shadow residue from a rembg character cutout."
    )
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--preview", type=Path)
    parser.add_argument("--background", type=parse_rgb, default=parse_rgb("#f7fffd"))
    parser.add_argument("--alpha-floor", type=int, default=52)
    args = parser.parse_args()

    if not 0 <= args.alpha_floor <= 254:
        raise SystemExit("--alpha-floor must be between 0 and 254")

    image = Image.open(args.input)
    cleaned = clean_alpha_shadow(image, args.alpha_floor)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    cleaned.save(args.output)

    if args.preview:
        save_preview(cleaned, args.preview, args.background)

    alpha = cleaned.getchannel("A")
    hist = alpha.histogram()
    total = cleaned.width * cleaned.height
    print(f"wrote={args.output}")
    print(f"size={cleaned.width}x{cleaned.height}")
    print(f"transparent={hist[0]}")
    print(f"partial_alpha={total - hist[0] - hist[255]}")
    print(f"opaque={hist[255]}")
    print(f"alpha_bbox={alpha.getbbox()}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python
"""Clean matte fringes from character cutouts.

The script is intended for project assets that were generated on black/dark or
white/light backgrounds, then need transparent edges. It flood-fills the border
matte, feathers the alpha edge, decontaminates matte-colored edge pixels, and
fades small matte islands near the outer silhouette.
"""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path
from typing import Iterable, Tuple

from PIL import Image, ImageChops, ImageDraw, ImageFilter

Color = Tuple[int, int, int]


def border_samples(image: Image.Image) -> list[Color]:
    rgb = image.convert("RGB")
    width, height = rgb.size
    samples: list[Color] = []
    for x in range(width):
        samples.append(rgb.getpixel((x, 0)))
        samples.append(rgb.getpixel((x, height - 1)))
    for y in range(height):
        samples.append(rgb.getpixel((0, y)))
        samples.append(rgb.getpixel((width - 1, y)))
    return samples


def is_neutral(color: Color, tolerance: int) -> bool:
    return max(color) - min(color) <= tolerance


def color_distance(a: Color, b: Color) -> int:
    return max(abs(a[0] - b[0]), abs(a[1] - b[1]), abs(a[2] - b[2]))


def parse_color(value: str) -> Color:
    value = value.strip()
    if value.startswith("#"):
        value = value[1:]
        if len(value) != 6:
            raise argparse.ArgumentTypeError("Hex colors must be #RRGGBB")
        return tuple(int(value[index : index + 2], 16) for index in (0, 2, 4))  # type: ignore[return-value]

    parts = [part.strip() for part in value.split(",")]
    if len(parts) != 3:
        raise argparse.ArgumentTypeError("Colors must be #RRGGBB or R,G,B")
    numbers = tuple(int(part) for part in parts)
    if any(part < 0 or part > 255 for part in numbers):
        raise argparse.ArgumentTypeError("RGB channels must be 0..255")
    return numbers  # type: ignore[return-value]


def detect_matte_mode(image: Image.Image) -> str:
    samples = border_samples(image)
    neutral = [sample for sample in samples if is_neutral(sample, 8)]
    light = sum(1 for sample in neutral if min(sample) > 235)
    mid = sum(1 for sample in neutral if 150 <= max(sample) <= 215)
    if light > len(samples) * 0.08 and mid > len(samples) * 0.08:
        return "checker"
    avg = sum(max(pixel) for pixel in samples) / len(samples)
    return "light" if avg > 190 else "dark"


def estimate_checker_colors(image: Image.Image) -> tuple[Color, Color]:
    samples = [sample for sample in border_samples(image) if is_neutral(sample, 10)]
    light_samples = [sample for sample in samples if min(sample) > 225]
    dark_samples = [sample for sample in samples if 145 <= max(sample) <= 220]

    def average(colors: list[Color], fallback: Color) -> Color:
        if not colors:
            return fallback
        return tuple(sum(color[index] for color in colors) // len(colors) for index in range(3))  # type: ignore[return-value]

    return average(light_samples, (254, 254, 254)), average(dark_samples, (189, 189, 189))


def flood_fill_background(
    image: Image.Image,
    matte_mode: str,
    matte_threshold: int,
    neutral_tolerance: int,
) -> Image.Image:
    rgba = image.convert("RGBA")
    width, height = rgba.size
    pix = rgba.load()
    visited = bytearray(width * height)
    background = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()
    checker_light, checker_dark = estimate_checker_colors(rgba)

    def index(x: int, y: int) -> int:
        return y * width + x

    def background_like(x: int, y: int) -> bool:
        r, g, b, a = pix[x, y]
        maximum = max(r, g, b)
        minimum = min(r, g, b)
        if a == 0:
            return True
        if matte_mode == "checker":
            color = (r, g, b)
            return is_neutral(color, 16) and (
                color_distance(color, checker_light) <= 28
                or color_distance(color, checker_dark) <= 34
            )
        if matte_mode == "light":
            return minimum > matte_threshold and (maximum - minimum) < neutral_tolerance
        return maximum < matte_threshold and (maximum - minimum) < neutral_tolerance

    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        idx = index(x, y)
        if visited[idx]:
            continue
        visited[idx] = 1
        if not background_like(x, y):
            continue

        background[idx] = 1
        if x > 0:
            queue.append((x - 1, y))
        if x + 1 < width:
            queue.append((x + 1, y))
        if y > 0:
            queue.append((x, y - 1))
        if y + 1 < height:
            queue.append((x, y + 1))

    alpha = Image.new("L", (width, height), 255)
    alpha_pix = alpha.load()
    for y in range(height):
        row = y * width
        for x in range(width):
            if background[row + x]:
                alpha_pix[x, y] = 0
    return alpha


def build_matte_island_mask(
    image: Image.Image,
    alpha: Image.Image,
    matte_mode: str,
    distance: int,
    island_threshold: int,
    neutral_tolerance: int,
    max_area: int,
) -> set[tuple[int, int]]:
    width, height = image.size
    pix = image.load()

    transparent = Image.new("L", (width, height), 0)
    transparent_pix = transparent.load()
    alpha_pix = alpha.load()
    for y in range(height):
        for x in range(width):
            if alpha_pix[x, y] < 35:
                transparent_pix[x, y] = 255

    kernel = max(3, distance | 1)
    near_bg = transparent.filter(ImageFilter.MaxFilter(kernel))
    near_data = list(near_bg.getdata())

    candidates: set[tuple[int, int]] = set()
    checker_light, checker_dark = estimate_checker_colors(image)
    for y in range(height):
        for x in range(width):
            r, g, b, a = pix[x, y]
            maximum = max(r, g, b)
            minimum = min(r, g, b)
            if matte_mode == "checker":
                matte_like = is_neutral((r, g, b), 18) and (
                    color_distance((r, g, b), checker_light) <= 30
                    or color_distance((r, g, b), checker_dark) <= 38
                )
            elif matte_mode == "light":
                matte_like = minimum > island_threshold
            else:
                matte_like = maximum < island_threshold
            if a > 35 and matte_like and (maximum - minimum) < neutral_tolerance:
                candidates.add((x, y))

    seen: set[tuple[int, int]] = set()
    remove: set[tuple[int, int]] = set()

    for start in list(candidates):
        if start in seen:
            continue

        queue: deque[tuple[int, int]] = deque([start])
        seen.add(start)
        component: list[tuple[int, int]] = []
        near_edge = False

        while queue:
            x, y = queue.popleft()
            component.append((x, y))
            if near_data[y * width + x] > 0:
                near_edge = True
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if (nx, ny) in candidates and (nx, ny) not in seen:
                    seen.add((nx, ny))
                    queue.append((nx, ny))

        if near_edge and len(component) <= max_area:
            remove.update(component)

    return remove


def clean_cutout(
    input_path: Path,
    output_path: Path,
    matte_mode: str,
    matte_threshold: int | None,
    neutral_tolerance: int,
    feather: float,
    hair_color: Color,
    dark_island_distance: int,
    dark_island_threshold: int | None,
    dark_island_max_area: int,
) -> Image.Image:
    source = Image.open(input_path).convert("RGBA")
    resolved_matte_mode = (
        detect_matte_mode(source) if matte_mode == "auto" else matte_mode
    )
    resolved_matte_threshold = (
        matte_threshold
        if matte_threshold is not None
        else (238 if resolved_matte_mode in ("light", "checker") else 155)
    )
    resolved_island_threshold = (
        dark_island_threshold
        if dark_island_threshold is not None
        else (245 if resolved_matte_mode in ("light", "checker") else 130)
    )
    alpha_hard = flood_fill_background(
        source,
        resolved_matte_mode,
        resolved_matte_threshold,
        neutral_tolerance,
    )

    alpha = alpha_hard.filter(ImageFilter.MinFilter(3)).filter(
        ImageFilter.GaussianBlur(feather)
    )

    wide_band = ImageChops.subtract(
        alpha_hard.filter(ImageFilter.MaxFilter(61)),
        alpha_hard.filter(ImageFilter.MinFilter(9)),
    )
    near_band = ImageChops.subtract(
        alpha_hard.filter(ImageFilter.MaxFilter(23)),
        alpha_hard.filter(ImageFilter.MinFilter(5)),
    )
    matte_islands = build_matte_island_mask(
        source,
        alpha,
        resolved_matte_mode,
        dark_island_distance,
        resolved_island_threshold,
        neutral_tolerance + 20,
        dark_island_max_area,
    )

    source_data = list(source.getdata())
    alpha_data = list(alpha.getdata())
    wide_data = list(wide_band.getdata())
    near_data = list(near_band.getdata())
    output_data = []

    hr, hg, hb = hair_color
    checker_light, checker_dark = estimate_checker_colors(source)
    for index, ((r, g, b, _), a, wide, near) in enumerate(
        zip(source_data, alpha_data, wide_data, near_data)
    ):
        if a <= 2:
            output_data.append((0, 0, 0, 0))
            continue

        x = index % source.width
        y = index // source.width
        maximum = max(r, g, b)
        minimum = min(r, g, b)
        saturation = maximum - minimum

        checker_like = is_neutral((r, g, b), 18) and (
            color_distance((r, g, b), checker_light) <= 30
            or color_distance((r, g, b), checker_dark) <= 38
        )
        matte_like = (
            checker_like
            if resolved_matte_mode == "checker"
            else (
            minimum > resolved_island_threshold
            if resolved_matte_mode == "light"
            else maximum < resolved_island_threshold
            )
        )
        subtle_matte_like = (
            checker_like
            if resolved_matte_mode == "checker"
            else (minimum > 205 if resolved_matte_mode == "light" else maximum < 118)
        )
        medium_matte_like = (
            checker_like
            if resolved_matte_mode == "checker"
            else (minimum > 178 if resolved_matte_mode == "light" else maximum < 175)
        )
        wide_matte_like = (
            checker_like
            if resolved_matte_mode == "checker"
            else (minimum > 190 if resolved_matte_mode == "light" else maximum < 150)
        )

        if (x, y) in matte_islands:
            a = int(a * 0.12)
            r, g, b = hr, hg, hb
        elif wide > 0 and subtle_matte_like and saturation < 115:
            if resolved_matte_mode == "light":
                fade = max(0.0, min(1.0, (255 - minimum) / 65.0))
            else:
                fade = max(0.0, min(1.0, (maximum - 28) / 90.0))
            a = int(a * fade * 0.2)
            r, g, b = hr, hg, hb
        elif near > 0 and medium_matte_like and saturation < 130:
            mix = 0.72
            r = int(r * (1 - mix) + hr * mix)
            g = int(g * (1 - mix) + hg * mix)
            b = int(b * (1 - mix) + hb * mix)
            a = int(a * 0.55)
        elif wide > 0 and wide_matte_like and saturation < 115:
            mix = 0.62
            r = int(r * (1 - mix) + hr * mix)
            g = int(g * (1 - mix) + hg * mix)
            b = int(b * (1 - mix) + hb * mix)
            a = int(a * 0.68)

        if resolved_matte_mode == "dark" and a < 252:
            alpha_fraction = max(a / 255.0, 0.24)
            r = min(255, int(round(r / alpha_fraction)))
            g = min(255, int(round(g / alpha_fraction)))
            b = min(255, int(round(b / alpha_fraction)))
            mix = 0.38 * (1 - a / 255.0)
            r = int(r * (1 - mix) + 238 * mix)
            g = int(g * (1 - mix) + 248 * mix)
            b = int(b * (1 - mix) + 255 * mix)

        output_data.append((r, g, b, max(0, min(255, a))))

    clean = Image.new("RGBA", source.size)
    clean.putdata(output_data)
    red, green, blue, out_alpha = clean.split()
    out_alpha = out_alpha.filter(ImageFilter.GaussianBlur(0.35))
    clean = Image.merge("RGBA", (red, green, blue, out_alpha))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    clean.save(output_path)
    return clean


def make_preview(
    original_path: Path,
    clean: Image.Image,
    preview_path: Path,
    background: Color,
    views: int,
) -> None:
    original = Image.open(original_path).convert("RGBA")
    width, height = original.size
    views = max(1, views)
    crop_width = width // views
    thumb_height = 840
    thumb_width = max(1, int(crop_width * thumb_height / height))

    items = (("original", original), ("cleaned", clean))
    canvas = Image.new(
        "RGB",
        (thumb_width * len(items), thumb_height + 72),
        background,
    )
    draw = ImageDraw.Draw(canvas)

    for index, (label, image) in enumerate(items):
        crop = image.crop((0, 0, crop_width, height)).resize(
            (thumb_width, thumb_height), Image.Resampling.LANCZOS
        )
        composite = Image.new("RGBA", crop.size, (*background, 255))
        composite.alpha_composite(crop)
        x = index * thumb_width
        canvas.paste(composite.convert("RGB"), (x, 0))
        draw.text((x + 12, thumb_height + 18), label, fill=(23, 37, 43))

    preview_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(preview_path)


def metrics(image: Image.Image) -> dict[str, int]:
    data = list(image.convert("RGBA").getdata())
    return {
        "visible_dark_pixels": sum(
            1 for r, g, b, a in data if a > 40 and max(r, g, b) < 100
        ),
        "visible_light_pixels": sum(
            1 for r, g, b, a in data if a > 40 and min(r, g, b) > 245
        ),
        "partial_alpha_pixels": sum(1 for _r, _g, _b, a in data if 0 < a < 255),
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Clean dark or light matte residue from character cutouts."
    )
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--preview", type=Path)
    parser.add_argument("--views", type=int, default=1)
    parser.add_argument("--background", type=parse_color, default=parse_color("#f7fffd"))
    parser.add_argument("--hair-color", type=parse_color, default=parse_color("232,244,253"))
    parser.add_argument("--matte-mode", choices=("auto", "dark", "light", "checker"), default="auto")
    parser.add_argument("--matte-threshold", type=int, default=None)
    parser.add_argument("--neutral-tolerance", type=int, default=100)
    parser.add_argument("--feather", type=float, default=1.05)
    parser.add_argument("--dark-island-distance", type=int, default=81)
    parser.add_argument("--dark-island-threshold", type=int, default=None)
    parser.add_argument("--dark-island-max-area", type=int, default=900)
    return parser


def main(argv: Iterable[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    clean = clean_cutout(
        input_path=args.input,
        output_path=args.output,
        matte_mode=args.matte_mode,
        matte_threshold=args.matte_threshold,
        neutral_tolerance=args.neutral_tolerance,
        feather=args.feather,
        hair_color=args.hair_color,
        dark_island_distance=args.dark_island_distance,
        dark_island_threshold=args.dark_island_threshold,
        dark_island_max_area=args.dark_island_max_area,
    )

    if args.preview:
        make_preview(args.input, clean, args.preview, args.background, args.views)

    print(f"output={args.output}")
    if args.preview:
        print(f"preview={args.preview}")
    print(f"metrics={metrics(clean)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

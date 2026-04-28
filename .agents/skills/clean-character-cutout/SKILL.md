---
name: clean-character-cutout
description: Clean raster IP character cutouts that came from black, dark, white, light, checkerboard, or colored matte backgrounds. Use when character PNG/JPG/WebP assets show black fringes, white halos, fake transparency checkerboards, dirty hair edges, hard alpha cutouts, leftover background blocks, or need feathered transparent edges before being used in Remotion, thumbnails, stickers, or UI compositions.
---

# Clean Character Cutout

## Overview

Use this skill to turn a matte-background character image into a cleaner transparent PNG. It is especially useful for anime/chibi IP sheets, three-view turnarounds, hair-heavy silhouettes, translucent clothing, white-background JPGs, black-background PNGs, fake checkerboard transparency screenshots, and Remotion character overlays.

## Capability Levels

- Stable: black/dark matte cleanup with feathering and black-edge decontamination.
- Stable: white/light matte cleanup with conservative halo removal.
- Stable for this project: fake checkerboard and difficult white-background anime sheets via Dockerized `rembg` using `birefnet-general-lite`, followed by low-alpha shadow cleanup with `scripts/clean-rembg-shadow.py`.
- Experimental: baked-in checkerboard backgrounds with the bundled rule-based script. Use only for quick tests; for pale anime characters on checkerboards, prefer Dockerized `rembg`/AI matting. See `references/checkerboard-research.md`.

## Workflow

1. Inspect the source image and confirm whether the artifact is from CSS/layout or from the image itself.
   - If the render has `drop-shadow`, card background, border, or a visible crop container, fix CSS first.
   - If black/gray residue or white halo remains after CSS is clean, process the image with this skill.
2. Preserve the original asset. Never overwrite the user-provided file.
3. Run `scripts/clean_character_cutout.py` to create a new PNG with alpha feathering and black-matte decontamination.
4. Inspect a preview on the actual project background color.
5. Update consuming code to point at the cleaned PNG only after visual inspection.
6. Re-render the relevant frame or still, then run normal project checks.

For fake checkerboard backgrounds or pale characters on white backgrounds, prefer the Dockerized `rembg` workflow before rule tuning. In project tests, `birefnet-general-lite` plus `clean-rembg-shadow.py` produced the best results for `messy-hair-checker-source.png` and `short-hair-white-turnaround-source.jpg`.

For black/dark matte sources, prefer the bundled dark matte cleanup first. Project tests showed `snow-girl-turnaround-feather-clean-v3.png` was more natural than `snow-girl-turnaround-rembg-isnet-anime-shadowless.png`, because the rembg result still had black matte contamination around the hair.

## Quick Start

From the project root:

```console
python .agents\skills\clean-character-cutout\scripts\clean_character_cutout.py --input public\ip\source.png --output public\ip\source-clean.png --preview out\source-clean-preview.png --views 3 --background "#f7fffd"
```

For JPG input:

```console
python .agents\skills\clean-character-cutout\scripts\clean_character_cutout.py --input public\ip\source.jpg --output public\ip\source-clean.png --preview out\source-clean-preview.png
```

For a known white-background image:

```console
python .agents\skills\clean-character-cutout\scripts\clean_character_cutout.py --input public\ip\source.jpg --output public\ip\source-clean.png --preview out\source-clean-preview.png --views 3 --matte-mode light
```

For a known black-background image:

```console
python .agents\skills\clean-character-cutout\scripts\clean_character_cutout.py --input public\ip\source.png --output public\ip\source-clean.png --preview out\source-clean-preview.png --views 3 --matte-mode dark
```

For a fake checkerboard or difficult white-background anime sheet in this project, use Dockerized `rembg` first:

```console
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\rembg-character-cutout.ps1 -InputPath public\ip\source.png -OutputPath public\ip\source-rembg-birefnet-general-lite.png -Model birefnet-general-lite
```

Then remove low-alpha gray shadow residue:

```console
python scripts\clean-rembg-shadow.py --input public\ip\source-rembg-birefnet-general-lite.png --output public\ip\source-rembg-birefnet-general-lite-shadowless.png --preview out\source-rembg-birefnet-general-lite-shadowless-preview.png --alpha-floor 52
```

Use `--alpha-floor 68` for stronger checkerboard shadow cleanup, and around `--alpha-floor 38` for gentler white-background cleanup.

## Output Expectations

The script produces:

- A cleaned transparent PNG at `--output`.
- An optional side-by-side preview at `--preview` composited on `--background`.
- Console metrics including visible dark pixel counts and partial-alpha counts.

Use the preview to decide whether the result is acceptable. Hair should look softer, not chopped. Eyes and internal line art should remain intact.

## Tuning

Default settings are conservative and use `--matte-mode auto`, which detects dark, light, and checkerboard border mattes.

Adjust only when needed:

- `--matte-threshold`: increase if dark background remains connected to the border.
- `--matte-mode dark|light|checker|auto`: force `checker` for baked-in transparent checkerboard backgrounds if auto detection is wrong.
- `--feather`: increase slightly if edges are too hard.
- `--dark-island-distance`: increase if black blocks near hair survive.
- `--dark-island-threshold`: for light mattes, lower it if white halos survive; for dark mattes, raise it if black residue survives.
- `--dark-island-max-area`: increase if small matte islands survive; do not set too high or eyes/line art may be affected.
- `--hair-color R,G,B`: set to the character's edge/hair color for better decontamination.

If strong settings eat hair or translucent clothing, back off and prefer a softer version.

For checkerboard backgrounds, do not keep tuning rules endlessly. If the first two attempts leave checker blocks or destroy pale hair/clothing, switch to an AI background-removal or image-matting tool.

## Remotion Integration

After generating the cleaned PNG:

1. Put it under `public/ip/` or another project asset directory.
2. Update the character preset or episode data to reference the cleaned file.
3. Keep `sourceAspect` and `viewsPerSheet` unchanged if the sheet dimensions did not change.
4. Render the problem frame again with `npx remotion still ...`.
5. Confirm there is no card, border, shadow, or black-matte residue.

## Safety Rules

- Do not overwrite original IP assets.
- Do not remove intentional internal dark details such as eyes, pupils, mouth lines, or clothing line art.
- Do not use a cleaned image until it has been previewed on the target background.
- If the source already has a true alpha channel and only CSS shadow is visible, fix CSS instead of processing the image.

# Checkerboard Background Research

Use this reference when an image has a baked-in transparent checkerboard background. If the file has no alpha channel and the character is pale, rule-based color keying is usually not enough.

## Practical Recommendation

Preferred pipeline for anime/IP three-view sheets:

1. Split the sheet into separate views.
2. Pad each view to a comfortable canvas.
3. Run an AI background-removal or matting model per view.
4. Inspect hair, translucent clothing, and hands.
5. Recombine cleaned views only after each view looks acceptable.

Use rule-based checker cleanup only as a quick preview or a post-process, not as the primary solution for pale characters.

For this project, Dockerized `rembg` avoids installing Python ML dependencies locally:

```console
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\rembg-character-cutout.ps1 -InputPath public\ip\source.png -OutputPath public\ip\source-rembg.png -Model birefnet-general-lite
```

If `rembg` leaves low-alpha gray cast shadows, run:

```console
python scripts\clean-rembg-shadow.py --input public\ip\source-rembg.png --output public\ip\source-rembg-shadowless.png --alpha-floor 52
```

Observed project results:

- Fake checkerboard + pale character: `birefnet-general-lite` plus `clean-rembg-shadow.py` gave the cleanest result.
- White background + pale character: `birefnet-general-lite` worked well with a gentler alpha floor.
- Black background + pale character: `isnet-anime` can remove the background, but black matte decontamination may still be worse than the bundled rule-based dark matte cleanup.

## Open-Source Options

- `rembg`: general-purpose CLI/library for background removal. It lists multiple models, including `isnet-anime`, `sam`, `birefnet-*`, and `bria-rmbg`. Good first option because it has a CLI and model selection.
  - https://github.com/danielgatis/rembg

- `transparent-background`: background removal using InSPyReNet. Useful when a simple CLI/API is desired, but it is a heavier ML dependency than this skill's Pillow script.
  - https://github.com/plemeri/transparent-background

- `MODNet`: image matting model. More portrait-oriented, but useful when a soft alpha matte is more important than hard segmentation.
  - https://github.com/ZHKKKe/MODNet

- `PyMatting`: classical/algorithmic alpha matting tools. Best used after a rough mask or trimap exists; not ideal as the only step for checkerboard screenshots.
  - https://github.com/pymatting/pymatting

- `BiRefNet`: strong dichotomous image segmentation family. Consider through `rembg`'s `birefnet-*` models or direct implementations when quality matters.
  - https://github.com/ZhengPeng7/BiRefNet

- `ToonOut`: anime-focused background removal work based on fine-tuning BiRefNet for anime-style images. Relevant for chibi/anime IP assets if the code/model is usable in the local environment.
  - https://arxiv.org/abs/2509.06839

## Why Checkerboards Are Hard

A fake transparency checkerboard is not metadata; it is real pixels. When the character is white-haired or wears white translucent clothing, foreground pixels overlap the background's white/gray colors. A rule like "remove white and gray" will also remove hair, dress, lace, and veil details.

## Local Skill Boundary

The bundled `clean_character_cutout.py` remains reliable for black/dark and white/light mattes. Its `checker` mode is experimental. If checker cleanup damages the character or leaves blocks after one or two attempts, switch to an ML tool and use this skill only for final feather/halo cleanup.

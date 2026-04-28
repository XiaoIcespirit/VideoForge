---
name: remotion-style-template-builder
description: Design reusable Remotion video style templates from creative briefs, especially for AI tutorials, product explainers, code demos, UI walkthroughs, short-form technical videos, and style-template knowledge-base work. Use when the user wants a professional video style, scene plan, component mapping, or a new entry under docs/video-style-templates without relying on video-understanding.
---

# Remotion Style Template Builder

## Purpose

Use this skill to turn a creative brief into a reusable Remotion video style template. The first version is `design-from-brief`: do not require a video-analysis JSON, Gemini output, or an existing reference video.

## Required References

Before writing or updating any style template, read:

- `references/style-dimensions-schema.md` for the required dimensions every template must cover.
- `references/component-source-guidance.md` before naming concrete Remotion components or third-party component sources.

## Workflow

1. Identify the brief: topic, audience, platform, format, target duration, tone, and any hard constraints. If details are missing, choose sensible defaults and record them in the template.
2. Create a slug in lowercase hyphen-case, such as `ai-prompt-tech-shortform`.
3. Write or update `docs/video-style-templates/<style-slug>.md`.
4. Cover every required dimension from `style-dimensions-schema.md`. A template may add dimensions, but must not omit any required one.
5. Recommend component types first. Only name concrete `remotion-bits`, `remocn`, or local project components after verifying the source exists.
6. Clearly separate verified concrete components from recommended component types.
7. Finish by reporting the saved path and any unverified component-source assumptions.

## Output Rules

- Default to one Markdown template file under `docs/video-style-templates/`.
- Only create `.scene-plan.json` or `.component-map.md` when the user explicitly requests structured sidecar files.
- Do not write Remotion code unless the user asks for implementation.
- Do not depend on `video-understanding` in v1. If a video-analysis file is provided, treat it as optional context, not a required input.
- Do not invent concrete component names. If the repository or referenced source cannot be checked, describe the needed component type instead.

## Template Quality Bar

A good template is specific enough that a later Remotion implementation can choose scenes, timing, captions, transitions, and component families without re-designing the style. It should read like a production art direction document, not a mood-board paragraph.

## Future Mode

When `video-understanding` is reliable, add `build-from-analysis`: read `docs/video-analysis/raw/*.json`, extract the same required dimensions, then save the resulting style template under `docs/video-style-templates/`.

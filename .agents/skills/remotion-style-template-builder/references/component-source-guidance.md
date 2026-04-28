# Component Source Guidance

Use this reference before recommending concrete Remotion components.

## Verification Rule

Never invent concrete component names. If a component source cannot be inspected, recommend a component type and mark it as `建议组件类型`.

## Source Priority

1. Project-local components and templates, especially `src/templates/` and existing episode code.
2. Project-installed skills and references, especially `remotion-best-practices`.
3. `remotion-bits` CLI output, locally available `remotion-bits` files, README content, or MCP search results if present.
4. `remocn` docs, component index, or components installed through this project's shadcn wrapper.
5. Web or upstream repository lookups only when the user asks for fresh remote verification.

## Project Commands

Use these commands from the repository root:

```powershell
npm run remotion-bits:find -- "terminal typewriter" --limit 3 --json
npm run remotion-bits:fetch -- bit-terminal-3d --json
npm run remocn:add -- terminal-simulator
```

Do not use Docker for these component libraries. They are source/package workflows, not services.

## Component Mapping Style

Use two groups:

```markdown
### 已验证具体组件

- `<component or module>` from `<verified source>`: why it fits.

### 建议组件类型

- Animated keyword caption: use for fast hook emphasis.
- Browser or device mockup: use for UI walkthroughs.
- Terminal/code block panel: use for developer workflows.
```

## Useful Component Types

- Animated title and keyword captions.
- Progressive text reveal and highlight words.
- Code block, terminal, prompt card, and parameter panel.
- Browser window, mobile device, or desktop mockup.
- Before/after split view.
- Timeline, progress bar, chapter marker, and status badge.
- Smooth wipe, push, zoom, blur, glitch, or card-stack transition.
- Background texture, grid, gradient band, particle field, or subtle depth layer.
- Sound-cued pop, snap, notification, and success/failure state.

## Local Project Notes

The current project has a `GugugagaLectureTemplate` in `src/templates/VibeCodingShort.tsx` and scene data types in `src/templates/gugugagaLecture/types.ts`. Treat these as verified local sources when designing lecture-style templates.

# Video Style Dimensions Schema

Every video style template must cover every dimension below. Templates may add more dimensions, but must not remove or merge these required sections.

## Required Template Header

- `# <Style Name>`: human-readable style name.
- `slug`: lowercase hyphen-case identifier.
- `mode`: use `design-from-brief` for v1.
- `status`: `draft`, `validated`, or `deprecated`.
- `适合平台`: target platform or format, such as Douyin, Bilibili, YouTube Shorts, horizontal course video, or generic Remotion composition.
- `默认规格`: aspect ratio, resolution direction, approximate duration, and fps assumption.

## Required Dimensions

### 风格定位

State in one clear sentence what kind of video this style is for, which audience it serves, and what emotional/technical impression it should leave.

### 适用场景

List the content types this style handles well. Examples: AI tutorial, product launch, code demo, case study, changelog, before/after comparison, UI walkthrough, short-form hook video.

### 叙事结构

Define the story shape. Cover opening hook, problem setup, concept explanation, example/demo, result reveal, and ending CTA when applicable.

### 镜头节奏

Define average shot length, fast/slow sections, information density, where to pause, where to cut quickly, and how timing supports comprehension.

### 画面构图

Define layout rules: subject placement, text-to-visual ratio, whitespace, focus areas, safe zones, and horizontal/vertical adaptation.

### 字幕系统

Define caption layers: spoken subtitles, large keywords, progressive highlights, labels, annotations, warning/success states, and readability rules.

### 转场语言

Define transition types, timing, intensity, and misuse rules. Include what should feel consistent across the whole template.

### UI/代码/提示词演示方式

Define how to show browser windows, terminals, code blocks, prompt cards, parameter panels, timelines, and before/after comparisons.

### 动效语气

Define the motion personality: technical, product-launch, lab-demo, short-form punchy, developer-tool, cinematic, playful, restrained, or another explicit combination.

### 色彩与字体方向

Define color strategy, accent usage, background approach, contrast rules, typography temperament, and readability constraints. Avoid hard-coding a full brand palette unless the brief requires it.

### 声音与口播假设

Define whether the style depends on voiceover, whether it remains understandable muted, how music supports pacing, and where sound effects should land.

### Remotion 组件映射

List needed component types and their source direction. Split into `已验证具体组件` and `建议组件类型`. Do not invent component names.

### 场景结构建议

Provide a scene list that can become a Remotion composition plan. Include scene purpose, approximate duration, visual action, text layer, and motion language.

### 复用边界

State what parts are reusable and what parts should change per episode, topic, or platform.

### 质量检查清单

List implementation checks for caption readability, timing, visual density, transition consistency, component fit, mobile crop risk, and silent-viewing clarity.

## Minimum Markdown Shape

Use this order unless there is a strong reason to add extra sections:

```markdown
# <Style Name>

- slug:
- mode: design-from-brief
- status: draft
- 适合平台:
- 默认规格:

## 风格定位
## 适用场景
## 叙事结构
## 镜头节奏
## 画面构图
## 字幕系统
## 转场语言
## UI/代码/提示词演示方式
## 动效语气
## 色彩与字体方向
## 声音与口播假设
## Remotion 组件映射
## 场景结构建议
## 复用边界
## 质量检查清单
```

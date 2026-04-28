# 输出与素材目录规范

这个项目后续会持续生产多集 Remotion 视频、AI 分析结果、角色清理图、关键帧和成片。目录按“是否需要版本化”和“是否会被 Remotion 引用”分层。

## 目录分层

| 目录 | 用途 | 是否建议进 Git |
| --- | --- | --- |
| `src/episodes/` | 每集脚本、镜头、字幕、数据入口 | 是 |
| `src/templates/` | 可复用 Remotion 模板、组件、动效结构 | 是 |
| `public/ip/` | 原始或最终可复用 IP 角色素材 | 是 |
| `public/generated/` | 会被 Remotion 引用的长期生成素材 | 视体积决定，默认可进 Git |
| `docs/video-analysis/raw/` | `video-understanding` 输出的原始 JSON 分析 | 视版权和隐私决定 |
| `docs/video-style-templates/` | 可复用视频风格模板和维度 schema | 是 |
| `out/` | 本地渲染、检查图、临时下载和诊断产物 | 否 |

## `out/` 子目录

`out/` 是本地生成目录，保持在 `.gitignore` 中。不要在 `out/` 根目录直接堆文件。

```text
out/
  renders/
    ep01/
      XiaoxuelingVibeCodingEp01_ep01-draft.mp4
  stills/
    ep01/
      frame-30.png
  previews/
    ep01/
      cover-draft.png
  diagnostics/
    character-cutout/
      rembg-model-comparison-preview.png
  downloads/
    video-understanding/
      source-video.mp4
  tmp/
```

规则：

- 成片、草稿视频放 `out/renders/epNN/`。
- Remotion still、关键帧检查图放 `out/stills/epNN/`。
- 封面、对外预览图放 `out/previews/epNN/`。
- 抠图、模型对比、清理实验、contact sheet 放 `out/diagnostics/<task>/`。
- `video-understanding --download-only` 下载的视频放 `out/downloads/video-understanding/`。
- `douyin-video` 下载的视频放 `out/downloads/douyin/`。
- B 站视频下载默认放 `out/downloads/bilibili/`。
- 临时文件放 `out/tmp/`，不要被源码或 episode 数据引用。

B 站下载使用 Docker 版 yutto：

```powershell
npm run bilibili:video -- "https://www.bilibili.com/video/BVxxxx"
```

## Source Video Analysis

抖音、B 站、本地 mp4 和普通 URL 的风格分析优先使用统一入口：

```powershell
npm run analyze:source-video -- "https://www.douyin.com/video/7612631899479648866"
npm run analyze:source-video -- "https://www.bilibili.com/video/BVxxxx"
npm run analyze:source-video -- ".\out\downloads\douyin\7612631899479648866.mp4"
```

统一入口会：

- 自动识别 `douyin` / `bilibili` / `local` / `url`。
- 抖音和 B 站先下载并长期保留 mp4。
- 把本地 mp4 交给 `video-understanding` 分析。
- 把分析 JSON 保存到 `docs/video-analysis/raw/<platform>-<slug>-style-analysis.json`。
- 如果 JSON 已存在，默认跳过 Gemini 调用；需要重跑时加 `-Force`。

## Video Understanding 输出

`video-understanding` skill 的脚本逻辑是：

- 不传 `-o` / `--output`：JSON 直接输出到终端。
- 传 `-o` / `--output`：写入指定文件。
- YouTube URL：直接传给 Gemini，不下载本地视频。
- 非 YouTube URL：下载到临时目录，上传 Gemini，分析结束后删除本地临时视频和 Gemini 文件。
- 本地 mp4 文件：直接上传 Gemini 分析，不会删除本地文件。
- `--download-only -o <path>`：只下载视频到指定路径，不调用 Gemini。

本项目默认把视频风格分析保存到：

```text
docs/video-analysis/raw/<slug>-style-analysis.json
```

推荐命令：

```powershell
powershell -ExecutionPolicy Bypass -File ".\scripts\analyze-style-video.ps1" "https://www.youtube.com/watch?v=VIDEO_ID" "VIDEO_ID"
```

`analyze-style-video.ps1` 默认会把 `--cookies-from-browser edge` 传给非 YouTube 下载流程，以便处理 Douyin/TikTok 等需要 fresh cookies 的公开视频。使用浏览器 cookie 后，最终回复里要说明本次用过浏览器 cookie；不要打印、保存或外传 cookie 内容。

如果手动调用底层脚本，使用：

```powershell
powershell -ExecutionPolicy Bypass -File ".\scripts\analyze-video.ps1" "https://www.youtube.com/watch?v=VIDEO_ID" -q "请总结这个视频的演示流程，并提取可复用的视频风格模板，包括镜头节奏、字幕方式、转场、UI演示步骤和适合使用的Remotion组件类型。" -o ".\docs\video-analysis\raw\VIDEO_ID-style-analysis.json"
```

免费层 API 不要批量调用。每个视频先分析一次，复用 JSON；再把真正有价值的风格抽成 `docs/video-style-templates/<style-name>.md`。

## Video Style Templates

`docs/video-style-templates/style-dimensions-schema.md` 是所有视频风格模板的基础 schema。每个正式风格模板可以扩展更多内容，但必须覆盖 schema 中的全部必填维度。

当前不依赖 `video-understanding` 也可以创建风格模板：使用项目内 `remotion-style-template-builder` skill，根据创作 brief 主动设计风格，并保存到：

```text
docs/video-style-templates/<style-slug>.md
```

## 命名规则

- 集数目录：`ep01`、`ep02`、`ep03`。
- 草稿视频：`<CompositionId>_epNN-draft.mp4`。
- 发布视频：`<CompositionId>_epNN-vMAJOR.MINOR.PATCH.mp4`。
- 关键帧：`frame-<number>.png` 或 `<purpose>-frame-<number>.png`。
- 视频分析：`<source-slug>-style-analysis.json`。
- 风格模板：`<style-slug>.md`。

## 选择目录的判断

- 会被 Remotion 代码引用：放 `public/`。
- 是 episode 或模板源码：放 `src/`。
- 是可复用知识、台账、风格模板：放 `docs/`。
- 是渲染产物、检查图、实验图、临时视频：放 `out/`。

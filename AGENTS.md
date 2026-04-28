# Project Notes

当前工作环境是 Windows + Windows PowerShell 5.1。运行命令时优先使用 PowerShell 原生命令；不要默认使用 bash/wsl，也不要使用 `&&` 连接 PowerShell 命令。

## Video Understanding Skill

项目已安装 `video-understanding` skill，位置：

`D:\project\good_project\gugugaga\.agents\skills\video-understanding`

运行时优先使用项目包装脚本：

`D:\project\good_project\gugugaga\scripts\analyze-video.ps1`

包装脚本会读取项目根目录 `.env` 中的 `GEMINI_API_KEY`，并自动补齐 `uv`、`yt-dlp`、`ffmpeg-static` 的路径。不要在回复或日志里输出 API key。
`video-understanding` 已支持直接传本地 mp4 文件路径；本地输入会直接上传 Gemini 分析，不会被脚本删除。

默认用法：

```powershell
powershell -ExecutionPolicy Bypass -File ".\scripts\analyze-video.ps1" "https://www.youtube.com/watch?v=VIDEO_ID" -q "请总结这个视频的演示流程，并提取可复用的视频风格模板，包括镜头节奏、字幕方式、转场、UI演示步骤和适合使用的Remotion组件类型。" -o ".\docs\video-analysis\raw\VIDEO_ID-style-analysis.json"
```

也可以使用更规范的项目包装脚本：

```powershell
powershell -ExecutionPolicy Bypass -File ".\scripts\analyze-style-video.ps1" "https://www.youtube.com/watch?v=VIDEO_ID" "VIDEO_ID"
```

用户已授权：遇到 Douyin/TikTok 等 `yt-dlp` 提示需要 fresh cookies 的公开视频下载场景，可以使用本机浏览器 cookie，例如 `--cookies-from-browser edge` 或包装脚本默认的 Edge cookie。使用后必须在最终回复里明确说明“本次用过浏览器 cookie 下载/访问视频”。不要打印、保存或外传 cookie 内容。

这个问题模板用于把视频演示内容转成后续 Remotion 风格模板知识库的输入。免费层 API 不要大量调用；优先分析少量关键视频，并把原始分析保存到 `docs\video-analysis\raw\`，再把可复用风格沉淀到 `docs\video-style-templates\`。

## Source Video Analysis

抖音、B 站、本地 mp4 和普通 URL 的视频风格分析优先使用统一入口：

```powershell
npm run analyze:source-video -- "抖音链接 / B站链接 / BV号 / 本地mp4路径"
npm run analyze:source-video -- "抖音链接 / B站链接 / BV号 / 本地mp4路径" "可选slug"
```

默认行为：

- 抖音：先用 `douyin-video` 下载 mp4 到 `out\downloads\douyin\`，再交给 `video-understanding` 分析。
- B 站：先用 Docker 版 yutto 下载 mp4 到 `out\downloads\bilibili\`，再交给 `video-understanding` 分析。
- 本地 mp4：直接交给 `video-understanding` 分析，不删除本地文件。
- 分析 JSON 保存到 `docs\video-analysis\raw\<platform>-<slug>-style-analysis.json`。
- 如果分析 JSON 已存在，默认跳过 Gemini 调用；需要重跑时加 `-Force`。

## Output Structure

输出路径规范见 `docs\output-structure.md`。不要直接把成片、关键帧、诊断图堆在 `out\` 根目录；使用 `out\renders\epNN\`、`out\stills\epNN\`、`out\previews\epNN\` 和 `out\diagnostics\<task>\`。

## Remotion Style Template Builder

项目已安装 `remotion-style-template-builder` skill，位置：

`D:\project\good_project\gugugaga\.agents\skills\remotion-style-template-builder`

当需要从创作 brief 设计专业视频风格模板、沉淀风格知识库、规划 Remotion 组件类型或创建 `docs\video-style-templates\<style-slug>.md` 时，优先使用这个 skill。

每个风格模板必须参考维度定义规范：

`D:\project\good_project\gugugaga\docs\video-style-templates\style-dimensions-schema.md`

模板可以增加更多维度，但不能少于 schema 中的必填维度。推荐 `remotion-bits`、`remocn` 或项目内具体组件名前，必须先验证来源；没有验证时只写组件类型，不虚构具体组件名。

组件获取采用按需策略，不使用 Docker，不全量搬库。常用入口：

```powershell
npm run remotion-bits:find -- "terminal typewriter" --limit 3 --json
npm run remotion-bits:fetch -- bit-terminal-3d --json
npm run remocn:add -- terminal-simulator
```

详细规则见 `docs\remotion-component-sources.md`。`remocn` 使用 shadcn registry 工作流，项目根目录保留 `components.json`，`tsconfig.json` 已配置 `@/* -> src/*`。

## Douyin Video Skill

项目已安装 `douyin-video` skill，位置：

`D:\project\good_project\gugugaga\.agents\skills\douyin-video`

优先使用项目包装脚本：

```powershell
npm run douyin:video -- --link "抖音分享链接" --action info
npm run douyin:video -- --link "抖音分享链接" --action download
```

默认下载目录是 `out\downloads\douyin\`。这个 skill 只保留 `info` 和 `download` 动作，不需要 API key；视频理解和风格分析交给 `video-understanding` + Gemini。

遇到带 `modal_id=视频ID` 的 Douyin 用户页链接，也可以直接传给 `douyin:video`；项目内脚本已经做了视频 ID 兼容。

## Bilibili Video Download

项目已安装 yutto 官方 `bilibili-video-download` skill，位置：

`D:\project\good_project\gugugaga\.agents\skills\bilibili-video-download`

项目使用 Docker 运行 yutto，优先使用：

```powershell
npm run bilibili:video -- "https://www.bilibili.com/video/BVxxxx"
npm run bilibili:video -- "BVxxxx"
```

默认下载目录是 `out\downloads\bilibili\`。Docker 镜像是 yutto 官方 README 推荐的 `siguremo/yutto`。yutto 配置目录挂载到 `.cache\yutto\`，避免登录配置随容器删除而丢失；`.cache` 已被 Git 忽略。

如果 B 站资源需要登录或更高清晰度，优先使用 yutto 的 `auth login` / `auth status` 流程，不要在命令行里明文传 Cookie。

```powershell
npm run bilibili:video -- auth status
npm run bilibili:video -- auth login
```

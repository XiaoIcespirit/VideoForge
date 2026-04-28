---
name: douyin-video
description: "抖音无水印视频解析和下载工具. 从抖音分享链接、完整视频链接、带 modal_id 的用户页链接或视频 ID 获取无水印下载链接，并下载 mp4 到本地. 适用场景包括解析抖音视频信息、下载抖音视频、把抖音视频交给后续 video-understanding 分析."
---

# 抖音无水印视频解析和下载

从抖音链接或视频 ID 获取无水印视频下载链接，并把视频保存为本地 mp4。本 skill 只负责解析和下载；文案、画面和风格分析交给项目的 `video-understanding` skill。

## 功能

- 获取视频信息：视频 ID、标题、无水印下载链接。
- 下载视频：保存为 `<video_id>.mp4`。
- 机器可读输出：`--json` 输出稳定 JSON，便于脚本串联。

## 环境要求

```powershell
python -m pip install requests
```

项目包装脚本会设置 UTF-8 控制台输出，避免 Windows PowerShell 5.1 遇到 emoji 标题时报 GBK 编码错误。

## 推荐用法

项目内优先使用包装脚本：

```powershell
npm run douyin:video -- --link "抖音分享链接" --action info
npm run douyin:video -- --link "抖音分享链接" --action info --json
npm run douyin:video -- --link "抖音分享链接" --action download
npm run douyin:video -- --link "抖音分享链接" --action download --json
```

默认下载目录：

```text
out/downloads/douyin/
```

## 脚本用法

```powershell
python .agents/skills/douyin-video/scripts/douyin_downloader.py --link "抖音链接" --action info
python .agents/skills/douyin-video/scripts/douyin_downloader.py --link "抖音链接" --action download --output out/downloads/douyin
```

支持输入：

- `https://v.douyin.com/...`
- `https://www.douyin.com/video/<video_id>`
- `https://www.douyin.com/user/...?...&modal_id=<video_id>`
- 纯数字视频 ID

## JSON 输出

`info --json` 输出：

```json
{
  "platform": "douyin",
  "video_id": "7612631899479648866",
  "title": "视频标题",
  "download_url": "https://...",
  "url": "https://...",
  "source_url": "https://..."
}
```

`download --json` 会额外输出：

```json
{
  "video_path": "D:\\project\\good_project\\gugugaga\\out\\downloads\\douyin\\7612631899479648866.mp4",
  "file_size": 12692889
}
```

## 与视频理解闭环

抖音视频分析应优先走统一入口：

```powershell
npm run analyze:source-video -- "抖音链接"
```

统一入口会先用本 skill 下载 mp4，再把本地 mp4 交给 `video-understanding`，输出风格分析 JSON 到 `docs/video-analysis/raw/`。

## 注意事项

- 本工具仅供学习和研究使用。
- 使用时需遵守相关法律法规和平台规则。
- 请勿用于任何侵犯版权或违法的目的。

# 项目待办

## Open

- [ ] 修复 `video-understanding` 的 Gemini API 调用问题。
  - 现象：抖音视频下载、本地 mp4 识别、上传 Gemini File API 都已跑通，但 `generateContent` 分析失败。
  - 当前错误：`gemini-2.5-flash-lite` 返回 `403 PERMISSION_DENIED`；`gemini-2.0-flash-lite` 返回 `429 RESOURCE_EXHAUSTED`，并显示免费层 `limit: 0`。
  - 判断：不是项目脚本问题，而是 Google AI Studio 项目的生成权限、免费层额度、地区或结算层级问题。
  - 后续处理：先在 Google AI Studio 中确认项目是否可直接运行最小文本生成；必要时设置结算信息、换新项目或换可用的 `GEMINI_API_KEY`。

## Done

- [x] 暂停继续排查第一个 skill，把问题记录为待办，后续再处理。

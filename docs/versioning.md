# 版本管理规范

本项目按“`main` 主干 + 每集数据文件 + 发布 tag + episode 台账”管理系列视频版本。不要把“一集一个长期分支”作为主工作流。

## 1. 核心原则

- `main` 永远代表当前最新模板、当前素材组织方式，以及所有已纳入项目的 episode 数据。
- 每一集都是数据文件，不是长期分支。新增集数优先新增 `src/episodes/` 下的 episode 文件。
- 已发布版本用 tag 锁定，例如 `ep01-v1.0.0`、`ep01-v1.1.0`、`ep02-v1.0.0`。
- 旧 tag 不移动、不覆盖。修订已发布集数时，必须新增修订 tag。
- commit 编号只做辅助索引；主要回溯入口是 tag 和 `docs/episode-index.md`。

## 2. 分支规则

长期分支：

- 只保留主干分支 `main` 作为长期维护线。
- 不保留“一集一个长期分支”，避免模板、素材和规范在不同分支里分叉。

短期分支：

- 做新一集：`episode/ep02-topic-slug`。
- Codex 做新一集：`codex/ep02-topic-slug`。
- 修已发布集：`episode/ep01-v1.1-polish`。
- 模板大改：`template/character-card-layout-v2`。

短期分支完成后合回 `main`。合回后再按发布规则打 tag。

## 3. Tag 规则

命名格式：

```console
epNN-vMAJOR.MINOR.PATCH
```

示例：

```console
ep01-v1.0.0
ep01-v1.1.0
ep02-v1.0.0
```

版本含义：

- `v1.0.0`：该集首次可发布版本。
- `MINOR`：内容、镜头、字幕、角色摆放等可见修订。
- `PATCH`：错别字、小裁切、小时间轴修正等轻量修订。

推荐使用 annotated tag：

```console
git tag -a ep01-v1.0.0 -m "Release EP01: Vibe Coding 哲学原理"
```

注意：

- 打 tag 前必须确认当前提交已经包含该集对应的源码、素材引用、台账和规范文档。
- 不要对未提交工作区打 tag。
- 不要强制移动已发布 tag。

## 4. 提交粒度

推荐把不同性质的变更拆开提交：

- 模板框架改动单独提交。
- 某一集文案、镜头、字幕数据单独提交。
- IP 素材处理单独提交。
- 规范文档和台账更新单独提交，或随发布提交一起提交。
- 每次正式发布某集前，确保 `docs/episode-index.md` 已更新。

## 5. 输出文件规则

- `out/` 是本地渲染输出目录，不作为主要 git 版本内容。
- 最终视频文件按 tag 命名，便于和源码版本对应。

示例：

```console
out\renders\ep01\XiaoxuelingVibeCodingEp01_ep01-v1.0.0.mp4
```

如果需要长期归档成片，可以放到网盘、GitHub Release 附件或单独成片归档目录。源码仓库优先保证可复现渲染。

## 6. 发布一集的流程

1. 确认 episode 数据、角色素材引用、字幕和关键帧都已经完成。
2. 按 `docs/remotion-project-standards.md` 检查视觉规范，特别是背景不能出现无关环境标签。
3. 运行 `npm run lint`。
4. 如涉及视觉改动，渲染 2 到 4 张关键帧 still 预览。
5. 更新 `docs/episode-index.md`，记录集数、标题、Composition ID、源文件、输出文件名和发布 tag。
6. 提交当前源码和文档。
7. 在发布提交上打 annotated tag。
8. 如需要成片，按 tag 名称渲染最终视频。

首次发布 EP01 时，建议命令如下：

```console
git tag -a ep01-v1.0.0 -m "Release EP01: Vibe Coding 哲学原理"
npx remotion render XiaoxuelingVibeCodingEp01 out\renders\ep01\XiaoxuelingVibeCodingEp01_ep01-v1.0.0.mp4
```

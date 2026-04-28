# 小雪灵 IP 讲课视频模板

这是一个基于 Remotion 的竖屏知识短视频模板项目。它的定位不是单条视频工程，而是“小雪灵讲课”系列的可复用模板框架。

核心思路：

- `src/templates/` 负责画面结构、角色陪讲、信息卡、字幕和动画。
- `src/episodes/` 负责每一集的内容数据。
- `public/ip/` 负责 IP 形象素材。
- 新增第 2 集、第 3 集时，优先新增 episode 数据，不复制模板组件。
- 修改 Remotion 模板前，先遵守 `docs/remotion-project-standards.md` 的项目规范；背景默认必须保持干净，不能出现 `SHIP / VERIFY / AI RUN / INTENT` 这类环境标签。
- 系列版本按 `docs/versioning.md` 管理，集数发布记录统一维护在 `docs/episode-index.md`。

## 当前成片

Composition ID:

```console
XiaoxuelingVibeCodingEp01
```

渲染命令：

```console
npx remotion render XiaoxuelingVibeCodingEp01 out\renders\ep01\XiaoxuelingVibeCodingEp01_ep01-v1.0.0.mp4
```

## 模板结构

主要文件：

- `src/templates/VibeCodingShort.tsx`：当前的小雪灵讲课模板组件，导出 `XiaoxuelingLectureTemplate`。
- `src/templates/xiaoxuelingLecture/types.ts`：模板数据结构，包含 episode、brand、character、scene、caption 类型。
- `src/templates/xiaoxuelingLecture/presets.ts`：默认小雪灵 IP 和品牌配置。
- `src/episodes/vibeCodingEpisode1.ts`：第 1 集《Vibe Coding 到底是什么》的内容数据。
- `src/episodes/index.ts`：集中导出要批量注册的集数列表。
- `src/Root.tsx`：根据 `lectureEpisodes` 自动注册 Remotion composition。

## 一集视频的数据层

每一集是一个 `LectureEpisode`：

- `meta`：composition ID、画幅、帧率、时长。
- `brand`：顶部标题、章节标题、集数标签、字幕区标签。`ambientChips` 默认留空，避免背景出现装饰标签。
- `character`：IP 图片、三视图图像比例、横向视图数量。
- `highlightWords`：字幕高亮词。
- `scenes`：镜头结构和屏幕信息。
- `captions`：字幕时间轴。

也就是说，后续批量生成时，最常换的是：

- `brand.chapterTitle`
- `brand.episodeLabel`
- `character.image`
- `highlightWords`
- `scenes`
- `captions`
- `meta.compositionId`
- `meta.durationSeconds`

## 新增一集

推荐流程：

1. 复制 `src/episodes/vibeCodingEpisode1.ts`，改成新的文件名，例如 `vibeCodingEpisode2.ts`。
2. 修改 `meta.compositionId`，例如 `XiaoxuelingVibeCodingEp02`。
3. 修改 `brand.chapterTitle` 和 `brand.episodeLabel`。
4. 替换 `scenes` 和 `captions`。
5. 在 `src/episodes/index.ts` 中把新 episode 加进 `lectureEpisodes` 数组。
6. 在 `docs/episode-index.md` 中登记为 `Draft`，正式发布时再填入 tag 和 commit。

## 版本管理

本项目不采用“一集一个长期分支”的方式。`main` 保留最新模板和所有集数数据；每集发布版本用 tag 锁定，例如 `ep01-v1.0.0`、`ep01-v1.1.0`、`ep02-v1.0.0`。

常用文档：

- `docs/remotion-project-standards.md`：Remotion 画面、角色图卡、字幕和背景规范。
- `docs/versioning.md`：分支、提交、tag、输出文件命名规范。
- `docs/episode-index.md`：每集的 Composition ID、源文件、发布 tag、commit 和输出文件台账。

## 替换 IP 形象

把新 IP 图放进 `public/ip/`，然后改 episode 的：

```ts
character: {
  image: "ip/your-character.png",
  sourceAspect: 1080 / 608,
  viewsPerSheet: 3,
}
```

当前模板默认假设角色图是横向三视图：正面、侧面、背面。如果换成单张正面图，可以把 `viewsPerSheet` 改成 `1`，并只使用 `front` 视角。

## 常用命令

安装依赖：

```console
npm install
```

启动 Remotion Studio：

```console
npm run dev
```

类型检查和 lint：

```console
npm run lint
```

打包检查：

```console
npm run build
```

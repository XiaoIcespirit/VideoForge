# VideoForge — 视频锻造坊

> AI 驱动的竖屏知识短视频批量生产系统。数据与模板分离，一套框架支撑系列化内容持续产出。

![](https://img.shields.io/badge/Remotion-4.0-blue) ![](https://img.shields.io/badge/React-19-black) ![](https://img.shields.io/badge/TypeScript-5.9-blue) ![](https://img.shields.io/badge/Tailwind_CSS-4.0-cyan)

## 是什么

VideoForge 是一个基于 Remotion + AI 分析的竖屏知识短视频批量生成引擎。它的核心设计哲学是**内容与模板完全解耦**——模板负责画面结构和动画逻辑，episode 数据负责具体内容，两者独立维护，批量产出时无需触碰模板代码。

目前已稳定运行**《小雪灵讲 Vibe Coding》系列**，单套模板可复用至任意知识品类的竖屏讲课视频。

## 核心架构

```
视频风格分析管线          批量渲染管线
─────────────────       ─────────────────
AI 分析优质参考视频  →   Episode 数据文件  →   Remotion 渲染  →   竖屏成片
  (video-understanding)       ↓                  ↓
  Gemini AI               模板组件           自动化渲染
  风格沉淀为模板            ↓
  + Douyin/B站下载器    8 种标准镜头类型
```

**三层职责分离：**

| 层级 | 目录 | 职责 |
|------|------|------|
| 内容层 | `src/episodes/` | 每一集的文字、镜头结构、字幕时间轴，全部数据化 |
| 模板层 | `src/templates/` | 画面布局、动画逻辑、角色陪讲，固化不变 |
| 组件层 | `src/components/` | remocn 组件库：终端模拟器、数据流管道、关键词高亮等 |

## 8 种标准镜头类型

每集视频由以下标准镜头拼装而成，批量生产时直接替换数据，无需重新设计：

| 镜头 | 用途 | 核心组件 |
|------|------|----------|
| Hook | 3 秒强钩子，吸引注意力 | BitBlurWords 字符级渐入 |
| ChapterMap | 本集问题地图，结构化引入 | DataFlowPipes 数据流管道 |
| CoreConcept | 一句话定义 + 关键词轨道 | 关键词 orbit + 公式步骤 |
| Analogy | 通俗类比，路线图动画 | 曲线 SVG 路径动画 |
| Engineering | 抽象词 → 工程动作的映射表 | 映射卡片 + TypingCodeBlock |
| MiniDemo | 4 步闭环演示 + 终端验证 | TerminalSimulator + ReadmePanel |
| Pitfall | 误区对比，左右分栏 | 彩色对比列表 |
| Takeaway | 结论收尾 + 行动清单 | pop 缩放动画 + 签名落版 |

## AI 风格分析管线

项目内置端到端 AI 视频分析流程：

```powershell
# 分析抖音视频风格，输出风格模板 JSON
npm run analyze:source-video -- "https://www.douyin.com/video/xxxxxx"
```

支持的输入源：

- **抖音** — `npm run douyin:video` 下载 → Gemini AI 分析
- **B站** — `npm run bilibili:video` Docker yutto 下载 → Gemini AI 分析
- **YouTube / 普通 URL** — `npm run analyze:video` 直接分析

分析结果沉淀至 `docs/video-style-templates/`，可被后续 episode 复用。

## 批量生产一集

只需修改数据，不动代码：

```
1. 复制 src/episodes/vibeCodingEpisode1.ts → vibeCodingEpisode2.ts
2. 修改 brand（集数标题、章节名）
3. 替换 scenes（镜头内容）+ captions（字幕时间轴）
4. 注册到 src/episodes/index.ts
5. npm run dev 预览 → npx remotion render 输出
```

角色、背景、动画全部由模板固定，换 IP 形象只需替换 `public/ip/` 下的图片文件。

## 项目结构

```
VideoForge/
├── src/
│   ├── templates/           # 模板组件（画面结构 + 动画）
│   │   ├── VibeCodingShort.tsx
│   │   └── xiaoxuelingLecture/
│   ├── episodes/            # Episode 数据（内容全部在此）
│   │   ├── vibeCodingEpisode1.ts
│   │   └── index.ts
│   └── components/remocn/  # remocn 专业组件库
├── public/ip/              # IP 角色三视图贴图
├── scripts/                # 包装脚本（视频分析 / 下载 / 渲染）
├── docs/                   # 项目规范、风格模板、集数索引
└── .agents/skills/         # AI Skill 知识库（video-understanding 等）
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动 Remotion Studio（浏览器预览）
npm run dev

# 打包检查
npm run build

# 类型检查
npm run lint
```

渲染单集：

```bash
npx remotion render XiaoxuelingVibeCodingEp01 \
  out/renders/ep01/XiaoxuelingVibeCodingEp01_ep01-v1.0.0.mp4
```

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Remotion | 4.0.448 | 视频渲染引擎 |
| React | 19.2.3 | UI 框架 |
| TypeScript | 5.9.3 | 类型安全 |
| Tailwind CSS | 4.0.0 | 样式 |
| remotion-bits | 0.2.0 | 动效组件库 |
| Gemini AI | — | 视频风格分析 |

## 文档

- `docs/remotion-project-standards.md` — 画面规范（竖屏比例、字幕、安全边距）
- `docs/versioning.md` — 版本管理策略
- `docs/episode-index.md` — 集数发布台账
- `docs/video-style-templates/` — 可复用风格模板库

## License

Private — 本项目仅供学习与个人使用。

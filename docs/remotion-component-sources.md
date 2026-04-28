# Remotion 组件来源策略

本项目按需获取 `remotion-bits` 和 `remocn` 组件，不使用 Docker，也不全量搬运组件库。

## remotion-bits

`remotion-bits` 优先用于基础动效、文本动效、粒子、代码块、3D 场景和可搜索的 docs bit 示例。

查询组件或示例：

```powershell
npm run remotion-bits:find -- "terminal typewriter" --limit 3 --json
```

拉取示例源码：

```powershell
npm run remotion-bits:fetch -- bit-terminal-3d --json
```

直接调用 CLI：

```powershell
npm run remotion-bits -- find "camera flythrough product showcase" --tag scene-3d --json
```

真正实现视频时，如果只需要包内导出的基础组件，再安装 npm 包：

```powershell
npm install remotion-bits
```

如果需要深度改造源码，优先 fetch 示例或用 jsrepo 从 registry 复制具体组件，不要全量复制仓库。

## remocn

`remocn` 优先用于生产感更强的完整 UI blocks、转场和 compositions，例如浏览器流程、终端部署、设备组装、代码窗口和产品 demo 场景。

按需添加组件：

```powershell
npm run remocn:add -- blur-reveal
npm run remocn:add -- terminal-simulator
npm run remocn:add -- browser-flow
```

包装脚本会自动把 `blur-reveal` 规范成 `@remocn/blur-reveal`，并交给 shadcn CLI：

```powershell
npx shadcn@latest add @remocn/blur-reveal
```

组件会按 `components.json` 的 alias 配置复制到项目组件目录，默认通过 `@/components/...` import。项目 `tsconfig.json` 已配置 `@/* -> src/*`。

## 选择规则

- 风格模板阶段：只验证组件名和适用场景，不急着安装。
- 实现阶段：按镜头需求只拉最少组件。
- `remotion-bits` 更适合动效原语和可改造示例。
- `remocn` 更适合完整场景块和产品视频 UI。
- 推荐具体组件名前必须实际查到来源；查不到时只写组件类型。

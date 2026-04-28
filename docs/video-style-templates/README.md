# Video Style Templates

这里存放可复用的视频风格模板。第一版模板可以直接从创作 brief 设计，不依赖 `video-understanding` 的视频分析结果。

## Schema

所有正式模板都必须参考：

```text
docs/video-style-templates/style-dimensions-schema.md
```

模板可以比 schema 更丰富，但不能少于 schema 中的必填维度。

## Naming

- 风格模板：`<style-slug>.md`
- 可选分镜结构：`<style-slug>.scene-plan.json`
- 可选组件映射：`<style-slug>.component-map.md`

`<style-slug>` 使用小写短横线命名，例如 `ai-prompt-tech-shortform.md`。

## Component Rules

推荐 Remotion 组件时必须区分：

- `已验证具体组件`：已经从本地项目、已安装 skill、组件仓库 README/目录或工具输出中确认存在。
- `建议组件类型`：还没有验证具体组件名，只描述需要寻找或实现的组件类型。

不要虚构 `remotion-bits`、`remocn` 或项目内组件名。

## 获取组件

项目采用按需获取策略，不全量部署组件库，也不使用 Docker。

- `remotion-bits` 查询：`npm run remotion-bits:find -- "terminal typewriter" --limit 3 --json`
- `remotion-bits` 拉取示例：`npm run remotion-bits:fetch -- bit-terminal-3d --json`
- `remocn` 添加组件：`npm run remocn:add -- terminal-simulator`

详细规则见 `docs/remotion-component-sources.md`。

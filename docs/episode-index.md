# Episode 台账

这个台账记录每一集的源码入口、发布 tag、对应 commit 和渲染输出。它是回溯某一集版本的第一入口。

## 状态说明

- `Draft`：正在制作，还没有发布 tag。
- `Released`：已经在对应提交上打 tag。
- `Revised`：已发布集数后来产生了新修订版本。

## 集数列表

| Episode | 状态 | 标题 | Composition ID | 源文件 | 发布 tag | Commit | 推荐输出文件 | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EP01 | Draft | Vibe Coding 到底是什么 | `XiaoxuelingVibeCodingEp01` | `src/episodes/vibeCodingEpisode1.ts` | `ep01-v1.0.0` 待发布 | 待首次发布提交 | `out\renders\ep01\XiaoxuelingVibeCodingEp01_ep01-v1.0.0.mp4` | 3 分 12 秒竖屏章节课版，已切换为小雪灵角标和复用组件体系，发布前需先提交当前 Remotion 模板工作并打 tag。 |

## 更新规则

- 新增一集时，先登记为 `Draft`。
- 正式发布时，把状态改为 `Released`，填入实际 tag 和 commit。
- 修订已发布集时，新增一行修订记录，不覆盖旧发布记录。
- tag 是主要回溯入口，commit 是辅助索引。
- 成片输出放在 `out/renders/epNN/`，文件名应包含发布 tag，避免成片和源码版本脱节。

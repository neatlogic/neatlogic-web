### 纵向步骤布局（TsStepList）

只负责步骤编号、连接线、单项折叠及键盘操作，不加载数据或解释业务状态。

参数 | 类型 | 默认值 | 说明
---|---|---|---
`itemList` | Array | `[]` | 原始列表，按传入顺序展示
`itemKey` | String | `id` | 列表项稳定且唯一的键
`value` / `v-model` | String / Number / null | `null` | 唯一展开项的键；再次点击收起并发出 `input(null)`

插槽 `header`、`meta`、`content` 均透出 `{ item, index, isExpanded }`。`meta` 在宽屏右对齐、窄屏换行；`content` 只挂载当前展开项，同一键的数据刷新不会重建详情。标题支持鼠标及 Enter / Space 操作，标题插槽应只包含展示内容，避免嵌套交互控件。

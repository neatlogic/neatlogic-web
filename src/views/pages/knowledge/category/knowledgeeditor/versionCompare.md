# 版本对比逻辑收敛方案

## Summary

版本对比逻辑集中在 `KnowledgeEditor` 的 versionCompare 模块内维护。页面层不写 diff、不判断新增删除、不拼高亮 mark，只负责传 `oldDocumentVo`、`newDocumentVo`、`compareSide`。这样后续改对比规则，只改一个模块。

## Key Changes

- 页面层职责收敛：
  - `comparison-dialog.vue` / `change-document.vue` 只负责接口请求和传参。
  - `comparison-detail.vue` 只负责布局、滚动同步、目录区域，以及渲染 `KnowledgeEditor`。
  - 页面层不出现 `compareDocumentVos()`、`changeType` 判断、文本 diff、高亮 class 拼接。

- 编辑器入口职责：
  - `KnowledgeEditor` 只做 compare mode 编排：
    - 接收 `oldDocumentVo`、`newDocumentVo`、`compareSide`
    - 调用统一 compare service
    - 把当前侧 `compareDoc` 渲染出来
  - 不在 `index.vue` 里写复杂 diff 算法。
  - 不走 `setData()`。

- 对比核心集中到一个目录：
  - 建议新增：
    - `utils/versionCompare/index.js`
    - `utils/versionCompare/normalize.js`
    - `utils/versionCompare/block-diff.js`
    - `utils/versionCompare/text-diff.js`
  - 对外只暴露一个主方法：
    ```js
    compareDocumentVos(oldDocumentVo, newDocumentVo)
    ```
  - 输出固定：
    ```js
    {
      oldCompareDoc,
      newCompareDoc
    }
    ```

- 高亮渲染集中：
  - `CompareMark` extension 只负责渲染行内 mark。
  - 块级高亮 class 由统一的 compare attrs 生成。
  - 样式集中在 `index.less` 或一个 compare less 中，不散到页面组件和旧 item 组件里。

- 数据结构统一：
  - 行内差异只用：
    ```js
    { type: 'compareMark', attrs: { changeType } }
    ```
  - 块级差异只用：
    ```js
    attrs: { compareChangeType }
    ```
  - `changeType` 只允许：
    - `insert`
    - `delete`
    - `update`

- Diff 规则约束：
  - 进入 `compareBlockList` 前必须先清洗旧对比链路留下的临时字段。
  - 旧 `lineList` 上的 `changeType`、`lineNumber`，Tiptap 节点上的 `compareChangeType`，以及 mark 中的 `compareMark` 都不能进入新一轮版本对比。
  - 如果旧 HTML 内容里残留了 `knowledge-compare-*`、`bg-insert`、`bg-delete`、`bg-update` 或 `data-compare-change-type`，normalize 阶段必须移除这些高亮痕迹，只保留真实业务内容。
  - `lineList` 可能来自旧版本对比接口，不能把它当成原始文档直接比较；必须先还原为不带高亮状态的干净文档。
  - 旧 `lineList.content` 中只有行内 HTML 标签时，例如 `<strong>`、`<i>`、`<a>`、`<span class="line-through">`，必须保持为同一个 paragraph 的行内内容，不能拆成多个顶层 paragraph。
  - 只有真正的块级 HTML 标签，例如 `p`、`h1`、`ul`、`ol`、`pre`、`table` 等，才允许拆成多个 Tiptap 顶层块。
  - `handler` 和 `config.blockType` 冲突时，以 `handler` 归一后的 Tiptap 类型为准；例如 `handler: 'image'` 即使带着 `config.blockType: 'paragraph'`，也必须转成 `image` 块。
  - 块匹配身份和块是否完全相同要分开处理。
  - 判断块是否完全相同时，只比较语义字段，不能直接比较原始 JSON。
  - `null`、`undefined`、空字符串、空 `attrs`、空 `marks`、空 `content` 等归一化差异不算内容变化。
  - 旧 `lineList.config` 中的渲染/保存协议字段不算内容变化，不能参与块语义比较，例如：
    - `className`
    - `codeMode`
    - `value`
    - `url`
    - `row`
    - `col`
    - `headerList`
    - `lefterList`
    - `tableList`
    - `tableStyle`
  - 这些旧协议字段如果需要渲染，应只在 adapter 或旧详情页链路中使用；新版 versionCompare 应以转换后的 Tiptap 节点内容和必要语义 attrs 为准。
  - 默认展示属性不算内容变化，例如：
    - `align: 'left'`
    - `textAlign: 'left'`
    - `verticalAlign: 'top'`
    - `colspan: 1`
    - `rowspan: 1`
    - `start: 1`
    - `uploading: false`
    - `controls: true`
  - `blockUuid`、`blockType`、`compareChangeType`、`compareMark` 只服务编辑器定位和临时渲染，不参与“内容是否相同”的判断。
  - 版本对比要先跑“媒体展示属性专用判断”：如果新旧文档按顺序比较，忽略图片/视频的 `width`、`height`、`align`、`aspectRatio` 后完全一致，则直接返回结果，只把这些媒体块标记为 `update`，其他块必须原样输出。
  - 媒体展示属性专用判断必须早于 LCS、相似度配对和 unmatched chunk 处理，避免“只缩小图片”落入模糊 diff 后污染图片前后的内容。
  - 优先用 `blockUuid` 匹配同一个块；`blockUuid` 不稳定或缺失时，再使用稳定内容身份做兜底匹配。
  - 媒体块必须使用资源身份做兜底匹配：
    - `image` 使用 `attrs.src || attrs.url || attrs.value`。
    - `insertVideo` 使用 `attrs.src || attrs.recordUuid || attrs.value`。
  - 非媒体块如果类型相同且纯文本相同，也要作为稳定锚点；这类场景通常是粗体、斜体、链接、删除线、颜色等 mark 或样式变化，应该进入 `update`，不能拆成左侧 `delete`、右侧 `insert`。
  - 表格块不能只按纯文本相同就直接视为未变化。新旧表格配对成功后，如果单元格文本相同但 Tiptap 语义 attrs 有变化，例如 `cellStyle`、`background`、`verticalAlign`、`style`、`rowStyle`、`colspan`、`rowspan`、`colwidth` 等，必须把表格块标记为 `update`。
  - 表格样式变化要优先做局部高亮：能定位到单元格时，只给对应 `tableCell/tableHeader` 标记 `update`；只有结构无法稳定对齐或整表新增/删除时，才退回整张表高亮。行级 `rowStyle/rowHeight` 这类容易由归一化产生的差异，不能默认扩散成整行或整表高亮。
  - 表格单元格内容发生变化时，要递归比较单元格内部的 Tiptap 块；如果变化来自内嵌表格、段落、列表等子内容，优先把高亮落到子内容上，不能直接把承载它的外层 `tableCell/tableHeader` 整格标记为 `update`。
  - 表格单元格的新旧可见文本完全一致时，不能因为旧版详情 HTML 和新版组件回显 HTML 的包装结构不同而标记变化；例如 `div/h4/span/table` 包装、只读组件容器、空占位节点不同，都应视为渲染结构噪声。
  - 表格行数不一致时，必须先对 `tableRow` 做相似度/稳定内容配对；例如只在内嵌表格顶部新增一行时，预期只把新增行标记为 `insert`，后续完全相同的行必须继续对齐，不能退化成整张表或外层大单元格高亮。
  - 表格单元格 diff 要忽略整表共同基础样式和归一化噪声，例如所有单元格共有的 `tableStyle.td` 派生样式、自动生成的 `colwidth` 等；这些差异不能把整张表或所有单元格都标记为 `update`。
  - 旧协议字段 `tableStyle`、`tableList`、`headerList`、`lefterList` 不直接参与新版语义比较；如果这些字段里的样式需要在版本对比中体现，必须先由 adapter 归一到 Tiptap 表格节点的 `cellStyle/background/verticalAlign/style/rowStyle` 等语义 attrs，再交给 `block-diff.js` 判断。
  - 媒体块的 `width`、`height`、`align` 等展示属性不能参与“是不是同一个块”的锚点匹配，否则只缩放图片会导致后续内容被连带判为变化。
  - 媒体块匹配成功后，仍然要用完整块内容判断是否变化；例如同一张图片只改 `width/height`，只允许这张图片标记为 `update`，不能把后面的代码块、表格、段落继续标记为变化。
  - 不允许通过忽略 `width/height` 来假装图片没变；尺寸变化是图片块自身的 `update`，不是后续块的 `insert/delete/update`。
  - 新增媒体类型时，必须先补充它的稳定资源身份规则，再接入 `block-diff.js` 的块匹配逻辑。
  - LCS 只能作为第一层精确锚点，不能作为唯一对齐依据。
  - 两个精确锚点之间的 unmatched chunk 必须继续做相似块配对，不能因为新旧块数量不一致就把整段旧内容标记为 `delete`、整段新内容标记为 `insert`。
  - unmatched chunk 内的相似块配对规则：
    - 类型不同的块不配对。
    - 完全相同的块优先配对。
    - 媒体块按稳定资源身份配对。
    - 非媒体块按纯文本相似度配对；纯格式变化、代码块少一行、列表多一项等，应尽量落到同一个块的 `update`。相似度阈值不能过高，否则“删除一行代码”这类局部变化会退化成整块 `delete/insert`。
  - 只有在 unmatched chunk 内找不到可配对块时，才允许走真正的 `insert/delete`。
  - 不能把“新旧块数量相等”当成可配对条件；长度相等但类型或内容不相似时，按位置硬比会制造错误的 `update`，必须先通过稳定身份或相似度判断。
  - 已经配对成功的块，外层 `compareChangeType` 应使用 `update` 表示“同一个块发生变化”；块内新增/删除的文字范围可以继续使用行内 `compareMark` 的 `insert/delete`。只有整块未配对时，外层才允许使用 `insert/delete`。
  - 版本对比要尽量保持文档流的顺序稳定：局部新增、删除、缩放、格式变化不应该把后续未改内容整体染成红/绿。

- 后续维护规则：
  - 想改“怎么比”：只改 `utils/versionCompare/*`。
  - 想改“怎么显示颜色”：只改 `CompareMark` 和样式。
  - 想改“页面布局”：只改 `comparison-detail.vue`。
  - 页面组件永远不直接参与 diff 规则。

## Legacy Formatting Cleanup

- Version compare owns its own diff result. Any formatting returned only for an old backend compare/render path must be removed in `utils/versionCompare/normalize.js` before converting data to Tiptap JSON or running `compareBlockList`.
- Backend-returned deletion-line traces are treated as legacy compare display state, not business content. Normalize must strip:
  - `class="line-through"` from HTML.
  - `<s>...</s>`, `<strike>...</strike>`, and `<del>...</del>` wrapper tags while keeping their inner text.
  - Tiptap marks with `type: 'strike'`.
- This cleanup only applies to the version-compare input path. Normal editing and saving can still preserve real strike formatting according to editor behavior.
- After cleanup, the frontend compare logic must generate all `insert` / `delete` / `update` marks itself; it must not rely on backend-provided deletion-line markup.

## Test Plan

- 搜索页面层代码，确认没有散落的 `insert/delete/update` 判断。
- 修改一条 diff 规则时，只需要改 versionCompare 模块。
- 修改颜色样式时，不需要改 diff 逻辑。
- `oldDocumentVo/newDocumentVo` 新旧格式混合时，统一由 normalize 处理。
- `lineList` 带有旧链路 `changeType: insert/delete/update` 时，normalize 后预期这些字段不进入 Tiptap 文档，也不影响本次 diff。
- 对比页只读，不触发编辑态 `setData()`、`emitChange()`。
- 图片只改尺寸时，预期只有图片块标记为 `update`，图片后的代码块、表格、段落等未修改内容不应出现高亮。
- 图片后面的内容出现局部增删时，预期相似段落、代码块、表格、列表优先按 `update` 对齐，不应整段变成左侧 `delete`、右侧 `insert`。
- 同一段文字只增加粗体、斜体、链接、删除线等 mark 时，预期这一段是 `update`，不是旧段落 `delete` 加新段落 `insert`。
- 表格只修改样式但单元格文字不变时，例如只改某一列的背景色、对齐方式、边框、宽度或单元格内联样式，预期表格块标记为 `update`，不能因为纯文本相同而完全不高亮。
- 表格只修改局部样式时，预期优先高亮变更行、列或单元格；例如只改第一列样式时，只高亮第一列对应单元格，不应铺满整张表。
- 内嵌表格只新增一行时，预期只在新侧新增的 `tableRow` 上出现 `insert`；外层承载单元格、后续相同行、以及表格后面的段落/配置项不应被连带标记为变化。
- 旧版 `formtable` 简化 HTML 与新版组件回显 HTML 可见文本一致时，预期不因为 DOM 包装差异出现左侧 `delete`、右侧 `insert`。
- 只因新旧数据归一化产生 `null/undefined/默认值` 差异时，预期不出现任何高亮；例如图片前后的段落、列表、代码块内容未改时必须保持未标记状态。

## Assumptions

- 版本对比是 `KnowledgeEditor` 的能力，不再继续维护旧 `item-*` 对比渲染链路。
- versionCompare 模块是唯一的差异计算来源。
- 页面层只做数据传递和展示布局。

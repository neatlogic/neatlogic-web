# KnowledgeEditor

`KnowledgeEditor` 是知识库编辑页使用的新版 Tiptap 编辑器组件。它独立于旧知识库编辑器，组件内部以 Tiptap JSON 作为正文主格式，对外通过 adapter 转成当前知识库后台仍在使用的 `lineList/fileIdList/tagList` 协议。

## 业务边界

- 组件服务于 `src/views/pages/knowledge/edit/knowledge-edit.vue`，用于创建、编辑、保存和回显知识文档。
- 工单转知识入口仍按旧流程生成知识数据，新编辑器只负责在知识库侧正确回显、编辑、保存和详情展示兼容。
- 新组件内部数据格式优先保持 Tiptap JSON；后台接口调整时优先改 `adapters/knowledge-data-adapter.js`，不要把旧协议散落到编辑器主体里。

## 主数据模型

```js
{
  title: '',
  content: {
    type: 'doc',
    content: []
  },
  tagList: [],
  fileList: [],
  meta: {
    knowledgeDocumentId: null,
    knowledgeDocumentVersionId: null,
    knowledgeDocumentTypeUuid: null,
    source: 'knowledge',
    invokeId: null
  }
}
```

## 对外接口

- `getSaveData()`：返回新组件主数据模型。
- `getAllData()`：返回当前知识库保存接口需要的旧协议。
- `setData(config)`：支持传入新组件主数据模型，也支持旧知识库详情数据。
- `setContent(json)`：设置 Tiptap doc。
- `clearContent()`：清空正文。
- `validate()`：校验标题等基础必填项。
- `focusTitle()`：聚焦标题。
- `focus()`：聚焦正文。
- `getTemplateData()`：提取一级、二级标题作为模板目录。

## 关键文件

- `index.vue`：编辑器主体、生命周期、菜单定位、行拖拽、对外接口。
- `index.less`：编辑器正文基础样式。
- `adapters/knowledge-data-adapter.js`：新旧数据转换边界。
- `utils/versionCompare`：版本对比唯一逻辑目录，负责文档归一、块级/文本级 diff 和临时高亮数据生成。
- `extensions/index.js`：自定义 Tiptap 扩展注册入口。
- `commands/index.js`：菜单命令注册入口。
- `menus/block-menu`：左侧块菜单和行操作菜单。
- `menus/select-content-menu`：选区菜单。
- `menus/table-hover-layer`：表格行列 hover 菜单。
- `menus/link-hover`：链接 hover 编辑。
- `components/tag`：知识标签。
- `components/attachment`：知识附件。
- `components/search-replace-dialog`：搜索替换。

## Tiptap 扩展说明

当前编辑器在 `index.vue` 中注册基础扩展：

- `StarterKit`：段落、标题、列表、引用、代码块等基础能力。
- `Placeholder`：正文占位提示。
- `TextAlign`：段落和标题对齐。
- `Table/TableRow/TableHeader`：表格基础节点。
- `TextStyleKit`：文本样式。
- `TaskList/TaskItem`：任务列表。
- `PasteUploadImages`：粘贴图片上传。
- `ImageResize`：图片尺寸和对齐。
- `SearchHighlight`：搜索高亮。
- `HoverHighlightPlugin`：鼠标所在块高亮。

自定义扩展集中在 `extensions/index.js`：

- `BlockUuid`：给块节点补齐并维护唯一 `blockUuid`。
- `BlockStyle`：块背景色、文字色、边框色。
- `HighlightBlock`：高亮块。
- `InsertVideo`：视频节点。
- `RewriteUuidOnPaste`：复制粘贴时重写块 uuid。
- `TableCellBackground`、`TableCellVerticalAlign`、`ExtendTableCell`：表格单元格样式。
- `Rate`：工单表单评分展示兼容。

新增 Tiptap 节点或扩展时，需要同步检查：

- `extensions/index.js` 是否注册。
- `commands/index.js` 是否需要新增菜单命令。
- `menus` 中是否需要新增入口和图标。
- `adapters/knowledge-data-adapter.js` 是否能保存和回显。
- 旧详情页是否已有对应 `handler`，没有则需要降级到 `editor` 或新增详情组件。

## 数据转换规则

`knowledge-data-adapter.js` 是唯一的新旧协议转换层：

- `knowledgePayloadToTiptap(payload)`：旧知识详情数据转新组件主模型。
- `tiptapToKnowledgePayload(editorData)`：新组件主模型转旧保存协议。
- `legacyLineListToEditorData(lineList, config)`：旧 `lineList` 转新组件主模型。
- `workorderKnowledgePayloadToEditorData(payload)`：工单转知识旧数据在知识库侧回显时使用。

常见 handler 兼容：

- `h1/h2`：转 Tiptap heading。
- `p`：转 paragraph。
- `ul/ol`：转 list。
- `img`：转 image，并保留对齐、宽高、说明。
- `code`：转 codeBlock。
- `table`：转 Tiptap table；保存时输出旧 table config。
- `formtable`：回显时转 Tiptap table；保存时输出 HTML 字符串，保证详情页继续 `v-html` 展示。
- `editor`：读取时保留富文本 HTML 并转为新编辑器节点，保存时不再输出旧 `handler: 'editor'`。
- `markdown`：读取时兼容旧内容，保存时不再输出旧 `handler: 'markdown'`。
- 保存时以新 handler 为准：`paragraph/heading/image/codeBlock/bulletList/orderedList/table`，旧 handler 只作为读取兼容。
- `formtable` 保存为 `handler: 'table'`，并通过 `config.blockType: 'formtable'` 保留表单表格语义。

## 版本对比规则

- 版本对比相关目录必须命名为 `versionCompare`，不要使用语义过宽的 `compare`。
- 版本对比逻辑集中放在 `utils/versionCompare` 中维护，页面组件和编辑器主体不要散落 diff 规则。
- 对外只暴露少量语义明确的方法，例如 `compareDocumentVos(oldDocumentVo, newDocumentVo)`、`normalizeDocumentVoToDoc(documentVo)`。
- 页面层只负责传递 `oldDocumentVo`、`newDocumentVo`、`compareSide`，不直接判断 `insert/delete/update`，也不拼接高亮 class。
- `KnowledgeEditor` 只在 `compareMode` 下编排只读渲染：调用 `utils/versionCompare` 生成当前侧临时 `compareDoc`，不走编辑态 `setData()`。
- 对比产生的 `compareMark`、`compareChangeType` 等字段只允许存在于临时 `compareDoc`，不能写回原始文档，也不能进入保存接口。
- 行内高亮由对比专用 mark/extension 渲染，块级高亮由统一的临时 attrs/class 渲染；样式集中维护，避免分散到旧 `item-*` 组件中。

## 生命周期注意事项

- 不要在 `beforeDestroy` 里直接 `editor.destroy()`，`EditorContent` 自己的销毁阶段仍会访问 `editor.view.dom`。
- 当前做法是 `beforeDestroy/deactivated` 先清理监听、菜单、计时器和共享引用，`destroyed` 再销毁 editor。
- 访问 `editor.view` 时使用 `getEditorView()` 兜底，避免路由离开或组件未挂载时报 Tiptap view 错误。
- 全局事件、节流函数、拖拽监听必须在 `cleanupEditorRuntime()` 中清理。

## 交互注意事项

- 左侧块菜单必须在鼠标从行内移动到菜单、二级菜单、transfer 下拉层时保持显示。
- 行拖拽期间禁止触发悬浮菜单隐藏，拖拽结束后再恢复正常隐藏逻辑。
- 新增 Dropdown/Poptip/Select 等浮层时，优先开启 transfer，并把对应浮层选择器加入 `isBlockMenuTarget()`。
- 新增或删除菜单组件时，要同步检查异步 import 路径，避免运行时 `Cannot find module`。

## UTF-8 和注释

- 新增文件统一保持 UTF-8。
- 关键转换、生命周期、拖拽、兼容逻辑需要保留简短注释。
- 不要为了整理注释而批量重写旧中文内容，避免引入乱码。


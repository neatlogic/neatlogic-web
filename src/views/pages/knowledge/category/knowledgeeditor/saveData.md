# Tiptap JSON 存储与lineList旧数据回显

## Summary

- 正文存储改为 `content: { type: 'doc', content: [] }`，不再保存 `lineList`。
- 旧 `lineList` 只作为历史兼容输入，读取后转换成 Tiptap JSON。

## Key Changes

- 保存链路：
  - `KnowledgeEditor.getAllData()` 改为返回 `content` JSON、`fileIdList`、`tagList`。
  - `setData()` 保持兼容：优先读 `content.type === 'doc'`，旧数据走 `lineListToTiptap()` 转换。
  - 知识编辑页提交保存时不再提交 `lineList`。

## Test Plan

- 新建文档保存，确认请求中只有 `content`，没有 `lineList`。
- 旧 `lineList` 文档打开正常，保存后转成新 `content` 格式。

## Assumptions

- 后端会支持 `content` 字段作为知识正文主存储。
- 短期内仍可能返回旧 `lineList` 历史版本，前端必须保留读取兼容。

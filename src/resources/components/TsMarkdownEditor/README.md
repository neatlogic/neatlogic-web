# TsMarkdownEditor

基于 Cherry Markdown 封装的 Markdown 编辑器，支持内容双向绑定、编辑与预览模式切换、文件上传、KaTeX 公式、Mermaid 图表和预览区视频缩放。样式适配项目的明暗主题。

## 基本用法

```vue
<template>
  <TsMarkdownEditor
    ref="markdownEditor"
    v-model="content"
    :height="500"
    model="editOnly"
    @change="handleChange"
    @ready="handleReady"
  />
</template>

<script>
export default {
  components: {
    TsMarkdownEditor: () => import('@/resources/components/TsMarkdownEditor/index.vue')
  },
  data() {
    return {
      content: '# 标题\n\n请输入正文。',
      contentHtml: ''
    };
  },
  methods: {
    handleChange(markdown, html) {
      this.contentHtml = html;
    },
    handleReady(editor, markdown, html) {
      this.contentHtml = html;
    }
  }
};
</script>
```

`v-model` 绑定 Markdown 字符串，通过 `value` 传入、`input` 事件更新。只展示内容时也可以单独传入 `:value`。

## Props

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `String` | `''` | Markdown 内容，支持 `v-model`；外部值变化时同步到编辑器。 |
| `height` | `Number / String` | `400` | 组件高度，数字转为 px；可传入 `'500px'`、`'auto'` 等 CSS 值。组件最小高度为 120px。 |
| `width` | `Number / String` | `'100%'` | 组件宽度，数字转为 px，字符串作为 CSS 值使用。 |
| `model` | `String` | `'editOnly'` | 编辑器模式：`editOnly`、`previewOnly`、`edit&preview`。 |
| `readonly` | `Boolean` | `false` | 设置编辑区只读、禁用输入和视频拖动缩放，并关闭气泡与浮动工具栏；不会自动改为纯预览模式。 |
| `autofocus` | `Boolean` | `false` | 初始化时是否自动聚焦编辑区。 |
| `toolbar` | `Array / Boolean` | 内置完整工具栏数组 | 自定义顶部工具栏；传入 `false` 隐藏顶部工具栏。省略该参数即可使用默认配置。 |
| `uploadConfig` | `Object` | `{ param: 'file' }` | 上传文件字段名及附加表单参数，详见文件上传说明。 |
| `videoDefaultWidth` | `Number / String` | `'60%'` | 新上传视频的默认宽度，数字转为 px；传入假值时不附加默认宽度。 |

## 事件

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| `input` | `markdown` | Cherry 的 `afterChange` 回调触发时抛出，用于更新 `v-model`。 |
| `change` | `markdown, html` | 与 `input` 同时触发，提供 Markdown 和渲染后的 HTML。 |
| `ready` | `editor, markdown, html` | 编辑器完成初始化，并在下一次 DOM 更新中绑定相关交互后触发；`editor` 是 Cherry 实例。 |
| `upload-success` | `res, file, result` | 单个文件上传请求成功后触发。`res` 为请求返回值，`file` 为原始文件，`result` 为 `{ url, params }`。 |
| `upload-error` | `error, fileOrFiles` | 上传流程失败时触发；单文件上传传入文件，多文件上传传入文件数组。组件同时显示上传失败通知。 |

修改 `readonly` 或 `toolbar` 会保留当前 Markdown 并重建编辑器，因此 `ready` 可能多次触发。重建后应使用新的 Cherry 实例。

## 编辑与预览模式

| 模式 | 说明 |
| --- | --- |
| `editOnly` | 仅显示 Markdown 编辑区，默认模式。 |
| `previewOnly` | 仅显示渲染后的预览区。 |
| `edit&preview` | 同时显示编辑区和预览区。 |

通过修改 `model` 或调用 `switchModel()` 可以切换模式。顶部工具栏的预览按钮在 `editOnly` 和 `previewOnly` 之间切换；切换不会向父组件同步 `model`，也没有对应的模式变化事件。

只读展示推荐同时配置预览模式、只读和隐藏工具栏，项目的在线文档及工具帮助页面也采用此方式：

```vue
<TsMarkdownEditor
  :value="content"
  model="previewOnly"
  readonly
  :toolbar="false"
  height="auto"
/>
```

## 工具栏

默认顶部工具栏包括撤销与重做、文本样式、字号与颜色、标题、对齐、引用、列表、插入菜单、图表、代码主题、导出、复制、搜索和预览切换。插入菜单包括图片、音频、视频、文件、Word、PDF、链接、分隔线、换行、代码、公式、目录和表格。

可通过数组配置按钮顺序，`'|'` 表示分隔符，对象表示下拉菜单：

```vue
<TsMarkdownEditor
  v-model="content"
  :toolbar="['undo', 'redo', '|', 'bold', 'italic', 'header', { insert: ['image', 'video', 'link', 'table'] }, 'togglePreview']"
/>
```

组件还内置选中文本时的气泡工具栏和浮动工具栏。`toolbar=false` 仅控制顶部工具栏；气泡与浮动工具栏在 `readonly=true` 时关闭，当前没有单独配置它们的 prop。顶部工具栏支持换行，并自动调整占用高度。

## 文件上传

上传固定使用项目的 HTTP 实例，向 `/api/binary/file/upload` 发送 `multipart/form-data` POST 请求。`uploadConfig` 不用于配置接口地址或请求头。

```vue
<TsMarkdownEditor
  v-model="content"
  :uploadConfig="{ param: 'file', type: 'example' }"
  videoDefaultWidth="60%"
  @upload-success="handleUploadSuccess"
  @upload-error="handleUploadError"
/>
```

- `uploadConfig.param` 指定文件在 FormData 中的字段名，未设置或为空时使用 `file`。
- `uploadConfig` 的所有非 `null`、非 `undefined` 字段也会直接追加到 FormData，包括 `param` 本身。例如上述配置会提交文件字段 `file`，以及文本字段 `param=file` 和 `type=example`。附加参数名和值需按实际接口要求填写。
- 请求返回值应提供 `Return.url` 和可选的 `Return.name`。未提供名称时使用原始文件名；组件将 URL 和文件参数交给 Cherry 插入内容。
- `upload-success` 中的 `result.params` 包含 `name`；上传视频时还会按 `videoDefaultWidth` 附加 `width`。视频通过文件的 MIME 类型识别。
- 多文件上传并发发起请求，全部完成后按原文件顺序调用插入回调。每个成功请求都会触发 `upload-success`；任一请求失败会触发一次 `upload-error`，并跳过该批次的插入回调。

返回结构示例：

```json
{
  "Status": "OK",
  "Return": {
    "url": "/api/binary/file/download/example",
    "name": "example.mp4"
  }
}
```

示例中的 URL 仅用于说明返回格式，应由实际上传接口返回。

## 视频缩放

非只读状态下，点击预览区视频可显示八个方向的缩放控制点。拖动时保持视频比例，宽度最小为 80px，并根据预览区宽度限制最大值；松开鼠标后，将宽度转换为预览区宽度的百分比写回 Markdown。

宽度回写针对 Cherry 的 `!video[名称#宽度](地址)` 语法，例如：

```markdown
!video[演示视频#60%](/path/to/video.mp4)
```

当前回写逻辑匹配 `!video[...]()`，使用原生 HTML `<video>` 编写的视频不属于这一回写格式。

## 方法

通过组件 `ref` 调用以下方法，读取或操作内容前建议等待 `ready`：

| 方法 | 参数 | 返回值 / 说明 |
| --- | --- | --- |
| `getMarkdown()` | 无 | 返回当前 Markdown；编辑器未初始化时返回空字符串。 |
| `getHtml()` | 无 | 返回当前 HTML；实例不存在或不支持读取时返回空字符串。 |
| `getEditor()` | 无 | 返回当前 Cherry 实例；未初始化或已销毁时为 `null`。 |
| `setMarkdown(value)` | Markdown 字符串 | 设置内容，空值按空字符串处理；实例未初始化时不操作。 |
| `switchModel(model)` | 模式字符串，省略时使用 `model` prop | 切换显示模式，并更新内部模式记录，不修改父组件的 prop。 |
| `focus()` | 无 | 尝试聚焦底层编辑区。 |

```javascript
const editor = this.$refs.markdownEditor;
const markdown = editor.getMarkdown();
const html = editor.getHtml();
editor.switchModel('edit&preview');
```

## 渲染、主题与依赖

- 公式使用 KaTeX，Mermaid 图表通过 Mermaid 渲染并启用源码工具栏；表格转图表功能在当前配置中关闭。
- 编辑器语言优先读取 `$i18n.locale`，其次使用全局 `BASELANGUAGES`，最后回退到中文。`zh`、`en` 分别映射为 `zh_CN`、`en_US`，并监听 `$i18n.locale` 的变化。
- 样式跟随项目主题，暗色主题通过 `html.theme-dark` 适配。可按需在组件元素上覆盖 `--ts-md-primary-color`、`--ts-md-content-padding-x` 等 CSS 变量。
- 组件依赖浏览器 DOM、项目 `$utils.setUuid()`、上传 HTTP 实例，以及上传失败通知所需的 `$Notice` 和 `$t`。
- `autofocus` 在实例初始化时读取；修改它不会立即重新聚焦。`readonly` 和 `toolbar` 变化会重建实例，`value`、`model` 和语言变化则通过各自的同步逻辑更新。
- 当前没有提供自定义插槽或通用 Cherry 配置透传参数。

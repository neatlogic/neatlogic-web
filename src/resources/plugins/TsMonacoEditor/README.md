# TsMonacoEditor

基于 Monaco Editor 封装的 Vue 2 代码编辑组件，支持字符串双向绑定、语法高亮、只读展示、复制、表单校验、自动高度、业务语言扩展和诊断标记。组件入口为 [TsMonacoEditor.vue](./TsMonacoEditor.vue)，当前使用的 `monaco-editor` 版本为 `0.56.0`。

## 基本使用

```vue
<template>
  <div>
    <TsMonacoEditor
      ref="editor"
      v-model="source"
      codeMode="javascript"
      height="300px"
      :isCopy="true"
      :validateList="['required']"
      @ready="handleReady"
    />
    <button type="button" @click="save">保存</button>
  </div>
</template>

<script>
export default {
  components: {
    TsMonacoEditor: () => import('@/resources/plugins/TsMonacoEditor/TsMonacoEditor.vue')
  },
  data() {
    return { source: 'const message = "hello";' };
  },
  methods: {
    handleReady(editor) {
      // editor 为 Monaco 编辑器实例，可在此调用编辑器 API。
    },
    save() {
      if (!this.$refs.editor.valid()) {
        return;
      }
      const source = this.$refs.editor.saveData();
      // 将 source 提交给业务接口。
    }
  }
};
</script>
```

`v-model` 对应 `value` 属性和 `change` 事件，也支持 `:value.sync="source"`。内容应为字符串，清空时传入 `''`。父组件更新 `value` 时同步编辑器内容，不会再次触发 `change` 或 `update:value`。

组件依赖项目的全局 `Loading` 组件、Vuex 的 `themeType` getter、`$t`、`$Message`、`$utils` 及现有样式环境。当前目录没有 `Vue.use()` 插件入口，按示例局部注册即可。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | String | `''` | 编辑器内容。 |
| `codeMode` | String | `'javascript'` | Monaco 语言 ID 或下文支持的别名。 |
| `isReadOnly` | Boolean | `false` | 禁止编辑，仍显示编辑器。 |
| `height` | String | `'220px'` | 编辑器容器高度，建议使用像素值，例如 `'300px'`。 |
| `autoHeight` | Boolean | `false` | 根据内容高度撑开编辑器，初始化时开启；详见高度说明。 |
| `lineNumbers` | Boolean | `true` | 是否显示行号。 |
| `placeholder` | String | `''` | 空内容占位提示。 |
| `isCopy` | Boolean | `false` | 当前内容非空时显示复制按钮，复制整个内容。 |
| `isLoading` | Boolean | `false` | 外部控制加载遮罩；编辑器初始化期间也会显示遮罩。 |
| `loadingText` | String | `''` | 加载提示文本。 |
| `config` | Object | `{}` | Monaco 编辑器配置，支持深度监听并调用 `updateOptions()` 更新。 |
| `languageExtension` | Object | `null` | 业务语言注册、补全、悬浮、折叠及生命周期扩展。 |
| `modelUri` | String | `''` | 模型 URI，用于区分不同编辑资源。为空时按组件实例和语言生成内存 URI。 |
| `markerList` | Array | `[]` | 当前模型的诊断列表，支持深度监听。 |
| `markerOwner` | String | `'ts-monaco'` | Monaco 诊断所属标识。变更时清理当前模型旧 owner 的标记。 |

以下属性来自 [formMixins.js](../../mixins/formMixins.js)：

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `disabled` | Boolean | `false` | 与 `isReadOnly` 共同决定编辑器是否可编辑，同时跳过表单规则校验。 |
| `validateList` | Array | 未设置 | 表单校验规则，例如 `['required']`，规则定义见 [TsValidtor](../TsForm/TsValidtor.js)。 |
| `errorMessage` | String | 未设置 | 外部错误提示；属性变化时同步提示和校验状态。 |
| `readonly` | Boolean | `false` | 参与混入的校验逻辑，但不会将编辑器设为只读；禁止编辑请使用 `isReadOnly` 或 `disabled`。 |

混入中的 `width`、`size`、`border`、`desc` 等通用表单属性没有在此组件模板中接入，不应依赖它们控制展示。

### 编辑器配置与高度

默认关闭 minimap，开启自动换行和粘贴格式化，字体大小为 `13`、行高为 `21`、缩进为 `2` 个空格。主题跟随项目：`themeType === 'dark'` 使用 `vs-dark`，其他值使用 `vs`。

初始化时按以下顺序合并配置，后者覆盖前者：默认配置 → `config` → 自动高度配置（开启时）→ 组件控制的 `model`、`theme`、`readOnly`、`lineNumbers`。应使用对应属性控制这些选项。运行时更新 `config` 时，组件会再次强制使用 `isReadOnly || disabled` 和 `lineNumbers`，避免配置覆盖这两项。

```vue
<TsMonacoEditor
  v-model="source"
  codeMode="json"
  height="120px"
  :autoHeight="true"
  :config="{ fontSize: 14, tabSize: 4 }"
/>
```

自动高度模式开启自动换行、隐藏内部横纵滚动条，并随内容增高；以 `parseFloat(height)` 作为最小像素高度，因此请使用像素值。内容高度监听仅在初始化时注册，`autoHeight` 没有动态切换处理；需要切换模式时建议重新创建组件。固定高度模式下修改 `height` 会直接更新容器样式。

组件通过 `ResizeObserver` 监听容器尺寸变化；在隐藏页签、弹窗显示后仍有布局问题时，可在容器显示后的 `$nextTick` 中调用 `refresh()`。

## 语言支持

当前加载器接入 JavaScript、TypeScript、JSON、HTML、XML、FreeMarker、Python、Ruby、Perl、PowerShell、Shell、YAML、Bat 和 VB 的相关支持；纯文本可使用 `plaintext`。其他语言 ID 需要由业务注册，传入 `codeMode` 不会自动引入对应语言包。

| `codeMode` 输入 | 实际语言 ID |
| --- | --- |
| `js`、`text/javascript`、`javascript` | `javascript` |
| `bash`、`ksh`、`csh`、`sh` | `shell` |
| `cmd` | `bat` |
| `vbscript` | `vb` |
| 其他非空值 | 原样使用 |
| 空字符串 | `javascript` |

各语言提供的能力不同：JavaScript 开启语法诊断、关闭语义诊断，并使用 ES5 编译目标；JSON 开启校验且不允许注释；FreeMarker 使用自定义词法，并复用 HTML 的标签、属性、悬浮和折叠服务，FreeMarker 自身的业务诊断需由后端提供。语言高亮不代表具备对应运行时、执行能力或完整语义检查。

## 事件与插槽

| 事件 | 参数 | 触发时机 |
| --- | --- | --- |
| `change` | 当前内容 String | 编辑器内容变化时触发，用于 `v-model`。 |
| `update:value` | 当前内容 String | 与 `change` 同时触发，用于 `.sync`。 |
| `ready` | Monaco 编辑器实例 | 创建编辑器、注册扩展并应用诊断后触发。 |
| `onFocus` | 无 | 编辑器获得焦点。 |
| `onBlur` | 无 | 编辑器失去焦点；随后按规则执行 blur 校验。 |
| `onScroll` | Monaco 滚动事件对象 | 编辑器滚动状态变化。 |

在 Vue 模板中可用 `@onFocus`、`@onBlur`、`@onScroll` 监听上述同名事件。组件没有暴露初始化失败事件，失败时在组件内显示错误信息，并输出控制台错误。

`validMessage` 为具名插槽，无插槽参数，用于替换默认错误提示。注意混入的 `valid()` 在检测到该插槽存在时会判定校验失败；不需要自定义错误时不要提供此插槽。

## 实例方法

通过 `this.$refs.editor` 调用下列方法。依赖 Monaco 的操作应在 `ready` 后执行。

| 方法 | 参数 / 返回值 | 说明 |
| --- | --- | --- |
| `saveData()` | 返回 String | 获取当前内容；初始化前返回组件保存的内容。仅取值，不负责持久化。 |
| `valid(val, isForm)` | 返回 Boolean | 混入提供的同步表单校验。通常调用 `valid()` 校验当前内容。 |
| `refresh()` | 无 | 重新计算编辑器布局。 |
| `insertText(text)` | `text`: String | 用文本替换当前选区并聚焦；无选区时在光标处插入。只读、禁用、未初始化或文本为空时不执行。 |
| `revealPosition(position)` | 定位对象 | 设置光标、居中滚动并聚焦，行列从 `1` 开始。 |
| `revealMarker(marker)` | 诊断对象 | 调用 `revealPosition()`，用于定位诊断。 |

定位对象支持 `line`、`lineNumber`、`startLine`、`startLineNumber`（按此顺序取首个真值）以及 `column`、`startColumn`。缺省为第 `1` 行第 `1` 列，数值应为有效正整数。

`validateList` 中的规则按 `trigger` 在 change 或 blur 时自动校验，也可在提交前手动调用 `valid()`。`isReadOnly` 仅控制编辑权限，不跳过表单校验；`readonly` 和 `disabled` 会跳过规则校验。Monaco 语法诊断、`markerList` 与表单校验是独立的，`valid()` 不检查编辑器的诊断结果。

## 诊断标记

通过 `markerList` 将后端检查结果显示在编辑器中，点击业务诊断列表时可调用 `revealMarker()` 定位：

```vue
<TsMonacoEditor
  ref="editor"
  v-model="source"
  codeMode="json"
  :markerList="diagnostics"
  markerOwner="config-check"
/>
```

```js
// 在父组件的 data() 中声明 diagnostics，收到检查结果后赋值。
this.diagnostics = [
  {
    severity: 'warning',
    message: '请检查该字段的取值',
    code: 'INVALID_FIELD',
    line: 2,
    column: 3,
    endLine: 2,
    endColumn: 8
  }
];
this.$refs.editor.revealMarker(this.diagnostics[0]);
```

| 字段 | 说明 |
| --- | --- |
| `severity` | 支持 Monaco 数字枚举值，或小写字符串 `'warning'`、`'info'`；其他情况默认 Error。 |
| `level` | 兼容 `'warning'`、`'info'`；数字 `severity` 优先，否则任一字段匹配 warning 时优先使用 Warning。 |
| `message` | 提示文本，空值时回退到 `code`，再回退到 `''`。 |
| `code` | 可选诊断编码。 |
| `line` / `lineNumber` / `startLine` / `startLineNumber` | 起始行，按此顺序取首个真值，默认 `1`。 |
| `column` / `startColumn` | 起始列，默认 `1`。 |
| `endLine` / `endLineNumber` | 结束行，默认起始行，不小于起始行。 |
| `endColumn` | 结束列，默认起始列加 `1`；实现会保证至少为起始列加 `1`。 |

行列从 `1` 开始。每次更新列表都会替换当前模型、当前 owner 的全部标记，传入 `[]` 可清空。切换模型时会将当前 `markerList` 应用到新模型，父组件应同步切换对应诊断列表。

## 业务语言扩展

`languageExtension` 的函数接收一个上下文对象，接口如下：

| 字段 | 上下文 / 返回值 |
| --- | --- |
| `registerLanguage` | `({ monaco, language })`，注册语言、词法和语言配置。会重复调用，业务实现需保证幂等。 |
| `triggerCharacters` | String 数组，例如 `['.']`，用于补全 Provider 和输入后的主动补全。 |
| `provideCompletionItems` | `({ monaco, model, position, context, token })`，返回 Monaco CompletionList 或其 Promise。 |
| `provideHover` | `({ monaco, model, position, token })`，返回 Monaco Hover、`null` 或其 Promise。 |
| `provideFoldingRanges` | `({ monaco, model, context, token })`，返回折叠范围数组或其 Promise。 |
| `setup` | `({ monaco, model, editor })`，执行额外初始化；可返回包含 `dispose()` 的对象，用于清理监听和资源。 |

以下扩展示例可直接传给 JavaScript 编辑器的 `languageExtension` 属性：

```js
const languageExtension = {
  triggerCharacters: ['.'],
  provideCompletionItems({ monaco, model, position }) {
    const word = model.getWordUntilPosition(position);
    return {
      suggestions: [
        {
          label: 'context',
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: 'context',
          documentation: '业务上下文',
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          }
        }
      ]
    };
  }
};
```

补全、悬浮和折叠 Provider 虽然注册在语言上，但组件会过滤模型，仅处理当前实例正在编辑的模型。切换语言、模型或更新扩展时，会先释放旧 Provider 和 `setup()` 返回的资源，再注册扩展；`registerLanguage()` 注册的全局语言定义需由业务自行管理。

## 模型与资源管理

`modelUri` 为空时生成 `inmemory://ts-monaco/<组件 uid>/model.<语言扩展名>`。需要在同一个组件内切换多个文件时，为每个资源指定稳定且唯一的 URI，例如 `inmemory://config-editor/resource-123.json`，并同步更新 `value`、`codeMode` 和 `markerList`。

组件按 URI 缓存模型，切换前保存光标和滚动等视图状态，切回时恢复。不同模型有独立撤销栈，但通过外部 `value` 或切回模型时传入不同内容，会调用 `model.setValue()`，重置该模型的撤销历史；因此父组件仍需保存每个资源的最新内容。

不要让多个组件实例使用同一个 URI：实现会复用 Monaco 全局已存在的模型，且组件销毁时会释放其缓存中的所有模型。销毁时也会清理编辑器、尺寸监听、事件、业务 Provider 和对应诊断。缓存只在组件存活期间有效。

Worker 路由由 [monaco-loader.js](./monaco-loader.js) 配置，分别处理 JavaScript/TypeScript、JSON、HTML/FreeMarker 和通用编辑器 Worker，并保留其他模块已有的 Worker 回退逻辑。业务页面无需重复配置 `MonacoEnvironment`；迁移到其他构建环境时需同时保留当前目录的 Worker 入口，并支持 `new Worker(new URL(..., import.meta.url), { type: 'module' })` 和 `ResizeObserver`。

# TsCkeditor

基于 CKEditor 5 ClassicEditor 封装的 Vue 2 富文本组件，支持 HTML 双向绑定、图片和视频上传、知识选择、`@` 人员选择、只读展示及必填校验。编辑器构建和 Vue 适配器位于当前目录的 `js/` 下。

## 基本使用

```vue
<template>
  <div>
    <TsCkeditor
      ref="editor"
      v-model="content"
      :validateList="['required']"
      :params="editorParams"
      @on-blur="handleBlur"
    />
    <button type="button" @click="submit">保存</button>
  </div>
</template>

<script>
import TsCkeditor from '@/resources/plugins/TsCkeditor/TsCkeditor.vue';

export default {
  components: { TsCkeditor },
  data() {
    return {
      content: '<p>初始内容</p>',
      editorParams: {
        uploadVideoConfig: { type: 'framework' }
      }
    };
  },
  methods: {
    handleBlur(html) {
      // html 为当前富文本 HTML。
    },
    submit() {
      if (!this.$refs.editor.valid()) {
        return;
      }
      // 将 this.content 作为 HTML 字符串提交到业务接口。
    }
  }
};
</script>
```

组件的 `v-model` 使用 `value` 属性和 `change` 事件，也可以显式使用 `:value="content"`、`@change="content = $event"`。清空内容时可将绑定值设为 `''`。

需要全局注册时，在应用入口使用插件入口：

```js
import Vue from 'vue';
import TsCkeditor from '@/resources/plugins/TsCkeditor/TsCkeditor.js';

Vue.use(TsCkeditor);
```

组件依赖项目中的 `$https`、`$t`、`BASEURLPREFIX`、`BASELANGUAGES` 及现有样式、指令环境。语言随 `BASELANGUAGES` 初始化：`zh` 使用 `zh-cn`，其他值使用 `en-gb`。

## 属性

以下列出组件直接使用的属性；虽然混入了 `formMixins`，但并非所有通用表单属性都在此组件中生效。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | String | `''` | 富文本 HTML，支持 `v-model`。 |
| `width` | String | `'100%'` | 编辑模式外层宽度，例如 `'600px'`、`'100%'`。 |
| `readonly` | Boolean | `false` | 直接展示 HTML，不创建编辑器；空内容显示 `-`，图片支持预览。 |
| `disabled` | Boolean | `false` | 保留编辑器界面，禁止编辑。 |
| `readonlyTextIsHighlight` | Boolean | `false` | 只读内容使用 `text-warning` 样式。 |
| `showIconToggle` | Boolean | `false` | 显示工具栏展开/收起按钮；为 `true` 时初始收起工具栏。 |
| `placeholder` | String | `''` | 传给内部 `<ckeditor>` 的占位文案；当前封装未将其写入 `editorConfig.placeholder`，实际显示需结合适配器实现确认。 |
| `toolbar` | Array | `[]` | 追加到基础工具栏末尾的项目，并非替换基础工具栏。 |
| `removePlugins` | Array | `[]` | 移除的插件名称，区分大小写，例如 `['UploadVideo']`。 |
| `params` | Object | 未配置 | 扩展配置，支持 `uploadVideoConfig`、`mentionConfig`，详见下文。 |
| `validateList` | Array | 未配置 | 当前仅在首项为字符串 `'required'` 时执行非空校验。 |
| `errorMessage` | String | 未配置 | 外部错误文案，值变化时更新提示；后续组件校验可能覆盖该提示。 |
| `desc` | String | 未配置 | 编辑模式下的说明文字。 |
| `descType` | String | 未配置 | 不设置时使用普通提示样式；可设置 `info`、`success`、`warning`、`error`，使用 `Alert` 展示。 |
| `onChange` | Function | 未配置 | 内容变化回调，参数为当前 HTML。通常使用 `@change` 即可。 |

`toolbar`、`removePlugins`、上传配置和编辑器级的 mention 配置在组件创建时生成，未监听变化。需要重新应用这些配置时，可通过改变组件的 `key` 重建编辑器。mention 请求所用的筛选配置会在每次搜索时从 `params.mentionConfig` 读取。

## 事件、方法与插槽

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `ready` | 无 | 内部编辑器就绪；此封装不透传编辑器实例。只读模式不触发。 |
| `change` | `html: String` | 内容变化，同时用于 `v-model`。 |
| `changeVal` | `html: String` | 内容变化，与 `change` 同时触发。 |
| `on-change` | `html: String` | 内容变化，与 `change` 同时触发。 |
| `on-blur` | `html: String` | 编辑器失焦，触发前先执行校验。 |

`currentValue` 变化时会触发上述变化事件，包括外部 `value` 更新引起的变化。业务中通常选择一个变化事件监听，避免重复处理。

- `this.$refs.editor.valid()`：执行校验并更新提示，返回 Boolean。当前只判断 HTML 字符串是否为空，且仅识别 `validateList[0] === 'required'`；不会解析 HTML 判断是否只有空白，也不执行其他通用表单校验规则。
- `this.$refs.editor.toggleIcon()`：切换工具栏展开/收起状态。
- `validMessage` 具名插槽：替换默认错误提示区域，无插槽参数，仅在编辑模式渲染。

```vue
<TsCkeditor v-model="content">
  <template v-slot:validMessage>
    <span v-if="submitError" class="form-error-tip">{{ submitError }}</span>
  </template>
</TsCkeditor>
```

## 工具栏与插件

基础工具栏包含以下项目，`|` 为分隔符：

```js
[
  'undo', 'redo', '|', 'heading', '|',
  'fontSize', 'fontColor', 'fontBackgroundColor', '|',
  'bold', 'italic', 'strikethrough', 'code', 'link', 'blockQuote', '|',
  'uploadImage', 'uploadVideo', '|', 'insertTable', '|',
  'bulletedList', 'numberedList', 'outdent', 'indent', '|'
]
```

追加知识选择按钮：

```vue
<TsCkeditor v-model="content" :toolbar="['knowledgeSelect']" />
```

知识选择使用 `BASEURLPREFIX + '/api/rest/knowledge/document/search'`，固定查询参数为 `{ knowledgeType: 'all', statusList: ['passed'], type: 'document' }`，读取 `dataList` 中的 `title`、`knowledgeDocumentId`，跳转地址为 `BASEURLPREFIX + '/knowledge.html#/knowledge-detail'`，携带 `knowledgeDocumentId` 参数。

移除视频上传插件：

```vue
<TsCkeditor v-model="content" :removePlugins="['UploadVideo']" />
```

工具栏名称 `uploadVideo` 与插件名称 `UploadVideo` 不同。追加工具栏项目只能引用当前编辑器构建已包含的功能；`removePlugins` 不会同步修改基础工具栏数组，移除插件时应留意对应按钮是否仍可用及控制台提示。

## 图片与视频上传

图片上传地址固定为 `BASEURLPREFIX + '/api/binary/image/upload'`，视频上传地址固定为 `BASEURLPREFIX + '/api/binary/file/upload'`。当前组件未暴露上传地址覆盖属性。

通过 `params.uploadVideoConfig` 设置视频上传参数：

```vue
<TsCkeditor
  v-model="content"
  :params="{
    uploadVideoConfig: {
      type: 'framework',
      fileKey: 'file',
      uniqueKey: 'document-video',
      formatList: ['mp4', 'webm']
    }
  }"
/>
```

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `type` | `''` | 后端文件分类或模块标识。 |
| `fileKey` | `'file'` | 上传文件对应的表单字段名称。 |
| `uniqueKey` | `''` | 非空时标识附件名唯一，相同名称的附件仅保留最新版本，具体行为由后端处理。 |
| `formatList` | 见下方 | 允许的视频扩展名列表，不带点。 |
| 其他字段 | 无 | 除上述字段外的配置会合并到视频上传请求参数中。 |

默认 `formatList`：`mp4`、`mkv`、`avi`、`mov`、`webm`、`flv`、`f4v`、`mpg`、`mpeg`、`ts`、`m2ts`、`mts`、`wmv`、`rm`、`rmvb`、`3pg`、`3g2`。其中 `3pg` 为当前源码中的配置值；允许上传的格式不代表所有浏览器都能播放。

## @ 人员选择

默认输入 `@` 即可触发搜索（`minimumCharacters: 0`），通过 `$https.post` 请求 `/api/rest/user/role/team/search`，默认参数为：

```js
{
  keyword: '', // @ 后输入的文本
  currentPage: 1,
  pageSize: 10,
  groupList: ['user']
}
```

使用项目成员范围筛选的示例：

```js
const editorParams = {
  uploadVideoConfig: { type: 'rdm' },
  mentionConfig: {
    rangeList: ['user#10001', 'user#10002'],
    extendCondition: { projectId: '项目 ID' }
  }
};
```

将上述对象传给组件的 `:params="editorParams"`。筛选字段的实际含义和取值以对应后端接口为准。

| `mentionConfig` 配置项 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `url` | String / `'/api/rest/user/role/team/search'` | 搜索接口，使用 POST。 |
| `params` | Object 或 Function / 未配置 | 附加请求参数；函数接收搜索文本并返回参数对象。 |
| `groupList` | Array / 默认接口使用 `['user']` | 搜索分组。 |
| `excludeList` | Array / 未配置 | 透传排除列表。 |
| `includeList` | Array / 未配置 | 透传包含列表。 |
| `rangeList` | Array / 未配置 | 透传范围列表，空数组也会传给后端。 |
| `extendCondition` | Object / 未配置 | 最后合并到请求参数的附加条件，可覆盖同名字段。 |
| `rootName` | String / `'dataList'` | 对象响应中列表字段名，相对于 `res.Return`，仅支持直接字段。 |
| `textName` | String / `'text'` | 候选项显示名称字段。 |
| `valueName` | String / `'value'` | 候选项标识字段。 |

请求参数按“默认参数 → `params` → 顶层筛选字段 → `extendCondition`”顺序合并。使用其他 URL 时，默认参数改为 `{ keyword, currentPage: 1, pageSize: 10, isActive: 1, isDelete: 0 }`，不会自动添加 `groupList`。

响应支持以下结构：

```js
// 默认接口：res.Return 为分组数组，合并各组的 dataList。
{ Return: [{ dataList: [{ text: '张三', value: 'user#10001' }] }] }

// 自定义接口：res.Return 为列表数组。
{ Return: [{ text: '张三', value: '10001' }] }

// 对象结构：读取 res.Return[rootName]，默认 dataList。
{ Return: { dataList: [{ text: '张三', value: '10001' }] } }
```

候选项会转换为 `{ id: '@名称', userId, name, user: 原始对象 }`，无显示名称的记录会被过滤；标识为含 `#` 的字符串时，`userId` 取第一个 `#` 后的部分。该对象用于编辑器候选项，组件的变化事件仍只返回 HTML。

自定义响应字段和动态参数：

```js
const editorParams = {
  mentionConfig: {
    url: '/api/rest/example/user/search', // 替换为实际业务接口
    params: keyword => ({ keyword, pageSize: 20 }),
    rootName: 'users',
    textName: 'userName',
    valueName: 'userId'
  }
};
// 对应响应：{ Return: { users: [{ userName: '张三', userId: '10001' }] } }
```

上述搜索专用字段不会直接传给 CKEditor；其余字段会合并到 CKEditor 的 `mention` 配置中，例如 `dropdownLimit`、`feeds`。配置 `feeds` 会替换组件默认的 feed，此时需自行处理候选项来源。

## 只读展示

```vue
<TsCkeditor :value="content" readonly :readonlyTextIsHighlight="true" />
```

只读模式通过 `v-html` 展示内容，保留 `ck-content` 样式并启用图片预览。说明文字、校验提示和工具栏按钮仅在编辑模式显示。编辑区域默认最小高度为 `130px`，组件未提供独立的高度属性。

## 维护地址

组件的版本升级或新增组件均需通过以下维护地址进行。完成后，将组件打包为 JS 文件，并将生成的文件复制到 `neatlogic-web` 项目的 `TsCkeditor` 组件目录下。

[维护地址](https://lqnnbz38z5y.feishu.cn/wiki/EDdNwhdMSivGt0kEloKcKxNMng5?from=from_copylink)

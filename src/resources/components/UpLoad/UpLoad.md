# UpLoad 组件说明文档

## 组件介绍

UpLoad 是一个功能强大的文件上传组件，基于 Vue 开发，支持多种上传方式和配置选项。

## 主要功能

- 支持拖拽上传和选择上传
- 支持多文件上传
- 支持文件格式限制
- 支持文件大小限制
- 支持从剪贴板获取截图
- 支持文件预览
- 支持文件下载
- 支持文件删除
- 支持只读模式
- 支持禁用状态


## 基本使用

### 安装与引入

```javascript
<template>
  <TsUpLoad :defaultList="defaultFileList" :multiple="true" @getFileList="handleGetFileList"></TsUpLoad>
</template>

export default {
  data() {
    return {
      defaultFileList: [
        { id: 1, name: 'example.pdf' }
      ]
    }
  },
  components: {
   TsUpLoad: () => import('@/resources/components/UpLoad/UpLoad.vue')
  },
}
```

### 带默认文件列表

```vue

<TsUpLoad
  :defaultList="[{ id: 1, name: 'example.pdf' }]"
  @getFileList="handleGetFileList"
><TsUpLoad>

```

### 从剪贴板获取截图

```vue

<TsUpLoad
  :hasScreenshotFromClipboard="true"
  @getFileList="handleGetFileList"
><TsUpLoad>

```

### 小尺寸上传组件

```vue
<TsUpLoad
  className="smallUpload"
  styleType="button"
  @getFileList="handleGetFileList"
></TsUpLoad>
```

### 拖拽上传

```vue
<TsUpLoad
  type="drag"
  title="拖拽文件到此处上传"
  @getFileList="handleGetFileList"
></TsUpLoad>
```

## 组件参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | String | '' | 上传标题 |
| height | Number | - | 上传区域高度 |
| uniqueKey | String | null | 如果不为空，代表附件名唯一，相同名称的附件只会保留最新的一个 |
| type | String | 'drag' | 上传类型，可选值：'drag'（拖拽）或 'select'（选择） |
| disabled | Boolean | false | 是否禁用 |
| readonly | Boolean | false | 是否只读 |
| multiple | Boolean | false | 是否支持多文件上传 |
| format | Array | [] | 支持的文件类型，例如：['jpg', 'png', 'pdf'] |
| dataType | String | '' | 用于后台文档管理，标识模块或者功能等 |
| dataParam | String | 'file' | 上传参数名 |
| handleFormatError | Function | - | 文件格式错误处理函数 |
| beforeUpload | Function | - | 上传前回调函数 |
| maxsize | Number | 0 | 文件大小限制（字节） |
| defaultList | Array | [] | 默认文件列表 |
| styleType | String | '' | 样式类型，可选值：'button' 或 'text' |
| className | String | '' | 自定义类名，例如：'smallUpload' |
| rowSpan | [String, Number] | '24' | 文件列表每行显示的列数 |
| isSumbit | Boolean | true | 是否立即提交文件，设置为false后只会返回一堆文件内容 |
| uploadCount | Number | 0 | 上传文件数量限制 |
| params | Object | {} | 额外参数 |
| silent | Boolean | false | 静默模式不提示任何信息 |
| disabledTitle | String | '' | 禁用时，鼠标上移显示title |
| rowStyle | Object | {} | TsRow 自定义行内样式 |
| fileDownurl | String | '/api/binary/file/download' | 文件下载路径 |
| fileDownParam | Object | null | 文件下载参数 |
| isDeleteRemote | Boolean | false | 删除附件时是否同时删除远程文件 |
| readonlyTextIsHighlight | Boolean | false | 只读模式下，文件列表是否需要高亮显示 |
| hasScreenshotFromClipboard | Boolean | false | 是否从剪切板获取截图 |

## 组件事件

| 事件名 | 说明 | 参数 |
|-------|------|------|
| getFileList | 上传成功后触发 | fileList: 文件列表, fileId: 上传的文件ID |
| remove | 删除文件后触发 | fileList: 文件列表, fileId: 删除的文件ID |

## 组件方法

| 方法名 | 说明 | 参数 |
|-------|------|------|
| handleClearFiles | 清除上传文件列表 | 无 |


## 注意事项

1. 组件默认使用 `/api/binary/file/upload` 作为上传接口，请确保该接口存在且可用。
2. 组件默认使用 `/api/binary/file/download` 作为下载接口，请确保该接口存在且可用。
3. 当设置 `isDeleteRemote` 为 `true` 时，删除文件会调用 `/api/framework/file/deleteFile` 接口，请确保该接口存在且可用。
4. 当 `defaultList` 中包含数字类型的文件ID时，会调用 `/api/framework/file/getFileByIdList` 接口获取文件信息，请确保该接口存在且可用。
5. 组件支持国际化，使用 `$t` 方法获取国际化文本。

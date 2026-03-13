# UploadDialog 组件说明文档

## 组件介绍

UploadDialog 是一个基于对话框的文件上传组件，基于 Vue 开发，支持多种上传方式和配置选项，适用于需要在对话框中进行文件上传的场景。

## 主要功能

- 支持拖拽上传文件
- 支持多文件上传
- 支持文件格式限制
- 支持文件大小限制
- 支持立即上传或手动触发上传
- 支持上传进度显示
- 支持上传结果校验和展示
- 支持自定义上传前处理函数
- 支持国际化

## 组件参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | String | '上传附件' | 对话框标题 |
| actionUrl | String | 必填 | 上传接口地址 |
| name | String | 'file' | 上传的文件字段名 |
| data | Object | {} | 上传时附带的额外参数 |
| dataType | String | 'file' | 数据类型 |
| formatList | Array | [] | 支持的文件格式列表，例如：['jpg', 'png', 'pdf'] |
| maxSize | Number | 0 | 文件大小限制，单位为MB |
| multiple | Boolean | true | 是否支持多文件上传 |
| beforeUpload | Function | null | 自定义的上传前处理函数 |
| immediatelyUpload | Boolean | false | 是否立即上传 |
| showSuccessNotice | Boolean | true | 是否显示上传成功通知 |
| defaultFileList | Array | [] | 默认文件列表 |
| isValid | Boolean | false | 是否需要展示校验信息 |
| successMassage | String | - | 成功显示信息 |
| warnMassage | String | - | 警告信息 |
| btnList | Array | - | 底部按钮数组 |
| btntext | String | - | 按钮文案 |

## 组件事件

| 事件名 | 说明 | 参数 |
|-------|------|------|
| on-close | 对话框关闭时触发 | 无 |
| on-success | 上传成功时触发 | response: 响应数据, uploadFile: 上传的文件信息, fileList: 文件列表 |
| on-remove-file | 删除文件时触发 | file: 删除的文件信息, fileList: 文件列表 |
| on-all-upload | 所有文件上传完成时触发 | 无 |
| goto | 点击跳转按钮时触发 | 无 |

## 组件方法

| 方法名 | 说明 | 参数 |
|-------|------|------|
| showDialog | 显示上传对话框 | 无 |
| hideDialog | 隐藏上传对话框 | 无 |
| okImport | 手动触发上传 | fileList: 文件列表（可选） |

## 使用示例

### 基本使用

```vue
<template>
  <div>
    <Button @click="showUploadDialog">打开上传对话框</Button>
    <UploadDialog
      ref="uploadDialog"
      actionUrl="/api/binary/file/upload"
      :formatList="['jpg', 'png', 'pdf']"
      :maxSize="5"
      @on-success="handleSuccess"
    />
  </div>
</template>

<script>
export default {
  methods: {
    showUploadDialog() {
      this.$refs.uploadDialog.showDialog();
    },
    handleSuccess(response, uploadFile, fileList) {
      console.log('上传成功', response, uploadFile, fileList);
    }
  }
};
</script>
```

### 带自定义参数和校验

```vue
<template>
  <div>
    <Button @click="showUploadDialog">打开上传对话框</Button>
    <UploadDialog
      ref="uploadDialog"
      actionUrl="/api/binary/file/upload"
      :data="{ type: 'document', module: 'process' }"
      :formatList="['xlsx', 'xls', 'csv']"
      :maxSize="10"
      :isValid="true"
      @on-success="handleSuccess"
    />
  </div>
</template>

<script>
export default {
  methods: {
    showUploadDialog() {
      this.$refs.uploadDialog.showDialog();
    },
    handleSuccess(response, uploadFile, fileList) {
      console.log('上传成功', response, uploadFile, fileList);
    }
  }
};
</script>
```

### 立即上传模式

```vue
<template>
  <div>
    <Button @click="showUploadDialog">打开上传对话框</Button>
    <UploadDialog
      ref="uploadDialog"
      actionUrl="/api/binary/file/upload"
      :immediatelyUpload="true"
      @on-success="handleSuccess"
    />
  </div>
</template>

<script>
export default {
  methods: {
    showUploadDialog() {
      this.$refs.uploadDialog.showDialog();
    },
    handleSuccess(response, uploadFile, fileList) {
      console.log('上传成功', response, uploadFile, fileList);
    }
  }
};
</script>
```

### 单文件上传

```vue
<template>
  <div>
    <Button @click="showUploadDialog">打开上传对话框</Button>
    <UploadDialog
      ref="uploadDialog"
      actionUrl="/api/binary/file/upload"
      :multiple="false"
      @on-success="handleSuccess"
    />
  </div>
</template>

<script>
export default {
  methods: {
    showUploadDialog() {
      this.$refs.uploadDialog.showDialog();
    },
    handleSuccess(response, uploadFile, fileList) {
      console.log('上传成功', response, uploadFile, fileList);
    }
  }
};
</script>
```

## 注意事项

1. 组件必须设置 `actionUrl` 参数，指定上传接口地址。
2. 组件默认使用 `file` 作为上传的文件字段名，可通过 `name` 参数修改。
3. 当设置 `isValid` 为 `true` 时，组件会展示上传结果的校验信息。
4. 当设置 `immediatelyUpload` 为 `true` 时，文件会在选择后立即上传；否则需要点击"导入"按钮触发上传。
5. 组件支持国际化，使用 `$t` 方法获取国际化文本。
6. 当上传失败时，组件会显示错误通知。
7. 当上传成功时，组件会显示成功通知（可通过 `showSuccessNotice` 控制）。
8. 组件会自动处理重复文件的情况，避免重复上传同名同大小的文件。
9. 组件会根据 `formatList` 验证文件格式，不符合格式要求的文件会被拒绝上传。
10. 组件会根据 `maxSize` 验证文件大小，超过限制的文件会被拒绝上传。

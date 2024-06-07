## 上传组件，二次弹窗

使用说明描述：
点击选择上传组件，上传数据成功之后，根据后端返回的数据

1. 已存在弹出二次确定覆盖弹窗，确定覆盖后，保存数据。
2. 不存在覆盖，把数据列出来，用户自己选择需要保存的数据，点击确定按钮保存数据

### 使用方法

```vue
<template>
  <span class="tsfont-plus text-action" @click="openDialog">上传</span>
  <ComplexUploadDialog ref="complexUploadDialog" :targeType="targeType" url="/api/binary/deploy/app/pipeline/import" @close="closeComplexUploadDialog"></ComplexUploadDialog>
</template>

<script>
methods: {
  openDialog() {
    this.$refs.complexUploadDialog.showDialog();//打开弹窗
  },
  closeComplexUploadDialog(needRefresh) {
    if(needRefresh) {
      // 刷新数据，接口请求
    }
  }
}
</script>
```

## 上传组件，二次弹窗

使用说明描述：
点击选择上传组件，上传数据成功之后，出现二次弹窗，二次弹窗选择好内容后，点击保存。

### 使用方法

```vue
  <ComplexUploadDialog
      v-if="isShowComplexUploadDialog"
      :id="id"
      url="/api/binary/deploy/app/pipeline/import"
      @close="() => isShowComplexUploadDialog = false"
    ></ComplexUploadDialog>
```

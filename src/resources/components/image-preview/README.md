## 图片预览和附件下载功能

### 使用方法
1. 文件列表字段名： 默认情况下，文件列表中的名称字段使用name作为key，ID字段使用id作为key。如需更改，您可以通过fileName和idName这两个参数来自定义名称和ID的字段key。
2. 文件下载与预览URL： 默认情况下，文件下载和预览的URL为/api/binary/file/download。若需调整，您可以通过fileDownloadUrl参数来指定自定义的下载URL。

```vue
<template>
<ImagePreview :fileList="fileList"></ImagePreview>
</template>
<script>
export default {
  components: {
    ImagePreview: ()=>import('@/resources/components/image-preview/index.vue');
  },
  data(){
    return {
      fileList: [
        {
          name: 'bule-cat.png',
          id: '1204185450160128'
        }
      ]
    }
  }
}
</script>
```

### 参数说明
| 参数名称 | 参数说明 | 默认值 |
|-------|-------|-------|
| fileList | 文件列表 | 格式说明：[{name: '测试图片.jpg', id: 'dhskhdskdh23232323'}] |
| zIndex | 图片的层级 | 默认：2000 | 
| initialIndex | 默认展示图片的索引 | 无|
| isShow | 是否显示预览图片组件 | 默认为：false，不展示
|fileDownloadParam| 文件下载额外参数 | 默认为：空对象|
|fileDownloadUrl | 文件下载和文件预览地址|默认为：/api/binary/file/download|
|fileName| 文件名称的key|默认为：name|
|idName | 文件id的key|默认为：id|
|isShowName|是否需要显示文件名称|默认是：true

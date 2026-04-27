## 图片预览和附件下载组件

### 组件描述

ImagePreview 是一个功能强大的图片和视频预览组件，支持文件下载、多文件切换、图片缩放、旋转、拖拽等丰富的交互功能。组件可以智能识别图片和视频文件，提供统一的预览体验。

### 功能特性

1. **多媒体预览**：支持图片和视频文件的预览
2. **文件下载**：提供文件下载功能，支持下载状态显示
3. **多文件切换**：支持上一张/下一张切换，支持循环播放
4. **图片操作**：
   - 缩放（放大/缩小）
   - 旋转（左旋转/右旋转）
   - 拖拽移动
   - 适配模式切换（适应屏幕/原始尺寸）
5. **键盘快捷键**：
   - ESC：关闭预览
   - 空格：切换适配模式
   - 左/右方向键：切换图片
   - 上/下方向键：缩放图片
6. **鼠标交互**：
   - 滚轮：缩放图片
   - 拖拽：移动图片
   - 点击遮罩：关闭预览（可配置）
7. **灵活配置**：支持自定义字段名、下载URL、层级等

### Props

| 参数 | 说明 | 类型 | 默认值 | 必填 |
|------|------|------|--------|------|
| fileList | 文件列表，包含文件名和ID | Array | [] | 是 |
| zIndex | 预览弹窗的层级 | Number | 2000 | 否 |
| initialIndex | 初始显示的文件索引 | Number | 0 | 否 |
| isShow | 是否直接显示预览弹窗 | Boolean | false | 否 |
| fileDownloadParam | 文件下载的额外参数 | Object | {} | 否 |
| fileDownloadUrl | 文件下载和预览的URL | String | '/api/binary/file/download' | 否 |
| fileName | 文件名称的字段名 | String | 'name' | 否 |
| idName | 文件ID的字段名 | String | 'id' | 否 |
| isShowName | 是否显示文件名称 | Boolean | true | 否 |
| fit | 图片适配模式，可选值：'none'、'contain'、'cover'、'fill'、'scale-down' | String | - | 否 |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| close | 预览弹窗关闭事件 | - |

### 使用示例

#### 基础使用

```vue
<template>
  <div>
    <ImagePreview :fileList="fileList" />
  </div>
</template>

<script>
export default {
  components: {
    ImagePreview: () => import('@/resources/components/image-preview/index.vue')
  },
  data() {
    return {
      fileList: [
        {
          name: '示例图片.jpg',
          id: '1204185450160128'
        }
      ]
    };
  }
};
</script>
```

#### 多文件预览

```vue
<template>
  <div>
    <ImagePreview :fileList="fileList" />
  </div>
</template>

<script>
export default {
  components: {
    ImagePreview: () => import('@/resources/components/image-preview/index.vue')
  },
  data() {
    return {
      fileList: [
        {
          name: '风景1.jpg',
          id: '1204185450160128'
        },
        {
          name: '风景2.jpg',
          id: '1204185450160129'
        },
        {
          name: '风景3.jpg',
          id: '1204185450160130'
        },
        {
          name: '演示视频.mp4',
          id: '1204185450160131'
        }
      ]
    };
  }
};
</script>
```

#### 自定义字段名和下载URL

```vue
<template>
  <div>
    <ImagePreview
      :fileList="fileList"
      fileName="fileName"
      idName="fileId"
      fileDownloadUrl="/api/custom/download"
      :fileDownloadParam="{ token: 'xxx' }"
    />
  </div>
</template>

<script>
export default {
  components: {
    ImagePreview: () => import('@/resources/components/image-preview/index.vue')
  },
  data() {
    return {
      fileList: [
        {
          fileName: '自定义图片.jpg',
          fileId: 'custom001'
        }
      ]
    };
  }
};
</script>
```

#### 控制预览显示

```vue
<template>
  <div>
    <Button @click="showPreview = true">打开预览</Button>
    <ImagePreview
      :fileList="fileList"
      :isShow="showPreview"
      :initialIndex="currentIndex"
      @close="handleClose"
    />
  </div>
</template>

<script>
export default {
  components: {
    ImagePreview: () => import('@/resources/components/image-preview/index.vue')
  },
  data() {
    return {
      showPreview: false,
      currentIndex: 0,
      fileList: [
        {
          name: '图片1.jpg',
          id: '001'
        },
        {
          name: '图片2.jpg',
          id: '002'
        }
      ]
    };
  },
  methods: {
    handleClose() {
      this.showPreview = false;
    }
  }
};
</script>
```

#### 不显示文件名

```vue
<template>
  <div>
    <ImagePreview
      :fileList="fileList"
      :isShowName="false"
    />
  </div>
</template>

<script>
export default {
  components: {
    ImagePreview: () => import('@/resources/components/image-preview/index.vue')
  },
  data() {
    return {
      fileList: [
        {
          name: '图片.jpg',
          id: '001'
        }
      ]
    };
  }
};
</script>
```

### 文件列表格式

fileList 是一个数组，每个元素代表一个文件，必须包含以下字段：

```javascript
[
  {
    name: '文件名.jpg',  // 文件名称，字段名可通过 fileName 参数自定义
    id: '文件ID'        // 文件ID，字段名可通过 idName 参数自定义
  }
]
```

**示例**：

```javascript
fileList: [
  {
    name: '风景.jpg',
    id: '1234567890'
  },
  {
    name: '人物.png',
    id: '0987654321'
  },
  {
    name: '视频.mp4',
    id: '1122334455'
  }
]
```

### 交互说明

#### 图片/视频预览

1. **打开预览**：点击文件列表中的眼睛图标（仅图片和视频显示）
2. **关闭预览**：点击关闭按钮或按 ESC 键
3. **切换文件**：点击左右箭头按钮或按左右方向键
4. **缩放图片**：
   - 点击放大/缩小按钮
   - 按上/下方向键
   - 使用鼠标滚轮
5. **旋转图片**：点击左旋转/右旋转按钮
6. **拖拽图片**：按住鼠标左键拖动图片
7. **切换适配模式**：点击适配模式按钮或按空格键
   - 适应屏幕：图片适应屏幕大小显示
   - 原始尺寸：图片按原始尺寸显示

#### 文件下载

1. **下载文件**：点击文件列表中的下载图标
2. **下载状态**：
   - 下载中显示加载动画
   - 下载完成后恢复下载图标

### 键盘快捷键

| 按键 | 功能 |
|------|------|
| ESC | 关闭预览 |
| 空格 | 切换适配模式（适应屏幕/原始尺寸） |
| ← | 上一张 |
| → | 下一张 |
| ↑ | 放大 |
| ↓ | 缩小 |

### 样式说明

组件使用了 scoped 样式，主要样式类：

- `.image-preview-box`: 主容器样式
- `.image-preview-box-viewer-wrapper`: 预览弹窗包装器
- `.image-preview-box-viewer-mask`: 遮罩层
- `.image-preview-box-viewer-btn`: 按钮样式
- `.image-preview-box-viewer-canvas`: 画布容器
- `.image-preview-box-viewer__img`: 图片/视频样式

### 注意事项

1. **文件识别**：组件会自动识别图片和视频文件，其他文件只显示下载按钮
2. **下载URL**：默认下载URL为 `/api/binary/file/download?id={id}`，可通过 `fileDownloadUrl` 参数自定义
3. **下载参数**：可通过 `fileDownloadParam` 添加额外的下载参数
4. **字段名自定义**：如果文件列表的字段名不是 `name` 和 `id`，需要通过 `fileName` 和 `idName` 参数指定
5. **层级控制**：默认层级为 2000，可通过 `zIndex` 参数调整
6. **性能考虑**：大量文件时建议分页加载，避免一次性加载过多文件
7. **国际化**：组件使用了 `$t()` 方法进行国际化处理，确保项目已配置国际化
8. **视频支持**：支持常见视频格式（mp4、webm、ogg等），需要在模板中添加 controls 属性

### 适用场景

1. **图片列表**：展示图片列表，支持预览和下载
2. **附件管理**：管理附件文件，支持预览和下载
3. **相册功能**：实现相册浏览功能
4. **文件展示**：在详情页展示文件列表
5. **媒体库**：实现媒体库的预览和管理功能

### 依赖组件

- Icon：ViewUI 的 Icon 组件
- download：自定义下载指令

### 扩展功能

组件内部使用了以下工具函数：

- `rafThrottle`: 使用 requestAnimationFrame 实现节流
- `isFirefox`: 判断是否为 Firefox 浏览器
- `on/off`: 事件监听和移除
- `PopupManager`: 弹窗层级管理器
### 兼容性说明

1. 组件在通过 `isShow` 受控打开后，如果父组件再把它切回 `false`，会同步关闭预览并恢复页面滚动状态。
2. 组件销毁时会兜底恢复 `body` 的 `overflow`，避免预览异常销毁后页面残留不可滚动状态。
3. 预览器销毁时会清理键盘、滚轮和拖拽相关的全局监听，避免多次打开关闭后出现重复响应。

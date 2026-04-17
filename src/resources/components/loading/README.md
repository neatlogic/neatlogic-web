# Loading 组件使用说明

本目录包含两个加载组件：`Loading` 和 `CircleLoading`。

> **组件注册说明**：
> - `Loading` 组件已在 `src/resources/base.js` 中全局注册，使用时无需单独引入
> - `CircleLoading` 组件需要按需引入使用

## Loading 组件

基于 iView Spin 组件封装的加载组件，支持全屏和局部加载。

### 基本用法

```vue
<template>
  <Loading :loadingShow="isLoading" text="加载中..." />
</template>

<script>

export default {
  components: {},
  data() {
    return {
      isLoading: false
    };
  }
};
</script>
```

### Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| type | 加载类型 | String | `fix` / `''` | `''` |
| loadingShow | 是否显示加载状态 | Boolean | - | `false` |
| text | 加载提示文字 | Boolean / String | - | 国际化的 `page.loadingtip` |

### type 参数说明

- `fix`: 全屏固定定位加载，覆盖整个视口
- `''` (空字符串): 局部加载，在容器内居中显示

### 插槽

支持自定义内容插槽，可以覆盖默认的加载文字：

```vue
<Loading :loadingShow="isLoading">
  <div>自定义加载内容</div>
</Loading>
```

### 使用示例

#### 全屏加载

```vue
<template>
  <div>
    <Loading type="fix" :loadingShow="isLoading" />
    <button @click="loadData">加载数据</button>
  </div>
</template>
```

#### 局部加载

```vue
<template>
  <div style="height: 200px;">
    <Loading :loadingShow="isLoading" />
    <div v-if="!isLoading">
      内容区域
    </div>
  </div>
</template>
```

#### 自定义文字

```vue
<Loading :loadingShow="isLoading" text="正在处理，请稍候..." />
```

#### 使用插槽

```vue
<Loading :loadingShow="isLoading">
  <div class="custom-loading">
    <Icon type="ios-refresh" />
    <span>正在同步数据...</span>
  </div>
</Loading>
```

---

## CircleLoading 组件

自定义的圆形加载动画组件，支持自定义尺寸和颜色。

### 基本用法

```vue
<template>
  <CircleLoading :size="30" color="#2d8cf0" />
</template>

<script>

export default {
  components: {
    CircleLoading: () => import('@/resources/components/loading/CircleLoading.vue')
  }
};
</script>
```

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| size | 圆形加载器的尺寸（像素） | Number | `20` |
| color | 加载器颜色 | String | 主题色（支持亮色/暗色主题） |

### 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| mouseenter | 鼠标移入事件 | - |
| mouseleave | 鼠标移出事件 | - |

### 使用示例

#### 基础用法

```vue
<template>
  <CircleLoading />
</template>
```

#### 自定义尺寸

```vue
<template>
  <CircleLoading :size="40" />
</template>
```

#### 自定义颜色

```vue
<template>
  <CircleLoading color="#ff0000" />
</template>
```

#### 监听鼠标事件

```vue
<template>
  <CircleLoading 
    @mouseenter="handleMouseEnter" 
    @mouseleave="handleMouseLeave" 
  />
</template>

<script>
export default {
  methods: {
    handleMouseEnter() {
      console.log('鼠标移入');
    },
    handleMouseLeave() {
      console.log('鼠标移出');
    }
  }
};
</script>
```

---

## 注意事项

1. **Loading 组件**依赖 iView 的 `Spin` 和 `Icon` 组件，确保项目中已安装 iView
2. **CircleLoading 组件**使用主题变量，支持亮色和暗色主题切换
3. 使用 `type="fix"` 时，加载层会覆盖整个视口，适合页面级加载
4. 使用默认 `type` 时，加载层会在父容器内居中显示，适合局部加载
5. `text` 属性支持布尔值和字符串，设置为 `false` 时不显示文字

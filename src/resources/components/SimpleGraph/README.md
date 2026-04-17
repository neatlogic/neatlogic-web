# Liquid 组件使用说明

## 组件简介

Liquid 是一个多形态的液体/进度显示组件，支持水波纹、圆形进度环和进度条三种展示形式，适用于各种数据可视化场景。

## 基础用法

```vue
<Liquid :percent="50" />
```

## Props 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| size | String \| Number | 'normal' | 组件尺寸，可选值：'large'、'normal'、'small'，或自定义像素值（如 '100px' 或 100） |
| color | String | 'primary' | 组件颜色，可选值：'info'、'primary'、'success'、'warning'、'danger'，或自定义颜色值 |
| percent | Number | - | 百分比值（0-100），不带单位 |
| animate | Boolean | true | 是否启用动画效果 |
| shape | String | 'progress' | 形状类型，可选值：'ripple'（水波纹）、'circle'（圆形）、'progress'（进度条） |
| showText | Boolean | false | 是否显示百分比文本（仅水波纹模式有效） |
| config | Object | {} | 额外配置对象，根据不同 shape 有不同用途 |

## 使用示例

### 1. 水波纹效果（ripple）

```vue
<!-- 基础水波纹 -->
<Liquid :percent="60" shape="ripple" />

<!-- 显示百分比文本 -->
<Liquid :percent="75" shape="ripple" :show-text="true" />

<!-- 不同尺寸 -->
<Liquid :percent="50" shape="ripple" size="large" />
<Liquid :percent="50" shape="ripple" size="small" />

<!-- 自定义尺寸（像素值） -->
<Liquid :percent="50" shape="ripple" size="120" />

<!-- 不同颜色 -->
<Liquid :percent="50" shape="ripple" color="success" />
<Liquid :percent="50" shape="ripple" color="#ff6600" />

<!-- 关闭动画 -->
<Liquid :percent="50" shape="ripple" :animate="false" />
```

### 2. 圆形进度环（circle）

```vue
<!-- 基础圆形进度 -->
<Liquid :percent="80" shape="circle" />

<!-- 不同尺寸 -->
<Liquid :percent="60" shape="circle" :size="120" />

<!-- 使用 config 配置图标和颜色 -->
<Liquid 
  :percent="70" 
  shape="circle" 
  :config="{
    'stroke-color': '#19be6b',
    icon: 'ivu-icon ivu-icon-ios-checkmark'
  }" 
/>
```

### 3. 进度条（progress）

```vue
<!-- 基础进度条 -->
<Liquid :percent="45" shape="progress" />

<!-- 不同粗细 -->
<Liquid :percent="60" shape="progress" :size="8" />

<!-- 使用 config 配置状态 -->
<Liquid :percent="100" shape="progress" :config="{ status: 'success' }" />
<Liquid :percent="60" shape="progress" :config="{ status: 'active' }" />
<Liquid :percent="30" shape="progress" :config="{ status: 'wrong' }" />

<!-- 百分比文本位置 -->
<Liquid :percent="75" shape="progress" :config="{ position: 'left' }" />

<!-- 隐藏百分比文本 -->
<Liquid :percent="50" shape="progress" :config="{ 'hide-info': true }" />
```

## 插槽使用

水波纹模式下支持自定义文本内容：

```vue
<Liquid :percent="85" shape="ripple" :show-text="true">
  <div class="custom-text">
    <span>85%</span>
    <small>完成</small>
  </div>
</Liquid>
```

## 样式说明

### 水波纹模式
- 三层波浪效果，分别使用不同的透明度和动画速度
- 自动根据百分比调整波浪高度
- 当百分比超过 50% 时，文本颜色会自动变浅以保持可读性

### 圆形模式
- 基于 iView 的 i-circle 组件
- 支持通过 config 传递 i-circle 的所有属性
- 默认轨道颜色为 #F2F4F5

### 进度条模式
- 基于 iView 的 Progress 组件
- 支持通过 config 传递 Progress 的所有属性
- 自动根据百分比设置状态（100% 时为 success）
- 支持左侧显示百分比文本

## 注意事项

1. **percent 属性**：数值范围建议在 0-100 之间，超过 100 会自动限制为 100
2. **size 属性**：当使用自定义像素值时，长宽必须相等
3. **color 属性**：使用自定义颜色值时，需要确保是有效的 CSS 颜色值
4. **animate 属性**：关闭动画后，波浪将静止在当前百分比位置
5. **config 属性**：不同 shape 模式下，config 的作用不同，请参考对应模式的示例

## 完整示例

```vue
<template>
  <div>
    <!-- 水波纹示例 -->
    <div class="demo-section">
      <h3>水波纹效果</h3>
      <Liquid :percent="30" shape="ripple" size="small" />
      <Liquid :percent="50" shape="ripple" />
      <Liquid :percent="70" shape="ripple" size="large" />
      <Liquid :percent="90" shape="ripple" :show-text="true" color="success" />
    </div>

    <!-- 圆形进度示例 -->
    <div class="demo-section">
      <h3>圆形进度环</h3>
      <Liquid :percent="40" shape="circle" :size="80" />
      <Liquid :percent="60" shape="circle" :size="100" />
      <Liquid :percent="80" shape="circle" :size="120" 
        :config="{ 'stroke-color': '#19be6b', icon: 'ivu-icon ivu-icon-ios-checkmark' }" />
    </div>

    <!-- 进度条示例 -->
    <div class="demo-section">
      <h3>进度条</h3>
      <Liquid :percent="25" shape="progress" />
      <Liquid :percent="50" shape="progress" :config="{ status: 'active' }" />
      <Liquid :percent="75" shape="progress" :config="{ position: 'left' }" />
      <Liquid :percent="100" shape="progress" :config="{ status: 'success' }" />
    </div>
  </div>
</template>

<script>
import Liquid from './Liquid.vue';

export default {
  components: {
    Liquid
  }
};
</script>
```

## 依赖组件

- iView（用于 circle 和 progress 模式）
  - i-circle
  - Progress

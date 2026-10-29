# TsResizeHandle

面板分隔处的拖动手柄样式组件，提供分隔线、居中握柄和缩放鼠标指针。默认隐藏分隔线和握柄，鼠标悬停或按下时显示高亮。

组件只负责手柄外观，拖动事件、面板尺寸计算及最小/最大尺寸限制需要由父组件实现。

## 基本用法

```vue
<template>
  <div class="resize-demo">
    <div class="resize-track-vertical">
      <TsResizeHandle />
    </div>
    <div class="resize-track-horizontal">
      <TsResizeHandle direction="horizontal" />
    </div>
  </div>
</template>

<script>
import TsResizeHandle from '@/resources/components/TsResizeHandle/TsResizeHandle.vue';

export default {
  components: { TsResizeHandle }
};
</script>

<style lang="less" scoped>
.resize-demo {
  padding: 16px;
}

.resize-track-vertical {
  position: relative;
  width: 10px;
  height: 240px;
}

.resize-track-horizontal {
  position: relative;
  width: 320px;
  height: 10px;
}
</style>
```

该示例展示两种方向的手柄外观。组件根元素使用 `position: absolute; inset: 0` 铺满定位容器，因此外层容器需要设置定位方式和尺寸；在实际布局中，应将容器放在需要调整大小的面板之间。

## Props

| 参数 | 类型 | 默认值 | 可选值 | 说明 |
| --- | --- | --- | --- | --- |
| `direction` | `String` | `'vertical'` | `vertical`、`horizontal` | 分隔线的方向，决定握柄布局和鼠标指针。 |

### 方向说明

| direction | 分隔线与握柄 | 鼠标指针 | 常见用途 |
| --- | --- | --- | --- |
| `vertical` | 竖向分隔线；握柄宽 8px、高 100px | `col-resize` | 左右面板之间，沿水平方向拖动以调整宽度。 |
| `horizontal` | 横向分隔线；握柄宽 100px、高 8px | `row-resize` | 上下面板之间，沿垂直方向拖动以调整高度。 |

`direction` 表示分隔线方向。例如，`vertical` 对应左右拖动，而非上下拖动。

## 接入拖动逻辑

建议在外层容器监听原生事件，将 TsResizeHandle 作为其中的视觉元素：

```vue
<div class="resize-track-vertical" @mousedown.prevent="startResize">
  <TsResizeHandle direction="vertical" />
</div>
```

父组件中的 `startResize` 需要保存起始鼠标位置和面板尺寸，并监听后续移动与结束事件：

1. 竖向手柄使用 `event.clientX` 的变化量计算面板宽度；横向手柄使用 `event.clientY` 的变化量计算面板高度。
2. 在 `document` 上监听 `mousemove` 和 `mouseup`，使鼠标移出手柄后仍可继续拖动和结束操作。
3. 根据容器空间及业务需求限制尺寸，并将新尺寸应用到目标面板。
4. 在拖动结束及父组件销毁时移除监听器。

组件没有抛出 `resize`、`change` 等自定义事件，也没有公开方法或插槽。在 Vue 2 中如需直接监听组件根元素，可使用 `@mousedown.native`；组件本身没有处理鼠标、触摸或 Pointer Events。

## 样式与使用注意

- 根元素的 `z-index` 为 `1`；外层容器决定手柄位置及命中区域大小。需要更宽的拖动区域时，可增大外层容器的宽度或高度。
- 分隔线宽度或高度固定为 1px，默认透明；悬停和按下时显示分隔线与握柄，透明度过渡时间为 0.2 秒。
- 分隔线基础色使用 `--dividing-color`，回退为 `#e8eaec`；高亮色使用 `--primary-color`，回退为 `#1677ff`。可以在祖先元素上覆盖这些 CSS 变量。
- 握柄背景为 `#f3f3f3`，内部短线为 `silver`，当前未提供对应的颜色参数。
- 根元素设置了 `user-select: none` 和 `touch-action: none`，但触摸拖动仍需父组件接入相应事件。
- 根元素带有 `aria-hidden="true"`，作为视觉装饰使用；需要键盘调整尺寸或无障碍操作时，应由父级交互容器提供相应能力。

# OverflowTooltip

全局文本溢出提示组件。仅当目标元素满足 `scrollWidth > clientWidth` 时显示 Tooltip。

```vue
<OverflowTooltip :content="name" placement="right">
  <span class="overflow">{{ name }}</span>
</OverflowTooltip>
```

- `placement`：提示方向，默认 `top`，支持原 Tooltip 的方向值。
- `transfer`：是否挂载到 `body`，默认 `true`。
- 其他 Tooltip 属性会自动透传。
- 默认检测插槽中的 `.overflow` 元素；特殊结构可在目标元素上添加 `data-overflow-tooltip-target`。

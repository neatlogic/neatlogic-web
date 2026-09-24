# TsActionBar

响应式顶部操作栏组件。空间充足时按配置顺序展示全部操作；空间不足时从尾部开始收纳到“更多”菜单，前面的操作具有更高展示优先级。

组件已在 `src/resources/base.js` 全局注册，页面中可以直接使用，无需单独引入。

## 基本用法

```vue
<template>
  <TsActionBar
    :actionList="topActionList"
    placement="bottom-end"
    @click="handleTopAction"
  >
    <template #fixed>
      <span class="action-item">
        <TsFormSwitch v-model="enabled"></TsFormSwitch>
        <span>{{ enabled ? '关闭拓扑' : '显示拓扑' }}</span>
      </span>
      <span class="action-item">
        <Button type="primary">提交</Button>
      </span>
    </template>
  </TsActionBar>
</template>

<script>
export default {
  data() {
    return {
      enabled: false
    };
  },
  computed: {
    topActionList() {
      return [
        {
          key: 'add',
          text: this.$t('page.add'),
          icon: 'tsfont-plus',
          auth: ['CI_MODIFY']
        },
        {
          key: 'export',
          text: this.$t('page.export'),
          icon: 'tsfont-download',
          disabled: false
        }
      ];
    }
  },
  methods: {
    handleTopAction(action) {
      if (action.key === 'add') {
        this.add();
      } else if (action.key === 'export') {
        this.export();
      }
    }
  }
};
</script>
```

## Props

参数 | 类型 | 默认值 | 说明
---|---|---|---
`actionList` | `Array` | `[]` | 标准操作列表，列表顺序同时代表展示顺序和优先级
`placement` | `String` | `'bottom-end'` | “更多”下拉菜单方向，支持项目 `Dropdown` 的 placement 值
`transfer` | `Boolean` | `true` | 是否将 Tooltip 和下拉菜单挂载到 `body`，用于避免被父容器裁剪

## actionList

字段 | 类型 | 必填 | 说明
---|---|---|---
`key` | `String \| Number` | 是 | 操作唯一标识，同时作为列表渲染和下拉菜单标识，请勿重复
`text` | `String` | 是 | 操作文案，可以使用 `$t()` 生成的国际化文案
`icon` | `String \| Array \| Object` | 否 | 图标或其他样式类，例如 `tsfont-plus`
`auth` | `String \| Array` | 否 | 权限标识；数组语义与项目 `v-auth` 一致，拥有其中任一权限即可展示
`visible` | `Boolean` | 否 | 设置为 `false` 时不展示，也不参与宽度计算
`disabled` | `Boolean` | 否 | 是否禁用；禁用后可见但不会派发 `click` 事件

## Slots

插槽名 | 说明
---|---
`fixed` | 始终展示且不参与收纳的操作组，适合开关、状态组件、主操作按钮等

`fixed` 插槽可以放置一个或多个操作。每个独立操作使用 `.action-item` 包裹，组件会保留各自的间距和分隔线，并将整个固定操作组的实际宽度从可收纳空间中扣除。

```vue
<template #fixed>
  <span class="action-item">固定操作一</span>
  <span class="action-item">固定操作二</span>
</template>
```

## Events

事件名 | 参数 | 说明
---|---|---
`click` | `(action)` | 点击可见操作或“更多”菜单项时触发，返回 `actionList` 中对应的原 action 对象

## 展示与性能规则

- 操作按照 `actionList` 顺序排列，空间不足时优先收纳尾部操作。
- 使用隐藏测量区读取实际渲染宽度，无需按字符长度判断，兼容中文、英文、图标和动态国际化文案。
- 权限不足或 `visible: false` 的操作不会渲染，也不会参与测量。
- 组件使用一个 `ResizeObserver` 监听操作栏和固定区域，重复更新会被合并；不支持 `ResizeObserver` 时降级为单个 `window.resize` 监听。
- 组件销毁时会自动清理观察器或事件监听。
- `fixed` 内容始终保留，应只放置确实不能收纳的复杂操作，避免固定内容占满整个操作栏。

## 推荐用法

- 普通文本操作统一放入 `actionList`，不要在页面中自行判断视口宽度。
- 操作方法继续保留在业务页面，通过 `click` 返回的 `action.key` 调用原有方法。
- 动态图标、动态文案和禁用状态放在计算属性中生成，组件会自动重新测量。
- 不需要监听 `$i18n.locale`；只要 `actionList` 的计算属性中使用 `$t()`，语言切换后组件会随文案变化重新计算。

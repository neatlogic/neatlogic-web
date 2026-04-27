# TsUlList 使用说明

## 组件简介

`TsUlList` 是一个通用列表组件，支持：

- 普通列表
- 树形递归列表
- 单选、多选
- 单选可取消
- 按钮分页
- 滚动到底自动翻页
- 默认行渲染和 slot 自定义渲染

组件内部通过递归子组件 `li-item.vue` 渲染子节点，适合做左侧导航、分类面板、树形选择列表等场景。

## 引入方式

```js
import TsUlList from '@/resources/components/TsUlList/TsUlList.vue';

export default {
  components: {
    TsUlList
  }
};
```

## 基础示例

### 单选列表示例

```vue
<template>
  <TsUlList
    :dataList="list"
    :value="currentId"
    textName="name"
    valueName="id"
    @li-click="handleClick"
  />
</template>

<script>
export default {
  data() {
    return {
      currentId: 2,
      list: [
        { id: 1, name: '应用系统' },
        { id: 2, name: '网络设备' },
        { id: 3, name: '数据库' }
      ]
    };
  },
  methods: {
    handleClick(value) {
      this.currentId = value;
    }
  }
};
</script>
```

### 多选列表示例

```vue
<template>
  <TsUlList
    :dataList="list"
    :value="selectedList"
    :multiple="true"
    textName="name"
    valueName="id"
    @li-click="handleSelect"
  />
</template>

<script>
export default {
  data() {
    return {
      selectedList: [1, 3],
      list: [
        { id: 1, name: 'Linux' },
        { id: 2, name: 'Windows' },
        { id: 3, name: 'AIX' }
      ]
    };
  },
  methods: {
    handleSelect(value) {
      this.selectedList = value;
    }
  }
};
</script>
```

### 树形列表示例

```vue
<template>
  <TsUlList
    :dataList="treeList"
    :value="currentId"
    textName="name"
    valueName="id"
    childName="children"
    :level="true"
    @li-click="handleClick"
  />
</template>
```

### 自定义行内容

```vue
<TsUlList
  :dataList="list"
  :value="currentId"
  textName="name"
  valueName="id"
  @li-click="handleClick"
>
  <template v-slot="{ row }">
    <div class="flex-between">
      <span>{{ row.name }}</span>
      <span class="text-tip">{{ row.count }}</span>
    </div>
  </template>
</TsUlList>
```

### 按钮分页

```vue
<TsUlList
  :dataList="list"
  :currentPage="currentPage"
  :pageCount="pageCount"
  pager="button"
  @updatePage="getPage"
/>
```

### 滚动加载

```vue
<TsUlList
  :dataList="list"
  :currentPage="currentPage"
  pager="scroll"
  :height="320"
  @updatePage="getNextPage"
/>
```

## Props

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `dataList` | `Array` | `[]` | 列表数据 |
| `value` | `Array \| String \| Number` | - | 当前选中值，单选传单值，多选传数组 |
| `textName` | `String` | `'name'` | 显示文本字段名 |
| `valueName` | `String` | `'id'` | 值字段名 |
| `childName` | `String` | `'children'` | 子节点字段名 |
| `multiple` | `Boolean` | `false` | 是否多选 |
| `isToggle` | `Boolean` | `false` | 单选模式下再次点击已选中项时是否允许取消 |
| `pager` | `String` | `'button'` | 分页方式，支持 `button` / `scroll` |
| `height` | `Number` | `500` | `pager="scroll"` 时滚动容器高度 |
| `pageCount` | `Number` | - | 总页数 |
| `pageSize` | `Number` | - | 每页数量 |
| `currentPage` | `Number` | - | 当前页码 |
| `rowNum` | `Number` | - | 预留参数，当前组件内部未直接使用 |
| `size` | `String` | `'normal'` | 列表尺寸，支持 `normal` / `small` |
| `className` | `String` | - | 追加到每一项的 class |
| `itemStyle` | `String` | - | 每一项的内联样式 |
| `level` | `Boolean` | `false` | 是否启用层级缩进风格 |
| `isGroup` | `Boolean` | `false` | 是否按分组样式显示 |
| `groupTextName` | `String` | `'name'` | 预留分组文本字段 |
| `groupValueName` | `String` | `'id'` | 预留分组值字段 |
| `onClick` | `any` | - | 预留参数，当前组件内部未直接使用 |

## 事件

| 事件名 | 参数 | 说明 |
| --- | --- | --- |
| `li-click` | `selectedValue` | 点击叶子节点后触发，单选返回单值，多选返回数组 |
| `updatePage` | `page` | 分页切换时触发 |
| `updateSize` | `size` | 页大小切换时触发，当前组件未内置对应 UI，但保留了事件 |

## 插槽

### 默认插槽

作用域参数：

| 参数 | 说明 |
| --- | --- |
| `row` | 当前行数据 |

## 数据结构说明

### 普通列表

```js
[
  { id: 1, name: '名称1' },
  { id: 2, name: '名称2' }
]
```

### 树形列表

```js
[
  {
    id: 'root',
    name: '根节点',
    open: false,
    children: [
      { id: 'child-1', name: '子节点1' }
    ]
  }
]
```

### 特殊字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_isSelected` | `Boolean` | 组件内部仍会写入该兼容字段，用于选中态显示 |
| `disabled` | `Boolean` | 列表项禁用样式字段 |
| `open` | `Boolean` | 有子节点时的展开状态 |

## 交互规则

- 有子节点的项优先处理展开和收起，不会触发 `li-click`。
- 只有叶子节点点击后才会触发 `li-click`。
- 多选模式下，组件会同步维护选中数组和 `_isSelected` 状态。
- 单选模式下，如果 `isToggle=false`，点击已选中项不会取消。
- 单选模式下，如果 `isToggle=true`，点击已选中项会清空当前选择。
- 外部 `value` 变化后，组件会同步刷新内部选中态。

## 使用注意事项

1. `value` 的类型尽量与 `valueName` 对应字段保持一致。
2. 多选模式下，`value` 应传数组，组件内部会按数组逻辑处理。
3. 当前版本仍保留 `_isSelected` 兼容字段，组件会直接写回列表项。
4. 组件已经补充了非数组数据保护，但业务侧仍建议传入结构稳定的数组数据。
5. 滚动模式下，到底部只会触发 `updatePage(currentPage + 1)`，是否继续加载由父组件决定。
6. 分页仅负责派发事件，不会自动请求数据。

## 适用场景

- 左侧导航列表
- 分类树形列表
- 简单资源选择面板
- 带分页的轻量列表
- 需要自定义单行内容的树形展示

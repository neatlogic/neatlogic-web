# TsSimpleTable 轻量表格组件

轻量表格组件，根据表头配置展示数据，支持按列名自定义单元格，并提供分页控件。组件展示传入的全部 `tbodyList`，分页数据截取或接口请求由父组件处理。

## 基本用法

```vue
<template>
  <TsSimpleTable :theadList="theadList" :tbodyList="tbodyList">
    <template #status="{ row, index }">
      <span>{{ index + 1 }}. {{ row.status === 'enabled' ? '启用' : '停用' }}</span>
    </template>
  </TsSimpleTable>
</template>

<script>
export default {
  components: {
    TsSimpleTable: () => import('@/resources/components/TsSimpleTable/index.vue')
  },
  data() {
    return {
      theadList: [
        { key: 'name', title: '名称' },
        { key: 'status', title: '状态' }
      ],
      tbodyList: [
        { uuid: 'item-1', name: '示例一', status: 'enabled' },
        { uuid: 'item-2', name: '示例二', status: 'disabled' }
      ]
    };
  }
};
</script>
```

未配置列插槽时，单元格默认以文本方式显示 `row[col.key]`。基础示例未传入 `rowNum`，因此不显示分页。

## Props

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `theadList` | `Array` | `undefined` | 表头配置，按数组顺序显示列，使用时应提供数组。 |
| `tbodyList` | `Array` | `[]` | 当前需要展示的行数据，不会根据页码自动截取。 |
| `rowNum` | `Number / String` | `undefined` | 数据总条数，用于分页显示判断并传给内部 `Page`；建议传入数字。 |
| `currentPage` | `Number` | `undefined` | 当前页码，传给内部 `Page`，使用分页时应由父组件维护。 |
| `pageSize` | `Number` | `20` | 每页条数；小于或等于 `0` 时不显示分页。 |
| `pageSizeOpts` | `Array` | `[10, 20, 30, 40, 60, 80, 100]` | 分页控件可选择的每页条数。 |
| `defaultShowSize` | `Number` | `10` | 分页显示阈值，只有 `rowNum > defaultShowSize` 且 `pageSize > 0` 时显示分页。 |

### 数据格式

| 配置位置 | 字段 | 说明 |
| --- | --- | --- |
| `theadList` 项 | `key` | 列的唯一标识，同时作为行数据字段名和单元格插槽名。 |
| `theadList` 项 | `title` | 表头显示文字。 |
| `tbodyList` 项 | `uuid` | 行的唯一标识，用于渲染 key，应保证唯一且稳定。 |
| `tbodyList` 项 | 与列 `key` 对应的字段 | 单元格默认显示内容。 |

组件仅使用列配置中的 `key` 和 `title`；宽度、排序、固定列等字段没有对应处理逻辑。

## 插槽

每一列都有一个以 `col.key` 命名的作用域插槽，用于替换该列单元格内容。

| 插槽参数 | 说明 |
| --- | --- |
| `row` | 当前行的完整数据对象。 |
| `index` | 当前行在传入的 `tbodyList` 中的下标，从 `0` 开始；不是跨页的全局序号。 |

例如，表头包含 `{ key: 'action', title: '操作' }` 时，可以添加：

```vue
<template #action="{ row }">
  <span class="text-action" @click="editRow(row)">编辑</span>
</template>
```

该插槽需要放在 `TsSimpleTable` 标签内，`editRow` 由父组件实现。表头文字没有单独的自定义插槽。

## 事件

| 事件名 | 回调参数 | 说明 |
| --- | --- | --- |
| `changeCurrent` | `page`，新页码 | 内部 `Page` 的 `on-change` 触发时抛出。 |
| `changePageSize` | `size`，新的每页条数 | 内部 `Page` 的 `on-page-size-change` 触发时抛出。 |

父组件应监听事件并更新 `currentPage`、`pageSize` 和 `tbodyList`。组件没有 `v-model` 或 `.sync` 更新事件，切换每页条数时也没有主动将父组件页码重置为 `1`。

## 分页示例

以下示例在父组件中截取本地数据，实现分页。使用接口分页时，可将计算属性替换为接口返回的当前页数据，并在事件处理中重新请求接口。

```vue
<template>
  <TsSimpleTable
    :theadList="theadList"
    :tbodyList="pageRows"
    :rowNum="allRows.length"
    :currentPage="currentPage"
    :pageSize="pageSize"
    @changeCurrent="changeCurrent"
    @changePageSize="changePageSize"
  />
</template>

<script>
export default {
  components: {
    TsSimpleTable: () => import('@/resources/components/TsSimpleTable/index.vue')
  },
  data() {
    return {
      currentPage: 1,
      pageSize: 10,
      theadList: [{ key: 'name', title: '名称' }],
      allRows: Array.from({ length: 25 }, (_, index) => ({
        uuid: `item-${index + 1}`,
        name: `示例 ${index + 1}`
      }))
    };
  },
  computed: {
    pageRows() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.allRows.slice(start, start + this.pageSize);
    }
  },
  methods: {
    changeCurrent(page) {
      this.currentPage = page;
    },
    changePageSize(size) {
      this.pageSize = size;
      this.currentPage = 1;
    }
  }
};
</script>
```

分页控件固定使用小尺寸，显示总条数和每页条数选择器，下拉层挂载到 `body`。总条数等于 `defaultShowSize` 时也不显示分页。

## 样式与使用注意

- 表格容器支持横向滚动，使用项目的 `tstable-*`、边框、背景和圆角等公共样式，分页依赖全局注册的 `Page` 组件。
- 空列表只渲染表头和空表体，没有内置的暂无数据提示、加载状态或错误提示。
- 当前没有内置行选择、排序、筛选、合并单元格或行点击事件；需要交互时，可在列插槽内实现。
- 行数据应提供 `uuid`，表头应提供唯一 `key`，以保持渲染 key 稳定。

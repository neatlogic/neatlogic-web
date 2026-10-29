# VerticalPager

Vue 2 纵向分页组件，适合侧边菜单、窄列列表等场景。入口为 [vertical-pager.vue](./vertical-pager.vue)，提供上下翻页、当前页附近页码、首尾页及每次跳转 5 页的快捷入口。

## 基本使用

```vue
<template>
  <div class="list-with-pager">
    <ul>
      <li v-for="item in visibleList" :key="item.id">{{ item.name }}</li>
    </ul>
    <VerticalPager
      :currentPage="currentPage"
      :pageCount="pageCount"
      @change="changePage"
    />
  </div>
</template>

<script>
export default {
  components: {
    VerticalPager: () => import('@/resources/plugins/VerticalPager/vertical-pager.vue')
  },
  data() {
    return {
      currentPage: 1,
      pageSize: 5,
      list: Array.from({ length: 30 }, (_, index) => ({
        id: index + 1,
        name: `条目 ${index + 1}`
      }))
    };
  },
  computed: {
    pageCount() {
      return Math.ceil(this.list.length / this.pageSize);
    },
    visibleList() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.list.slice(start, start + this.pageSize);
    }
  },
  methods: {
    changePage(page) {
      if (page === this.currentPage) {
        return;
      }
      this.currentPage = page;
    }
  }
};
</script>

<style scoped>
.list-with-pager {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 24px;
  gap: 8px;
}
</style>
```

组件只展示分页入口并发出目标页码，父组件负责更新 `currentPage` 和列表内容。服务端分页时，在 `changePage(page)` 中更新查询参数并请求接口，再将响应中的当前页和总页数传入组件即可。

当前目录没有 `Vue.use()` 插件入口，使用时局部注册。组件没有声明 `model`，也不发出 `input`、`update:currentPage` 事件，因此应使用属性和 `@change` 配合控制页码。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `currentPage` | Number | 未设置 | 当前页码，从 `1` 开始。父组件应传入有效整数。 |
| `pageCount` | Number | 未设置 | 总页数；仅当 `pageCount > 1` 时渲染整个分页组件。 |

两个属性均未声明 `required`、默认值或自定义校验，使用时应显式传入数字，例如 `:currentPage="1"`。组件不接收总条数、每页条数，也不负责计算总页数。

## 事件

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `change` | `page: Number` | 点击翻页箭头、非当前页页码或快捷跳页入口时，传出目标页码。 |

组件内部的 `change(page)` 方法仅执行 `this.$emit('change', page)`，不修改属性，也不进行去重或额外校验。通常直接监听事件即可。

## 页码展示与跳转规则

以下规则以 `1 <= currentPage <= pageCount` 为前提：

| 入口 | 展示条件 | 点击后的目标页码 |
| --- | --- | --- |
| 上箭头 | 总页数大于 `1` | `Math.max(currentPage - 1, 1)`。 |
| 首页 `1` | `currentPage - 3 >= 1` | `1`。 |
| 上方省略图标 | 与首页同时显示 | `Math.max(currentPage - 5, 1)`。 |
| 当前页之前的页码 | 页码不小于 `1` | 对应页码，最多展示前两页。 |
| 当前页 | 总页数大于 `1` | 加粗并使用主题色，没有点击处理。 |
| 当前页之后的页码 | 页码不大于 `pageCount` | 对应页码，最多展示后两页。 |
| 下方省略图标 | `currentPage + 3 <= pageCount` | `Math.min(currentPage + 5, pageCount)`。 |
| 尾页 | 与下方省略图标同时显示 | `pageCount`。 |
| 下箭头 | 总页数大于 `1` | `Math.min(currentPage + 1, pageCount)`。 |

例如 `currentPage = 6`、`pageCount = 12` 时，从上到下显示：上箭头、`1`、省略图标、`4`、`5`、当前页 `6`、`7`、`8`、省略图标、`12`、下箭头。两个省略图标分别跳转到第 `1` 页和第 `11` 页。

省略图标按上述固定条件显示，即使首尾页与相邻页码之间没有缺页也可能出现。例如当前第 `4` 页时，首页和第 `2` 页之间仍会显示省略图标。

## 布局与使用注意

- 页码项宽 `24px`、高 `20px`、行高 `20px`；上下箭头项宽 `24px`。组件按纵向排列，外层布局和与列表的间距由父组件控制。
- 上下箭头和省略图标依赖项目的 `tsfont-up`、`tsfont-down`、`tsfont-option-vertical` 图标字体，颜色和溢出样式依赖项目的全局样式。
- 首页的上箭头、尾页的下箭头仅通过 `text-disabled` 改变颜色，仍然可以点击，并发出当前页码。父组件可像示例一样忽略重复页码，避免重复请求。
- 组件没有监听页数变化并修正当前页。筛选条件变化、删除数据或总页数减少时，父组件需要重置或校正 `currentPage`；无数据时可保持当前页为 `1`、总页数为 `0`。
- `pageCount <= 1` 时组件自身不渲染内容；如果父组件为分页器预留了独立列或间距，也需要按相同条件调整外层布局。
- 当前组件没有插槽，也没有加载、禁用、页码输入或每页条数选择配置。

# TsBreadcrumb

面包屑导航组件，按 `pathList` 顺序展示图标和文字，以 `/` 分隔。最后一项表示当前页面，高亮显示且不可点击；其他项支持路由跳转、当前窗口跳转和新窗口打开，也可以在跳转前执行拦截逻辑。

## 基本用法

```vue
<template>
  <TsBreadcrumb :pathList="pathList" :beforeGoto="beforeGoto" />
</template>

<script>
import TsBreadcrumb from '@/resources/components/TsBreadcrumb/TsBreadcrumb.vue';

export default {
  components: { TsBreadcrumb },
  data() {
    return {
      hasUnsavedChanges: false,
      pathList: [
        { type: 'router', path: '/example', text: '列表', icon: 'tsfont-list' },
        { text: '详情' }
      ]
    };
  },
  methods: {
    beforeGoto(breadcrumb) {
      // breadcrumb 为面包屑组件实例，可读取本次点击项。
      const target = breadcrumb.pathList[breadcrumb.gotoIndex];
      return !!target && !this.hasUnsavedChanges;
    }
  }
};
</script>
```

示例中的路由需替换为项目中的实际路由。也可以通过同目录的安装入口注册组件：

```javascript
import Vue from 'vue';
import TsBreadcrumb from '@/resources/components/TsBreadcrumb/TsBreadcrumb.js';

Vue.use(TsBreadcrumb);
```

## Props

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `pathList` | `Array` | `[]` | 面包屑列表，按从上级页面到当前页面的顺序排列。 |
| `beforeGoto` | `Function` | `undefined` | 通用跳转前回调，接收组件实例；返回真值时继续跳转，返回假值时阻止跳转。 |

### pathList 项配置

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `text` | `String` | 显示文字。 |
| `icon` | `String` | 可选的图标 CSS 类名，显示在文字前面，例如 `tsfont-list`。 |
| `type` | `String` | 跳转类型，建议显式配置为 `router`、`href` 或 `blank`。 |
| `path` | `String` | 跳转路径，具体格式见下表；最后一项不执行跳转，可以省略。 |
| `beforeGoto` | `Function` | 当前项的跳转前回调，优先于组件的 `beforeGoto`，两者不会依次执行。 |

### 跳转类型

| type | 行为 | path 示例 |
| --- | --- | --- |
| `router` | 调用 `this.$router.push({ path: path.path })`，在当前应用内跳转。 | `/example` |
| `href` | 调用 `this.$utils.gotoHref(HOME + path.path, that)`，在当前窗口跳转；`that` 从根组件的 `$refs.root` 获取，供工具方法处理页面离开拦截。 | `/framework.html#/example` |
| `blank` | 调用 `window.open(HOME + path.path, '_blank')`，新窗口或标签页打开。 | `/framework.html#/example` |

`type` 为空或为其他值时，也会进入新窗口打开分支。`href` 和 `blank` 的地址都会直接拼接全局变量 `HOME`，应填写项目内的页面路径，不要直接传入完整的外部 URL。

## 跳转前拦截

点击非最后一项时，组件先将下标保存到 `gotoIndex`，再选择 `path.beforeGoto || beforeGoto` 执行。回调接收组件实例，不直接接收列表项或下标。

- 未配置回调时，直接跳转。
- 同时配置单项回调和通用回调时，使用单项回调。
- 回调返回 `true` 等真值时，立即跳转。
- 回调返回 `false`、`undefined` 等假值时，阻止跳转；只执行逻辑而不返回值也会阻止跳转。
- 最后一项不会触发回调。

回调按同步返回值判断，不会等待 Promise，因此不要直接通过 `async` 回调返回是否允许跳转。需要异步确认时，应先返回 `false`，确认后调用回调参数上的 `gotoUrl()`：

```javascript
methods: {
  beforeGoto(breadcrumb) {
    this.$Modal.confirm({
      title: '离开当前页面',
      content: '确认离开当前页面？',
      onOk: () => {
        breadcrumb.gotoUrl();
      }
    });
    return false;
  }
}
```

该示例依赖项目提供的 `$Modal`。异步等待期间应避免再次点击导航或修改 `pathList`，因为 `gotoUrl()` 使用调用时的 `gotoIndex` 和 `pathList` 获取目标。

## 方法

| 方法 | 参数 | 说明 |
| --- | --- | --- |
| `clickItem(index)` | 列表项下标 | 执行点击逻辑，检查是否为最后一项，并执行跳转前回调。 |
| `gotoUrl()` | 无 | 根据已保存的 `gotoIndex` 执行跳转，不再次执行 `beforeGoto`；初始下标为 `null` 时不操作。主要用于拦截后的手动继续跳转。 |

## 使用注意

- 组件不抛出自定义事件，也未提供插槽；跳转拦截通过 `beforeGoto` 配置。
- 当前页面由列表最后一项确定，组件不会根据当前路由自动生成列表或匹配高亮项。
- `router` 类型依赖 Vue Router；`href` 类型依赖项目的 `$utils.gotoHref`，`href` 和 `blank` 类型依赖全局变量 `HOME`。
- 分隔符固定为 `/`，图标依赖相应的字体图标样式，组件没有提供分隔符配置。
- 当前实现跳转后没有重置 `gotoIndex`；不要将 `gotoUrl()` 当作可重复调用的一次性确认方法。

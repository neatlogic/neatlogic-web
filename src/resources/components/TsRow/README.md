# TsRow 栅格行组件

栅格行组件，对项目 UI 库的 `Row` 做简单包装，提供默认列间距和外层 `clearfix` 容器，通常与 `Col` 配合使用。

组件已在 `src/resources/base.js` 中全局注册，加载该入口的页面可以直接使用。

## 基本用法

```vue
<template>
  <TsRow :gutter="16">
    <Col :span="12">
      <div>左侧内容</div>
    </Col>
    <Col :span="12">
      <div>右侧内容</div>
    </Col>
  </TsRow>
</template>
```

在未加载项目全局注册入口的场景中，可以局部引入：

```javascript
import TsRow from '@/resources/components/TsRow/TsRow.vue';

export default {
  components: { TsRow }
};
```

同目录的 `TsRow.js` 还提供 `Vue.use(TsRow)` 安装入口。组件依赖项目 UI 库提供的 `Row`、`Col`，以及项目的 `clearfix` 样式。

## Props

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `gutter` | `Number` | `16` | 传给内部 `Row` 的列间距，单位为 px；传入 `0` 可取消列间距。 |
| `className` | `String` | `''` | 添加到内部 `Row` 上的自定义 CSS 类名，多个类名可用空格分隔。 |

## 插槽

| 插槽 | 说明 |
| --- | --- |
| 默认插槽 | 行内容，直接放置 `Col` 作为栅格列。列宽、偏移和响应式设置由 `Col` 控制。 |

## 自定义样式

`class` 和 `style` 应用在组件外层的 `div.clearfix` 上，`className` 应用在内部 `Row` 上：

```vue
<TsRow class="mb-md" className="search-row" :gutter="8">
  <Col :span="8">条件一</Col>
  <Col :span="8">条件二</Col>
  <Col :span="8">条件三</Col>
</TsRow>
```

上述示例中，`mb-md` 控制整个组件的外部间距，`search-row` 用于自定义内部栅格行样式。在父组件的 scoped 样式中设置内部 `Row` 的样式时，需要使用项目支持的深度选择器。

## 使用注意

- `gutter` 应通过数值绑定，例如 `:gutter="8"`。
- 组件仅声明 `gutter` 和 `className`，没有将 `$attrs` 或 `$listeners` 转发给内部 `Row`；其他 `Row` 参数不会自动生效于内部栅格行。
- 组件没有自定义事件或公开方法。

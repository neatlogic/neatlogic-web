# ModuleBaseLayout 使用说明

`src/views/components/layout/module-base-layout.vue` 是模块入口页的公共布局组件，用来统一承载 `TopNav`、`LeftMenu`、`.centermain`、`router-view`、`LicenseValidator` 和 `reloadRouter` 逻辑。

## 基本用法

有左侧菜单的模块：

```vue
<template>
  <ModuleBaseLayout>
    <template #leftMenu>
      <ModuleMenu></ModuleMenu>
    </template>
  </ModuleBaseLayout>
</template>

<script>
export default {
  name: 'ModuleHome',
  components: {
    ModuleBaseLayout: () => import('@/views/components/layout/module-base-layout.vue'),
    ModuleMenu: () => import('./leftmenu/module-menu.vue')
  }
};
</script>
```

没有左侧菜单的模块：

```vue
<template>
  <ModuleBaseLayout :has-left-menu="false"></ModuleBaseLayout>
</template>
```

自定义顶部导航内容：

```vue
<template>
  <ModuleBaseLayout>
    <template #topNav>
      <CustomTopNav></CustomTopNav>
    </template>
  </ModuleBaseLayout>
</template>
```

## Props

- `hasAuthorization`：是否有入口权限，默认 `true`。为 `false` 时不渲染布局。
- `hasLeftMenu`：是否需要左侧菜单，默认 `true`。
- `centermainStyle`：传给 `.centermain` 的内联样式，支持 `String`、`Object`、`Array`。
- `keepAliveInclude`：传给 `keep-alive` 的 `include`，不传时不启用 `keep-alive`。
- `keepAliveMax`：传给 `keep-alive` 的 `max`。

## Slots

- `leftMenu`：传入当前模块自己的左侧菜单内容，渲染在公共 `LeftMenu` 内部。
- `topNav`：替换默认 `TopNav`，只有在顶部导航未隐藏时渲染。

## 布局隐藏字段

字段可写在 URL query 或路由 `meta` 中。query 适合临时打开页面时控制布局，`meta` 适合某个路由固定隐藏布局区域。

- `hidden-topnav=true`：隐藏顶部导航 `TopNav`。
- `hidden-leftmenu=true`：隐藏左侧菜单 `LeftMenu`。
- `hidden-topnav-leftmenu=true`：同时隐藏顶部导航和左侧菜单。

这三个字段只控制公共模块壳，不处理业务页面内部自己的标题栏、工具栏、面包屑或侧边栏。

## URL 示例

只隐藏顶部导航：

```text
monitor.html#/mon-slide?hidden-topnav=true
```

只隐藏左侧菜单：

```text
monitor.html#/mon-slide?hidden-leftmenu=true
```

同时隐藏顶部导航和左侧菜单：

```text
monitor.html#/mon-slide-preview?id=1&hidden-topnav-leftmenu=true
```

也可以分别传两个单独字段达到同样效果：

```text
monitor.html#/mon-slide-preview?id=1&hidden-topnav=true&hidden-leftmenu=true
```

## 路由 meta 示例

固定隐藏顶部导航：

```js
{
  path: '/example-page',
  name: 'example-page',
  component: ExamplePage,
  meta: {
    title: 'Example',
    'hidden-topnav': true
  }
}
```

固定隐藏左侧菜单：

```js
{
  path: '/example-page',
  name: 'example-page',
  component: ExamplePage,
  meta: {
    title: 'Example',
    'hidden-leftmenu': true
  }
}
```

固定隐藏顶部导航和左侧菜单：

```js
{
  path: '/mon-slide-preview',
  name: 'mon-slide-preview',
  component: monSlidePreview,
  meta: {
    title: $t('term.monitor.carouseldemo'),
    authority: 'MONITOR_SCOPE_VIEW',
    'hidden-topnav-leftmenu': true
  }
}
```

## 判断规则

- query 和 `meta` 任意一个来源为 `true`，对应区域就会隐藏。
- 字段值支持布尔值 `true` 和字符串 `'true'`。
- 如果同一个 query 字段出现多次，只要其中一个值为 `true` 就会生效。
- `hidden-topnav-leftmenu` 生效时，会同时关闭 `TopNav` 和 `LeftMenu`。
- `hasLeftMenu=false` 时，左侧菜单始终不渲染。
- `routerViewKey` 会忽略 `hidden-topnav`、`hidden-leftmenu`、`hidden-topnav-leftmenu`，避免只切换布局参数时重新创建业务页面。

## 样式说明

公共样式位于 `src/resources/assets/css/common.less`：

- `.module-base.hidden-topnav`：去掉顶部 padding，并让 `.centermain` 高度铺满 `100vh`。
- `.module-base.hidden-topnav .leftmenu`：当只隐藏顶部导航但保留左侧菜单时，左侧菜单从顶部开始显示。
- `.module-base.hidden-leftmenu`：去掉左侧 padding。
- `.module-base.hidden-topnav-leftmenu`：去掉最小宽度限制，适合预览页、嵌入页等无公共壳场景。

## 验证建议

- 普通模块入口：确认顶部导航、左侧菜单、页面内容、License 校验正常显示。
- `hidden-topnav=true`：确认只隐藏顶部导航，左侧菜单仍显示且从顶部开始。
- `hidden-leftmenu=true`：确认只隐藏左侧菜单，顶部导航仍显示。
- `hidden-topnav-leftmenu=true`：确认顶部导航和左侧菜单都不显示，内容区域铺满页面。
- 切换上述 layout query 时，确认业务页面不会因为布局参数变化被强制重新创建。
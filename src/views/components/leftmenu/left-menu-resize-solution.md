# LeftMenu Resize 方案说明

本文档基于当前说明文档 [left-menu.md](/src/views/components/leftmenu/left-menu.md:1) 整理，用来说明左侧菜单宽度调整能力如果要落地，应该建立在哪些现状之上、会影响哪些位置，以及推荐的实现方式。

## 1. 结论概览

当前 `LeftMenu` 的 resize 方案可以先明确四个结论:

- 宽度状态源建议仍然收口在 [leftmenu.vue](/src/views/components/leftmenu/leftmenu.vue:1)
- 这不是单个组件内的视觉微调，必须联动全局布局样式
- 对外接口仍应以当前文档为准，也就是默认插槽和 `menuToggle` 事件
- 首批高风险回归点不在默认菜单，而在 `rdm-menu`、`alert-menu` 这类带分页列和局部操作区的业务菜单

## 2. 当前实现基线

根据 [left-menu.md](/src/views/components/leftmenu/left-menu.md:1)，当前 `LeftMenu` 的事实基线如下:

- 组件负责公共外层结构、默认菜单渲染、展开收起状态管理和菜单切换后的 `resize` 广播
- 当前内部状态名已经是 `isMenuExpanded`、`menuList`、`menuCategoryType`、`isSlider`
- 当前对外真正生效的接口只有默认插槽和 `menuToggle` 事件
- 菜单显示状态由 `localStorage.menuActive + Vuex.menuActive + 组件内部状态` 共同维护
- 插槽菜单和默认菜单是并存关系，不是替换关系

典型使用方式应以当前文档为准:

```vue
<LeftMenu @menuToggle="menuToggle">
  <ModuleMenu />
</LeftMenu>
```

因此 resize 方案文档后续不应再使用已经过时的示例或术语，例如:

- `:showmenu="showmenu"`
- `@menushow`
- `menushow`
- `menulist`
- `menutype`

## 3. 为什么 resize 不能只改 LeftMenu

虽然宽度调整入口适合放在 `LeftMenu`，但实际影响面并不止组件本身。

### 3.1 组件层

[leftmenu.vue](/src/views/components/leftmenu/leftmenu.vue:1) 目前已经承担:

- 左侧菜单容器结构
- 菜单展开/收起切换
- 默认菜单渲染
- 切换后的 `window.dispatchEvent(new CustomEvent('resize'))`

这意味着它天然适合作为菜单宽度状态和拖拽行为的收口点。

### 3.2 全局布局层

如果菜单宽度从固定值变成可调值，全局布局一定要跟着变。[common.less](/src/resources/assets/css/common.less:1) 仍然是关键联动点，尤其是这些区域:

- `.home` 的 `padding-left`
- `.leftmenu` 的宽度
- `.leftmenu .menubar` 的宽度
- `.leftmenu .menubar .menu_content` 的宽度
- `.menu-min` 下的位移和折叠样式

如果只在组件里改宽度，不同步全局布局，最容易出现的问题是:

- 主内容区偏移不正确
- 折叠动画位移不正确
- 菜单内容区宽度和外层容器不同步

### 3.3 业务菜单层

不同业务菜单对宽度变化的耐受度并不一样，需要分类型看。

相对安全的菜单:

- [report-menu.vue](/src/views/pages/report/leftmenu/report-menu.vue:1)
- [cmdb-menu.vue](/src/views/pages/cmdb/leftmenu/cmdb-menu.vue:1)
- [dashboard-menu.vue](/src/views/pages/dashboard/leftmenu/dashboard-menu.vue:1)
- [diagram-menu.vue](/src/commercial-module/diagram/pages/leftmenu/diagram-menu.vue:1)

这类组件当前大多是:

- `grid-template-columns: auto 23px`
- 普通弹性内容区
- 结构相对简单

通常更适合作为“先接入统一宽度来源、再做常规回归”的一组。

优先关注的高风险菜单:

- [rdm-menu.vue](/src/views/pages/rdm/leftmenu/rdm-menu.vue:1)
- [alert-menu.vue](/src/community-module/alert/pages/leftmenu/alert-menu.vue:1)

按当前代码看，这两类组件已经不是旧版本里那种固定 `177px` 列宽，而是更偏向下面这种布局组合:

- `grid-template-columns: minmax(0, 1fr) 23px`
- `max-width: calc(...)`
- `position: absolute`
- `padding-right: 0`

这意味着如果只是普通展开/收起，它们大概率能继续工作；但如果引入“拖拽实时改宽”，这类组件仍然是最需要单独适配和回归验证的类型。

## 4. 现有状态链路对 resize 的约束

根据 [left-menu.md](/src/views/components/leftmenu/left-menu.md:1) 的状态说明，当前菜单切换链路已经存在:

1. `created()` 从 `localStorage.menuActive` 恢复初始展开状态
2. `menuToggle()` 触发 Vuex 的 `UPDATE_MENU`
3. `watch menuActive` 把状态同步回 `isMenuExpanded` 和 `localStorage`
4. `watch isMenuExpanded` 向父组件抛出 `menuToggle`
5. 菜单切换完成后广播一次全局 `resize`

这条链路说明两件事:

- 宽度调整能力最好不要绕开 `LeftMenu` 自己去单独维护另一套显示状态
- resize 能力应该复用当前已有的广播契约，而不是额外发明一套完全平行的通知机制

## 5. 推荐方案

### 5.1 宽度状态放在 LeftMenu

推荐在 [leftmenu.vue](/src/views/components/leftmenu/leftmenu.vue:1) 中新增最小必要状态:

- `menuWidth`
- `minMenuWidth`
- `maxMenuWidth`
- `isResizing`

推荐配套能力:

- `getModuleKey()`
- `getStoredMenuWidth()`
- `setStoredMenuWidth(width)`
- `clampMenuWidth(width)`
- `startResize(event)`
- `onResizing(event)`
- `stopResize()`
- `syncMenuWidth()`
- `emitResizeEvent()`

这样做的好处是:

- 展开/收起状态与宽度状态都在同一个壳组件里维护
- 拖拽、持久化、广播逻辑可以统一收口
- 不会把宽度控制散落到多个业务菜单组件里

### 5.2 宽度按模块持久化

原方案里“按模块存储宽度”的方向可以保留，而且和当前文档不冲突。

推荐:

- 存储 key: `leftMenuWidthMap`
- 模块 key: `MODULEID`
- 默认宽度: `200`

推荐结构:

```json
{
  "cmdb": 260,
  "process": 320,
  "report": 220
}
```

这样做比按路由路径存储更稳定，也更符合左侧菜单“模块级壳组件”的职责边界。

### 5.3 使用统一宽度源驱动布局

宽度既然会影响组件层和页面层，最好不要在多个位置分别写死。

推荐使用统一宽度源，例如 CSS 变量:

```css
--left-menu-width: 200px;
```

再由它统一驱动:

- `.home`
- `.leftmenu`
- `.menubar`
- `.menu_content`
- `.menu-min` 相关位移

相比在多个节点上散落内联样式，统一宽度源更适合当前这种“公共壳组件 + 全局布局联动”的结构。

### 5.4 继续保留 resize 广播

当前实现已经把 `resize` 当成菜单变化后的通知契约，这一点不建议推翻。

推荐做法:

- 展开/收起完成后广播一次
- 拖拽结束后广播一次
- 如果拖拽过程中确实需要联动图表或表格，再考虑节流后的中途广播

不建议在每次 `mousemove` 时都无节制广播 `resize`，否则很容易把性能问题一并带进来。

### 5.5 事件解绑要纳入方案

如果后续增加拖拽行为，文档里建议直接把解绑约束写清楚:

- `startResize()` 负责注册 `mousemove` / `mouseup`
- `stopResize()` 负责统一解绑
- 组件销毁前也要兜底解绑

这属于实现细节，但提前写入方案可以减少后续遗漏。

## 6. 回归重点

### 6.1 高风险菜单

优先回归:

1. [rdm-menu.vue](/src/views/pages/rdm/leftmenu/rdm-menu.vue:1)
2. [alert-menu.vue](/src/community-module/alert/pages/leftmenu/alert-menu.vue:1)

重点看:

- 标题截断是否异常
- 右侧分页或操作区是否错位
- 图标、角标、绝对定位元素是否溢出
- 内容区和分页列之间是否重叠

如果后续做的是拖拽调宽，这类组件还要额外看:

- `max-width: calc(...)` 是否仍然成立
- 绝对定位设置图标是否覆盖标题点击区
- `23px` 的分页列是否还能稳定保留
- 拖拽到边界值时是否出现换行抖动

这也意味着方案文档里需要明确写出: `rdm-menu` 这类组件通常不是“只回归不调整”，而是“可能需要局部样式适配”的类型。

### 6.2 中风险菜单

其次回归:

1. [report-menu.vue](/src/views/pages/report/leftmenu/report-menu.vue:1)
2. [cmdb-menu.vue](/src/views/pages/cmdb/leftmenu/cmdb-menu.vue:1)
3. [dashboard-menu.vue](/src/views/pages/dashboard/leftmenu/dashboard-menu.vue:1)
4. [diagram-menu.vue](/src/commercial-module/diagram/pages/leftmenu/diagram-menu.vue:1)

重点看:

- 弹性列布局是否仍然稳定
- 长标题是否仍然正确省略
- 菜单内容区和操作列之间是否重叠

这类组件通常不需要为了“支持拖拽”预先大改结构，更像是接入统一宽度来源之后做一次常规回归确认。

## 7. 建议实施顺序

### 7.1 第一阶段

先完成公共壳层能力:

1. 在 `leftmenu.vue` 增加宽度状态
2. 增加宽度范围限制
3. 增加拖拽手柄和拖拽逻辑
4. 增加本地持久化
5. 复用现有 `resize` 广播

目标是先让“宽度可调且可记忆”成立。

### 7.2 第二阶段

再打通全局布局联动:

1. 调整 `.home` 的偏移
2. 调整 `.leftmenu`、`.menubar`、`.menu_content` 的宽度来源
3. 调整 `.menu-min` 下的位移和折叠样式

目标是保证宽度变化后，页面布局和折叠动画仍然正确。

### 7.3 第三阶段

最后做业务菜单回归和局部修正:

1. `rdm`
2. `alert`
3. `report`
4. `cmdb`
5. `dashboard`
6. `diagram`

目标是把高风险菜单先压住，再处理相对安全的弹性布局菜单。

## 8. 一句话总结

基于当前 [left-menu.md](/src/views/components/leftmenu/left-menu.md:1) 的现状，`LeftMenu` 的 resize 方案应该先明确“当前真实接口是什么、状态链路在哪里、哪些文件必须联动、哪些业务菜单需要回归、哪些像 `rdm-menu` 这样的组件可能还要做局部适配”，再推进实现；这样后续改造才不会在接口认知和布局边界上反复返工。

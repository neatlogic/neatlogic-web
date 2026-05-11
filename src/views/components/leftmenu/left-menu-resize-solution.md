# LeftMenu Resize 方案说明

本文档基于当前说明文档 [left-menu.md](/src/views/components/leftmenu/left-menu.md:1) 和现有实现整理，用来说明左侧菜单宽度调整能力的落点、约束、联动范围，以及当前代码采用的实现方式。

## 1. 结论概览

当前 `LeftMenu` 的 resize 方案，可以先明确几个结论：

- 宽度能力仍然收口在 [leftmenu.vue](/src/views/components/leftmenu/leftmenu.vue:1)
- 具体拖拽逻辑已经抽到 [leftmenu-resize-mixin.js](/src/views/components/leftmenu/leftmenu-resize-mixin.js:1)
- 布局联动依赖统一 CSS 变量 `--left-menu-width`
- 展开/收起后的通知契约仍然沿用全局 `resize`
- 拖拽过程中的实时宽度不使用响应式 `data()`，而是使用非响应式字段 `this._menuWidth`

## 2. 当前实现基线

根据 [left-menu.md](/src/views/components/leftmenu/left-menu.md:1)，当前 `LeftMenu` 的公共职责主要包括：

- 提供左侧菜单公共外层结构
- 渲染默认菜单和插槽菜单
- 管理菜单展开/收起状态
- 菜单切换完成后派发一次全局 `resize`

当前对外真正生效的接口仍然只有两类：

- 默认插槽
- `menuToggle` 事件

典型使用方式仍然是：

```vue
<LeftMenu @menuToggle="menuToggle">
  <ModuleMenu />
</LeftMenu>
```

## 3. 为什么 resize 不能只改 LeftMenu

虽然拖拽入口放在 `LeftMenu` 最合适，但实际影响不止组件本身。

### 3.1 组件层

[leftmenu.vue](/src/views/components/leftmenu/leftmenu.vue:1) 当前已经承担：

- 左侧菜单容器结构
- 菜单展开/收起切换
- 默认菜单渲染
- 切换后的 `window.dispatchEvent(new CustomEvent('resize'))`

因此它天然适合作为 resize 的统一入口。

### 3.2 全局布局层

[common.less](/src/resources/assets/css/common.less:1) 仍然是关键联动点，尤其是这些区域：

- `.home` 的 `padding-left`
- `.leftmenu` 的宽度
- `.leftmenu .menubar` 的宽度
- `.leftmenu .menubar .menu_content` 的宽度
- `.menu-min` 下的位移和折叠样式

如果只改组件内部宽度，不同步全局布局，最容易出现的问题是：

- 主内容区偏移不正确
- 折叠动画位移不正确
- 菜单内容区和外层容器宽度不同步

### 3.3 业务菜单层

不同业务菜单对宽度变化的耐受度不一样。

相对安全的菜单：

- [report-menu.vue](/src/views/pages/report/leftmenu/report-menu.vue:1)
- [cmdb-menu.vue](/src/views/pages/cmdb/leftmenu/cmdb-menu.vue:1)
- [dashboard-menu.vue](/src/views/pages/dashboard/leftmenu/dashboard-menu.vue:1)
- [diagram-menu.vue](/src/commercial-module/diagram/pages/leftmenu/diagram-menu.vue:1)

优先关注的高风险菜单：

- [rdm-menu.vue](/src/views/pages/rdm/leftmenu/rdm-menu.vue:1)
- [alert-menu.vue](/src/community-module/alert/pages/leftmenu/alert-menu.vue:1)

原因是这类组件更容易依赖：

- 分页列
- 绝对定位图标
- 文本截断
- `max-width: calc(...)`

## 4. 现有状态链路对 resize 的约束

当前菜单切换链路已经存在：

1. `created()` 从 `localStorage.menuActive` 恢复初始展开状态
2. `menuToggle()` 触发 Vuex 的 `UPDATE_MENU`
3. `watch menuActive` 把状态同步回 `isMenuExpanded` 和 `localStorage`
4. `watch isMenuExpanded` 向父组件抛出 `menuToggle`
5. 菜单切换完成后广播一次全局 `resize`

这说明两件事：

- resize 能力最好不要绕开 `LeftMenu` 自己去单独维护另一套显示状态
- resize 能力应继续复用当前已有的广播契约，而不是平行发明另一套通知机制

## 5. 当前推荐方案

### 5.1 宽度能力收口在 LeftMenu，但逻辑抽到 mixin

当前实现推荐：

- `LeftMenu` 作为 resize 对外入口
- `leftmenu-resize-mixin.js` 作为拖拽宽度的逻辑收口点

当前 mixin 负责的核心能力包括：

- `getModuleKey()`
- `getStoredMenuWidth()`
- `setStoredMenuWidth(width)`
- `clampMenuWidth(width)`
- `startResize(event)`
- `onResizing(event)`
- `stopResize()`
- `syncMenuWidth(width)`
- `emitResizeEvent()`

这样做的好处是：

- `LeftMenu` 仍然保持为公共壳组件
- 拖拽、持久化、广播逻辑有统一收口
- 代码比全部堆在 `leftmenu.vue` 内更干净

### 5.2 拖拽中的实时宽度使用非响应式字段

这是当前实现和原始方案里最值得明确的一点。

当前代码没有把实时宽度放在 `data()` 里作为响应式状态，例如：

- 不再使用响应式 `menuWidth`
- 不再使用响应式 `minMenuWidth`
- 不再使用响应式 `maxMenuWidth`

当前采用的是：

- 响应式状态只保留 `isResizing`
- 实时宽度使用非响应式字段 `this._menuWidth`
- 宽度边界使用模块内常量

这样做的原因是：

- `mousemove` 频率非常高
- 如果每次拖拽都更新响应式数据，会带来不必要的 Vue 重新渲染
- 当前拖拽只需要直接更新 CSS 变量，并不需要模板根据宽度重新渲染

也就是说，当前实现追求的是：

`mousemove -> 更新 this._menuWidth -> 同步 CSS 变量`

而不是：

`mousemove -> 更新响应式 data -> 触发组件更新 -> 再改样式`

### 5.3 宽度按模块持久化

这部分方案保持不变，仍然推荐：

- 存储 key: `leftMenuWidthMap`
- 模块 key: `MODULEID`
- 默认宽度: `200`

推荐结构：

```json
{
  "cmdb": 260,
  "process": 320,
  "report": 220
}
```

这样比按路由路径存储更稳定，也更符合左侧菜单是模块级壳组件的职责边界。

### 5.4 使用统一宽度源驱动布局

推荐继续使用统一宽度源，也就是 CSS 变量：

```css
--left-menu-width: 200px;
```

再由它统一驱动：

- `.home`
- `.leftmenu`
- `.menubar`
- `.menu_content`
- `.menu-min` 相关位移

相比在多个节点上分散写内联样式，统一宽度源更适合当前这种“公共壳组件 + 全局布局联动”的结构。

### 5.5 继续保留 resize 广播

当前实现已经把 `resize` 当成菜单变化后的通知契约，这一点不建议推翻。

推荐做法：

- 展开/收起完成后广播一次
- 拖拽结束后广播一次
- 不建议在每次 `mousemove` 时都无节制广播 `resize`

否则很容易把性能问题一并带进来。

### 5.6 事件解绑必须纳入方案

如果有拖拽行为，事件解绑必须明确：

- `startResize()` 负责注册 `mousemove` / `mouseup`
- `stopResize()` 负责统一解绑
- 组件销毁前也要兜底解绑

这是实现细节，但必须作为方案约束写清楚。

## 6. 当前代码实现说明

结合现有代码，当前实现方式可以概括为：

1. `LeftMenu` 渲染拖拽手柄
2. 手柄 `mousedown` 进入 `startResize()`
3. 拖拽过程中更新 `this._menuWidth`
4. `syncMenuWidth(width)` 直接把宽度写入 `--left-menu-width`
5. `mouseup` 时持久化到 `leftMenuWidthMap`
6. 拖拽结束后广播一次全局 `resize`

这意味着当前实现：

- 不会形成“响应式宽度互相回写”的死循环
- 也尽量避免了拖拽过程中的高频无意义重新渲染

## 7. 回归重点

### 7.1 高风险菜单

优先回归：

1. [rdm-menu.vue](/src/views/pages/rdm/leftmenu/rdm-menu.vue:1)
2. [alert-menu.vue](/src/community-module/alert/pages/leftmenu/alert-menu.vue:1)

重点看：

- 标题截断是否异常
- 分页列或操作区是否错位
- 图标、角标、绝对定位元素是否溢出
- 内容区和分页列之间是否重叠

### 7.2 中风险菜单

其次回归：

1. [report-menu.vue](/src/views/pages/report/leftmenu/report-menu.vue:1)
2. [cmdb-menu.vue](/src/views/pages/cmdb/leftmenu/cmdb-menu.vue:1)
3. [dashboard-menu.vue](/src/views/pages/dashboard/leftmenu/dashboard-menu.vue:1)
4. [diagram-menu.vue](/src/commercial-module/diagram/pages/leftmenu/diagram-menu.vue:1)

重点看：

- 弹性列布局是否仍然稳定
- 长标题是否仍然正确省略
- 内容区和操作列之间是否重叠

## 8. 建议实施顺序

### 8.1 第一阶段

先完成公共壳层能力：

1. 在 `LeftMenu` 接入宽度能力入口
2. 在 `leftmenu-resize-mixin.js` 中维护拖拽逻辑
3. 增加宽度范围限制
4. 增加本地持久化
5. 复用现有 `resize` 广播

### 8.2 第二阶段

再打通全局布局联动：

1. 调整 `.home` 的偏移
2. 调整 `.leftmenu`、`.menubar`、`.menu_content` 的宽度来源
3. 调整 `.menu-min` 下的位移和折叠样式

### 8.3 第三阶段

最后做业务菜单回归和局部修正：

1. `rdm`
2. `alert`
3. `report`
4. `cmdb`
5. `dashboard`
6. `diagram`

## 9. 一句话总结

基于当前 [left-menu.md](/src/views/components/leftmenu/left-menu.md:1) 的现状，`LeftMenu` 的 resize 方案应该明确三件事：入口仍在 `LeftMenu`、逻辑应抽到 mixin、拖拽中的实时宽度应尽量避免使用响应式状态。这样后续改造才不会在接口认知、布局联动和性能边界上反复返工。

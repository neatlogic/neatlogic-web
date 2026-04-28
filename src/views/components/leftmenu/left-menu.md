# LeftMenu 组件说明

本文档基于当前实现文件 [leftmenu.vue](/src/views/components/leftmenu/leftmenu.vue) 整理，用来说明左侧菜单组件的职责、状态流转和默认菜单生成方式。

## 1. 文件位置

- 组件入口: [src/views/components/leftmenu/leftmenu.vue](/src/views/components/leftmenu/leftmenu.vue)
- 公共菜单方法: [src/views/components/leftmenu/leftmenu-mixin.js](/src/views/components/leftmenu/leftmenu-mixin.js)

## 2. 组件职责

`LeftMenu` 当前主要承担以下几类职责:

- 提供左侧菜单的公共外层结构
- 渲染插槽内容和默认菜单内容
- 管理菜单展开/收起状态
- 根据全局 `MENULIST` 和 `MENUTYPE` 组装默认菜单
- 透传菜单切换事件给父组件
- 在菜单切换后主动派发一次全局 `resize` 事件

## 3. 模板结构

组件模板的核心结构如下:

```vue
<div class="leftmenu">
  <div :class="isSlider ? 'menubar slider' : 'menubar'">
    <div class="menu_content">
      <slot :menuList="menuList"></slot>
      <div v-if="menuList && Object.keys(menuList).length">
        <!-- 默认菜单 -->
      </div>
    </div>
    <div :class="menuToggleButtonClass" @click="menuToggle()"></div>
  </div>
</div>
```

可以看出当前渲染顺序是:

1. 先渲染插槽内容
2. 再渲染默认菜单
3. 最后渲染展开/收起按钮

这意味着插槽菜单和默认菜单是并存关系，不是互斥替换关系。

## 4. 组件内部状态

`data()` 中当前使用的状态如下:

- `isMenuExpanded`: 菜单是否处于展开状态
- `menuList`: 默认菜单数据
- `menuCategoryType`: 菜单分组标题映射，来自 `MENUTYPE`
- `isSlider`: 是否启用切换动画样式

## 5. 初始化逻辑

组件在 `created()` 中做两件事:

1. 调用 `getMenuList()` 生成默认菜单
2. 从 `localStorage.menuActive` 恢复菜单状态

当前判断逻辑如下:

- 当 `localStorage.menuActive === 'show'` 或值不存在时，`isMenuExpanded = true`
- 否则，`isMenuExpanded = false`，并提交一次 `UPDATE_MENU('show')`

涉及代码位置:

- [created](/src/views/components/leftmenu/leftmenu.vue)

## 6. 默认菜单生成逻辑

`getMenuList()` 的主要流程如下:

1. 读取全局 `MENULIST`
2. 读取全局 `MENUTYPE`
3. 等待 `this.$store.state.topMenu.gettingModuleList`
4. 汇总当前用户在各模块下的权限列表
5. 从 `MENULIST` 里过滤出可展示菜单
6. 按 `meta.type` 分组
7. 如果存在 `MENUTYPE`，按 `MENUTYPE` 的顺序重新排序
8. 最终写入 `this.menuList`

当前菜单过滤条件为:

- `menu.meta` 存在
- `menu.meta.ismenu === true`
- `menu.meta.istitle !== true`
- 当前用户有权限，或者该菜单未声明 `meta.authority`

生成后的菜单结构有两种:

- 分组菜单: `menugroup[type] = []`
- 一级菜单: `menugroup[name] = { isFirst: true, ... }`

涉及代码位置:

- [getMenuList](/src/views/components/leftmenu/leftmenu.vue)

## 7. 展开/收起逻辑

组件通过 `menuActive` 和 `isMenuExpanded` 共同维护展开状态。

### 7.1 切换入口

点击右侧按钮会调用 `menuToggle()`:

1. 先把 `isSlider` 设为 `false`
2. 把当前 `menuActive` 写回 `localStorage`
3. 提交 `UPDATE_MENU`
4. 100ms 后恢复 `isSlider = true`
5. 手动派发一次 `window.resize`

涉及代码位置:

- [menuToggle](/src/views/components/leftmenu/leftmenu.vue:71)

### 7.2 计算按钮样式

`menuToggleButtonClass()` 根据 `isMenuExpanded` 返回按钮样式:

- 默认: `toggle-btn tsfont-bar`
- 展开时: `toggle-btn tsfont-left`

涉及代码位置:

- [menuToggleButtonClass](/src/views/components/leftmenu/leftmenu.vue:142)

### 7.3 状态同步

`watch` 中有两条同步链路:

- `menuActive`: 把 Vuex 中的 `menuActive` 同步到 `isMenuExpanded`，并写回 `localStorage`
- `isMenuExpanded`: 向父组件抛出 `menuToggle` 事件

涉及代码位置:

- [watch.menuActive](/src/views/components/leftmenu/leftmenu.vue:151)
- [watch.isMenuExpanded](/src/views/components/leftmenu/leftmenu.vue:159)

## 8. 对外接口

按当前实现，`LeftMenu` 对外真正生效的接口只有两类:

- 默认插槽
- `menuToggle` 事件

### 8.1 插槽

组件提供一个默认插槽，并向插槽暴露:

- `menuList`

典型使用方式:

```vue
<LeftMenu @menuToggle="menuToggle">
  <ModuleMenu />
</LeftMenu>
```

如果需要从插槽作用域里读取默认菜单，可使用:

```vue
<LeftMenu v-slot="{ menuList }">
  <!-- 使用 menuList -->
</LeftMenu>
```

### 8.2 事件

组件在 `isMenuExpanded` 变化时触发:

```js
this.$emit('menuToggle', this.isMenuExpanded);
```

父组件通常会根据该事件联动页面布局样式。

## 9. 依赖项

当前组件依赖以下外部能力:

- Vuex `menuActive`
- Vuex mutation `UPDATE_MENU`
- `this.$store.state.topMenu.gettingModuleList`
- 全局变量 `MENULIST`
- 全局变量 `MENUTYPE`
- 混入 [leftmenu-mixin.js](/src/views/components/leftmenu/leftmenu-mixin.js:1)
- 工具方法 `this.$utils.isEmpty`
- 工具方法 `this.$utils.checkHasSomeitem`
- 路由能力 `this.$router.addRoute`

## 10. 当前实现特点

根据现有代码，可以明确几个事实:

- 菜单显示状态是由 `localStorage + Vuex + 组件内部状态` 共同维护
- 插槽菜单与默认菜单会同时渲染
- 菜单切换后依赖全局 `resize` 事件通知外层布局组件重新计算
- 404 路由会在 `mounted()` 中动态注册

## 11. 文档维护建议

后续如果继续调整该组件，建议优先同步以下内容:

- 字段命名是否发生变化
- 默认菜单的数据来源是否变化
- `menuToggle` 事件语义是否变化
- 插槽和默认菜单是否仍然并存
- `menuActive` 的状态链路是否调整

# Module Portal 入口模块可执行迁移计划

## 目标
- 将 29 个独立入口模块逐步迁移到 `src/views/components/layout/module-base-layout.vue`。
- 消除各入口页中重复维护的 `TopNav`、`LeftMenu`、`centermain`、`router-view`、`LicenseValidator`、`reloadRouter` 逻辑。
- 每次只迁移一个入口模块，迁移后立即验证，避免批量改造带来定位困难。

## 当前基础
- 公共布局组件：`src/views/components/layout/module-base-layout.vue`
- 已完成样板模块：`src/views/pages/autoexec/autoexec.vue`
- 公共布局接口：
  - `leftMenu` slot：注入模块自己的左侧菜单组件。
  - `hasAuthorization` prop：默认 `true`，保留给需要自定义入口权限判断的模块。
  - 自动处理 `TopNav`、`LeftMenu`、`router-view`、`LicenseValidator`、`reloadRouter`。
  - 支持 `query` 或 `route.meta` 中的 `hidden-topnav`、`hidden-leftmenu` 控制布局区域显示。

## 入口模块统计口径
- 只统计 `{moduleName}/{moduleName}.vue` 形式的入口文件。
- 示例：`src/commercial-module/ai/ai.vue` 计为 `ai` 入口模块。
- 有 `router.js` 但没有同名 `.vue` 的目录，视为路由扩展或公共页面，不计入独立入口模块。

## 模块清单
- `src/commercial-module`，13 个：
  - `ai`
  - `codehub`
  - `diagram`
  - `dr`
  - `fileservice`
  - `informant`
  - `lsbank`
  - `monitor`
  - `pascbank`
  - `pbc`
  - `resourcepool`
  - `szbank`
  - `tlcbbank`

- `src/community-module`，2 个：
  - `alert`
  - `knowledge`

- `src/views/pages`，14 个：
  - `autoexec`
  - `cmdb`
  - `dashboard`
  - `deploy`
  - `documentonline`
  - `framework`
  - `globalsearch`
  - `index`
  - `inspect`
  - `license`
  - `login`
  - `process`
  - `rdm`
  - `report`

## 执行顺序
- 第 0 批：确认样板
  - `src/views/pages/autoexec/autoexec.vue`
  - 目标：作为后续模块迁移模板，不再重复改造。

- 第 1 批：核心业务入口
  - `src/views/pages/cmdb/cmdb.vue`
  - `src/views/pages/process/process.vue`
  - `src/views/pages/deploy/deploy.vue`
  - `src/views/pages/rdm/rdm.vue`
  - 目标：优先迁移访问频率高、左侧菜单模式稳定的模块。

- 第 2 批：报表与巡检入口
  - `src/views/pages/dashboard/dashboard.vue`
  - `src/views/pages/report/report.vue`
  - `src/views/pages/inspect/inspect.vue`
  - 目标：验证图表、报表、巡检等复杂页面在公共 `router-view` 下行为不变；如模块显式配置 `keepAliveInclude`，同步验证缓存行为。

- 第 3 批：系统与特殊入口
  - `src/views/pages/framework/framework.vue`
  - `src/views/pages/documentonline/documentonline.vue`
  - `src/views/pages/globalsearch/globalsearch.vue`
  - `src/views/pages/index/index.vue` 或大小写实际入口文件
  - `src/views/pages/license/license.vue` 或大小写实际入口文件
  - `src/views/pages/login/login.vue` 或大小写实际入口文件
  - 目标：逐个判断是否需要左侧菜单、是否应通过 `hidden-topnav` 或 `hidden-leftmenu` 固化布局。

- 第 4 批：社区模块入口
  - `src/community-module/alert/alert.vue`
  - `src/community-module/knowledge/knowledge.vue`
  - 目标：验证社区模块路径别名、菜单组件路径和路由注册方式。

- 第 5 批：商业模块入口
  - `src/commercial-module/ai/ai.vue`
  - `src/commercial-module/codehub/codehub.vue`
  - `src/commercial-module/diagram/diagram.vue`
  - `src/commercial-module/dr/dr.vue`
  - `src/commercial-module/fileservice/fileservice.vue`
  - `src/commercial-module/informant/informant.vue`
  - `src/commercial-module/lsbank/lsbank.vue`
  - `src/commercial-module/monitor/monitor.vue`
  - `src/commercial-module/pascbank/pascbank.vue`
  - `src/commercial-module/pbc/pbc.vue`
  - `src/commercial-module/resourcepool/resourcepool.vue`
  - `src/commercial-module/szbank/szbank.vue`
  - `src/commercial-module/tlcbbank/tlcbbank.vue`
  - 目标：在核心模块稳定后，再处理差异更大的商业模块。

## 单模块迁移步骤
1. 打开入口文件，例如 `src/views/pages/cmdb/cmdb.vue`。
2. 找到入口文件中现有的公共布局代码：
   - `TopNav`
   - `LeftMenu`
   - `.centermain`
   - `router-view`
   - `LicenseValidator`
   - `reloadRouter`
   - `menuToggle`
   - `isRouterAlive`
3. 找到该模块自己的左侧菜单组件。
   - 常见路径：`./leftmenu/*-menu.vue`
   - 如果模块没有左侧菜单，仍使用 `ModuleBaseLayout`，但不传 `leftMenu` slot，并在路由 `meta` 或 URL 中验证 `hidden-leftmenu`。
4. 将模板替换为 `ModuleBaseLayout` 包裹形式。
5. 在 `components` 中懒加载 `ModuleBaseLayout` 和模块菜单组件。
6. 删除入口文件中被公共布局接管的重复 `data`、`methods`、`computed`、`components` 引用。
7. 保留模块自己的业务状态、权限判断和页面级逻辑。
8. 如果入口页原来控制权限，把判断结果传给 `:hasAuthorization`。
9. 运行 lint 或至少启动页面做人工回归。
10. 只在当前模块验证通过后，继续迁移下一个模块。

## 标准代码模板
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
    ModuleMenu: () => import('./leftmenu/module-menu')
  }
};
</script>
```

无左侧菜单的模块：

```vue
<template>
  <ModuleBaseLayout></ModuleBaseLayout>
</template>

<script>
export default {
  name: 'ModuleHome',
  components: {
    ModuleBaseLayout: () => import('@/views/components/layout/module-base-layout.vue')
  }
};
</script>
```

带入口权限判断的模块：

```vue
<template>
  <ModuleBaseLayout :hasAuthorization="hasAuthorization">
    <template #leftMenu>
      <ModuleMenu></ModuleMenu>
    </template>
  </ModuleBaseLayout>
</template>
```

## 每个模块的验收项
- 普通入口 URL 能正常打开。
- 顶部导航显示状态与迁移前一致。
- 左侧菜单显示、折叠、选中态与迁移前一致。
- 业务子路由能正常渲染到 `router-view`。
- 如模块显式配置 `keepAliveInclude` / `keepAliveMax`，页面缓存行为不变。
- `reloadRouter` 注入后仍可被子页面调用。
- `LicenseValidator` 仍存在且不会重复渲染。
- `?hidden-topnav=true` 只隐藏顶部导航。
- `?hidden-leftmenu=true` 只隐藏左侧菜单。
- `?hidden-topnav=true&hidden-leftmenu=true` 能全屏显示业务内容。
- 控制台无新增 Vue warning 或路由报错。

## 执行检查命令
重新统计入口模块：

```powershell
$roots = @('src/commercial-module','src/community-module','src/views/pages')
foreach ($root in $roots) {
  $items = Get-ChildItem -Path $root -Directory |
    Where-Object { Test-Path (Join-Path $_.FullName ($_.Name + '.vue')) } |
    Select-Object -ExpandProperty Name
  Write-Output "[$root] $($items.Count)"
  $items | Sort-Object | ForEach-Object { Write-Output "  $_" }
}
```

查找还未迁移到公共布局的入口页：

```powershell
$roots = @('src/commercial-module','src/community-module','src/views/pages')
foreach ($root in $roots) {
  Get-ChildItem -Path $root -Directory | ForEach-Object {
    $entry = Join-Path $_.FullName ($_.Name + '.vue')
    if (Test-Path $entry) {
      $content = Get-Content -Path $entry -Raw
      if ($content -notmatch 'ModuleBaseLayout') {
        Write-Output $entry
      }
    }
  }
}
```

项目级验证：

```bash
npm run lint
```

如需本地人工回归：

```bash
npm run serve
```

## 回滚策略
- 每次只提交一个模块入口迁移。
- 如果迁移后页面布局或路由异常，只回滚当前入口文件。
- 不回滚 `module-base-layout.vue`，除非问题来自公共布局组件本身。
- 回滚后保留问题记录：模块名、入口文件、异常路由、是否涉及 `keepAliveInclude` / `keepAliveMax`、是否涉及 `hidden-topnav` 或 `hidden-leftmenu`。

## 完成标准
- 29 个入口模块全部使用 `ModuleBaseLayout`，或明确记录不迁移原因。
- 未迁移清单命令无输出，或输出项都有备注说明。
- 所有迁移模块通过对应入口页人工回归。
- `npm run lint` 无本次迁移引入的问题。
- 本文档中的模块清单、迁移状态和实际代码保持一致。
## 本次执行结果（2026-07-24）
- 已迁移到 `ModuleBaseLayout`：27 个入口文件。
- 保留未迁移：2 个业务页面。
  - `src/views/pages/license/license.vue`：许可证录入页，本身不是公共入口布局壳，迁移会丢失业务表单。
  - `src/views/pages/login/login.vue`：登录页，本身不是公共入口布局壳，迁移会丢失登录业务流程和主题/语言切换逻辑。
- `src/views/pages/documentonline/documentonline.vue` 已迁移，并通过 `topNav` slot 保留原有自定义顶部导航，通过 `centermainStyle` 保留原内容区域 padding。
- `src/community-module/knowledge/knowledge.vue` 已迁移，并通过 `keepAliveInclude` / `keepAliveMax` 保留原有缓存名单和数量限制。
- 计划中的未迁移清单命令当前只会输出上述 2 个明确不迁移页面。

# router-config 路由配置工具

[router-config.js](./router-config.js) 用于统一读取和合并公共、社区、商业模块的路由与菜单分类配置，让顶部菜单、权限配置页面和模块入口能够取得包含业务扩展的路由数据。

它主要处理两件事：

- **全局查询**：按模块汇总路由和菜单分类，供顶部菜单、菜单权限配置、在线文档目录等使用。
- **模块初始化**：将当前模块的路由、公共路由与业务注册的扩展路由组合起来，供模块入口设置 `MENULIST`；同时提供菜单分类合并方法，供设置 `MENUTYPE`。

这些方法都是同步函数，只返回配置数据。创建 Vue Router 和校验用户权限由其他代码完成；根据业务接口生成动态菜单的用法见 [动态菜单模块接入说明](../store/modules/topMenu.md)。

## 导出方法

| 方法 | 返回值 | 使用场景 |
| --- | --- | --- |
| `getRouterConfig()` | `{ [moduleId]: Route[] }` | 查询所有扫描到的模块路由，并合入注册扩展。 |
| `getModuleRoutes(moduleName)` | `Route[]` | 从全局路由配置中获取一个模块，不存在时返回 `[]`。 |
| `buildMergedRoutes(moduleName, routers = [], commonRouters = [])` | `Route[]` | 模块入口构建当前页面使用的路由列表。 |
| `buildMergedMenuType(moduleName, baseConfig = {}, isExtraFirst = false)` | `{ [分类键]: 分类名称 }` | 模块入口合并自身与扩展的菜单分类。 |
| `geRouterMenuTypeList()` | `Array<{ module, menuType }>` | 汇总全部模块的菜单分类，供顶部菜单按分类分组。 |

`geRouterMenuTypeList` 是当前实际导出名称，使用时需保留这个拼写。

## 1. 查询全部或单个模块的路由

```js
import {
  getRouterConfig,
  getModuleRoutes,
  geRouterMenuTypeList
} from '@/resources/import/router-config.js';

const allRoutes = getRouterConfig();
const cmdbRoutes = getModuleRoutes('cmdb');
const menuTypeList = geRouterMenuTypeList();
```

返回结构示意：

```js
// getRouterConfig()
{
  cmdb: [/* cmdb 路由对象 */],
  knowledge: [/* knowledge 路由对象 */]
}

// geRouterMenuTypeList()
[
  { module: 'cmdb', menuType: { manage: '管理' } },
  { module: 'knowledge', menuType: { overview: '概览' } }
]
```

结果包含原始路由对象及其 `meta`，未按当前用户权限过滤。顶部菜单 Store 会在取得这些数据后，再按 `ismenu`、`authority`、分类名称等条件生成可展示菜单。

现有调用见 [topMenu.js](../store/modules/topMenu.js)、[菜单权限配置](../../views/pages/framework/users/base-menu-mixin.js) 和 [在线文档目录](../../views/pages/documentonline/directory/directory-tree.vue)。

### 路由从哪里来

`getRouterConfig()` 递归扫描以下目录中匹配 `router.js` 结尾的文件，并读取其**默认导出**：

```text
src/views/pages/<模块>/router.js
src/commercial-module/<模块>/router.js
src/community-module/<模块>/router.js
```

路由文件应默认导出数组。汇总时使用相对路径的第一级目录名识别模块，再按 `split('-').pop()` 取最后一段，例如 `neatlogic-web-example` 会对应 `example`。同一模块有多个匹配文件时，后遍历的文件会替换此前的基础数组，应避免依赖这种顺序拆分路由。

取得基础路由后，追加 [ComponentManager](./component-manager.js) 中通过 `registerRouterComponent()` 注册的扩展。

### 公共、社区和商业路由的选择规则

1. 先读取 `views/pages` 中的基础路由。
2. 再按商业目录、社区目录的顺序收集外部基础路由；同名模块由社区配置覆盖此次收集中的商业配置，采用整个数组，不自动拼接。
3. 仅当公共目录没有该模块的配置时，才使用外部基础路由。公共目录导出空数组也会保留该模块，不会因此回退到外部配置。
4. 对结果中已有的模块追加 `ComponentManager` 注册的扩展路由。

因此，商业模块为已有社区模块增加路由时，需要注册扩展，不能只放一个同名 `router.js` 并期待两个基础数组自动合并。

仅调用 `registerRouterComponent()`、但扫描结果中不存在该模块时，`getRouterConfig()` 不会额外创建该模块。新模块仍需提供基础路由文件及相应的模块入口。

## 2. 在模块入口合并路由与菜单分类

模块自身的入口文件已经明确导入了 `routers` 和 `commonRouters`，此时使用 `buildMergedRoutes()`，无需再次查询所有模块：

```js
import routers from './router.js';
import { config } from './config.js';
import commonRouters from '@/views/pages/common/router.js';
import {
  buildMergedRoutes,
  buildMergedMenuType
} from '@/resources/import/router-config.js';

MODULEID = config.module;
MENULIST = buildMergedRoutes(MODULEID, routers, commonRouters);
MENUTYPE = buildMergedMenuType(MODULEID, config);
// 随后由模块原有初始化流程调用 initRouter()。
```

实际使用见 [cmdb.js](../../views/pages/cmdb/cmdb.js)。该示例依赖项目入口已有的全局变量和初始化环境。

`buildMergedRoutes()` 的输出顺序为：公共路由 `commonRouters` → 模块路由 `routers` → 注册扩展路由。该方法不扫描目录，也不根据目录选择社区或商业基础路由；基础数组由调用方显式传入。

### 扩展路由如何去重

`getRouterConfig()` 和 `buildMergedRoutes()` 使用相同的追加规则：扩展路由的非空 `name` 或非空 `path` 与基础数组重复时，该扩展项会被过滤，保留基础路由。

此逻辑只比较扩展与基础数组，不会清理基础数组内部的重复，也不会在追加过程中检查扩展项之间是否重复。业务注册时仍需保证路由 `name`、`path` 唯一。已注册的扩展不能通过复用基础路由名称或路径覆盖基础实现。

### 菜单分类如何合并

`buildMergedMenuType(moduleName, baseConfig, isExtraFirst)` 中的 `baseConfig` 是完整配置对象，例如 `{ module: 'cmdb', menuType: { ... } }`，不是直接传入 `menuType` 字典。返回值则只有合并后的分类字典。

| `isExtraFirst` | 合并顺序 | 同名分类键最终使用 |
| --- | --- | --- |
| `false`（默认） | 基础分类 → 注册扩展分类 | 扩展分类值。 |
| `true` | 注册扩展分类 → 基础分类 | 基础分类值。 |

`isExtraFirst` 控制的是展开合并顺序。传入 `true` 时基础配置最后写入，因此基础配置优先；现有用法见 [approval.js](../../commercial-module/approval/approval.js)。

## 3. 社区或商业模块如何注册附加路由

在业务模块内准备默认导出的路由数组，然后在该模块的 `import.js` 注册。以下以为 `example` 模块增加页面为示意，页面文件、翻译键和权限标识需由业务提供。

```js
// 业务模块的 router.js
import { $t } from '@/resources/init.js';

export default [
  {
    path: '/example-extra',
    name: 'example-extra',
    component: () => import('./pages/example-extra.vue'),
    meta: {
      title: $t('router.example.extra'),
      ismenu: true,
      type: 'extra',
      authority: 'EXAMPLE_BASE'
    }
  }
];
```

```js
// 同一业务模块的 import.js
import ComponentManager from '@/resources/import/component-manager.js';
import routerList from './router.js';
import { $t } from '@/resources/init.js';

ComponentManager.registerRouterComponent({
  example: routerList // 键为目标模块 ID，值为扩展路由数组。
});
ComponentManager.registerMenuTypeConfig({
  example: {
    extra: $t('term.example.extra') // 对应路由 meta.type。
  }
});
```

社区和商业模块的注册方式相同。已有的商业告警扩展可参考 [alert/import.js](../../commercial-module/alert/import.js)。

[公共导入入口](./index.js) 会加载业务 `import.js`。应确保注册发生在调用路由合并方法之前；这些方法按调用时的注册状态计算，不会自动监听后续注册并更新已经赋值的 `MENULIST`、`MENUTYPE`。

## 4. 全局菜单分类如何汇总

`geRouterMenuTypeList()` 扫描公共、商业、社区目录中匹配 `config.js` 结尾的文件，只读取具有 `config` 具名导出、且 `config.module` 有值的配置：

```js
export const config = {
  module: 'example',
  menuType: {
    extra: '扩展功能'
  }
};
```

分类按公共目录 → 商业目录 → 社区目录 → `ComponentManager` 注册配置的顺序合并。不同分类键保留，同名键由后者覆盖，最终返回按模块组织的数组。

它与 `buildMergedMenuType()` 的用途不同：前者汇总全部模块供顶部菜单使用，后者只合并调用方传入的当前模块配置和注册扩展。菜单分类键应与路由的 `meta.type` 对应，否则顶部菜单 Store 无法取得分类名称，可能过滤掉该分组。

配置变更时可依次核对：基础路由是否被扫描或显式传入、附加路由是否已注册、`name`/`path` 是否与基础路由冲突、`meta.type` 是否有对应分类。菜单最终可见性还需查看消费这些配置的权限和展示逻辑。

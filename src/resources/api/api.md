# API 接口合并说明

[api.js](./api.js) 是前端 API 的统一出口，负责将公共接口、社区模块接口和商业模块接口合并为一个对象。页面入口将该对象挂载到 `Vue.prototype.$api` 后，组件即可通过 `this.$api.<模块>.<接口分组>.<方法>()` 调用接口。

这里的“合并”是合并前端接口定义对象，不会合并 HTTP 请求，也不会自动调用接口。

## 1. 接口来源与合并顺序

合并按以下顺序执行：

| 顺序 | 来源 | 加载方式 |
| --- | --- | --- |
| 1 | `src/resources/api` 下的公共模块 | 在 `api.js` 中显式导入各模块的 `index.js`。 |
| 2 | `src/community-module` 下的社区模块 | 使用 `require.context` 递归扫描匹配 `/api.js$/` 的文件。 |
| 3 | `src/commercial-module` 下的商业模块 | 使用 `require.context` 递归扫描匹配 `/api.js$/` 的文件。 |

当前公共模块包括：`autoexec`、`cmdb`、`common`、`dashboard`、`deploy`、`framework`、`globalsearch`、`inspect`、`process`、`report`、`rdm`、`documentonline`。

社区和商业模块文件通过 `default` 导出提供接口对象；没有默认导出或默认导出为假值时，按空对象 `{}` 处理。应使用 `export default { ... }`，仅提供具名导出不会被合入。

同一模块、同一接口分组发生冲突时，后加载的配置覆盖先加载的配置，因此优先级为：**商业模块 > 社区模块 > 公共模块**。

## 2. 模块名称如何确定

扫描社区和商业目录时，以匹配文件相对路径的第一级目录确定模块名，再按 `-` 分隔取最后一段：

```js
const moduleName = apiPath.split('/')[1]?.split('-')?.pop() || apiPath.split('/')[1];
```

例如：

| 文件路径 | 最终模块名 | 调用入口 |
| --- | --- | --- |
| `src/community-module/cmdb/api.js` | `cmdb` | `this.$api.cmdb` |
| `src/community-module/neatlogic-web-cmdb/api.js` | `cmdb` | `this.$api.cmdb` |
| `src/commercial-module/example/api.js` | `example` | `this.$api.example` |
| `src/commercial-module/example/api/api.js` | `example` | `this.$api.example` |

模块名不取自文件导出内容，也不取自嵌套目录。目录名如包含多个 `-`，只保留最后一段，例如 `example-extra` 对应 `extra`。

扫描是递归的，且 `/api.js$/` 并非只精确匹配名为 `api.js` 的文件。建议每个业务模块只保留一个用于汇总接口的 `api.js`，其他接口文件采用明确的业务名称，例如 `extra.js`，避免意外匹配或同一模块被多次合并。不要依赖同一目录来源内多个匹配文件的遍历顺序安排覆盖关系。

## 3. 合并规则：新增模块、追加分组、覆盖分组

核心逻辑如下，社区和商业模块使用相同规则：

```js
const exportValue = apiConfig(apiPath).default || {};
if (moduleApiConfig[moduleName]) {
  moduleApiConfig[moduleName] = Object.assign(moduleApiConfig[moduleName], exportValue);
} else {
  moduleApiConfig[moduleName] = exportValue;
}
```

- **模块不存在**：将整个默认导出作为新模块加入。
- **模块已存在、分组名不同**：保留原分组，追加新分组。
- **模块已存在、分组名相同**：使用后加载的分组整体替换原分组。

`Object.assign` 只做一层浅合并，不会递归合并分组内部的方法。例如：

```js
// 公共模块
cmdb = {
  ci: { search, save },
  citype: { get }
};

// 社区模块的默认导出
{ ci: { customSearch }, extra: { getDetail } }

// 合并结果（结构示意）
cmdb = {
  ci: { customSearch }, // 原 ci.search、ci.save 不再包含在此分组中
  citype: { get },
  extra: { getDetail }
};
```

`Object.assign` 会修改已有模块对象本身。最终 `export default { ...moduleApiConfig }` 只复制最外层属性，不会深拷贝各模块或接口分组。

## 4. 为已有模块追加接口分组

以社区模块为 `cmdb` 增加 `extra` 分组为例：

```text
src/community-module/cmdb/
├── api.js
└── api/
    └── extra.js
```

业务接口文件 `api/extra.js` 按项目现有方式定义请求方法，默认导出接口对象；汇总文件只负责导入、导出分组：

```js
// src/community-module/cmdb/api.js
import extra from './api/extra.js';

export default {
  extra
};
```

如果 `extra` 默认导出中有 `getDetail` 方法，组件调用方式为：

```js
this.$api.cmdb.extra.getDetail(params);
```

商业模块接入方式相同，将目录换为 `src/commercial-module/cmdb` 即可，无需在公共 `api.js` 增加导入，也无需另行注册。

新增独立模块时，例如 `src/commercial-module/example/api.js` 默认导出 `{ extra }`，会自动得到 `this.$api.example.extra`。

## 5. 扩展同名分组时保留公共方法

如果必须向已有 `cmdb.ci` 分组增加方法，需要在业务侧显式展开公共分组，避免浅合并替换后丢失原方法：

```js
// src/community-module/cmdb/api.js
import baseCi from '@/resources/api/cmdb/ci/ci.js';
import extraCi from './api/extra-ci.js';

export default {
  ci: {
    ...baseCi,
    ...extraCi
  }
};
```

此时 `extraCi` 中的同名方法覆盖公共方法，其余公共方法保留。业务接口文件应导入具体公共分组，避免反向导入统一出口 `@/resources/api/api.js` 造成循环依赖。

如果社区和商业模块同时扩展 `ci`，商业模块仍会整体替换社区合并后的 `ci`。仅展开公共分组不会保留社区额外方法；跨来源需要共同保留的方法应明确组合，或采用不同的分组名称。

## 6. 使用入口与异常处理

页面入口的典型用法：

```js
import api from '@/resources/api/api.js';

Vue.prototype.$api = api;
```

现有入口可参考 [cmdb.js](../../views/pages/cmdb/cmdb.js)。非组件代码也可以直接导入该对象后使用 `api.cmdb` 等属性。

社区和商业模块的扫描共用一个 `try/catch`。扫描、加载或合并抛出异常时，会输出 `api.js抛出异常`，并中止该代码块后续处理：例如社区模块加载失败，商业模块扫描也不会继续。此前已经完成的合并结果会保留并参与最终导出。公共模块的静态导入位于该 `try/catch` 之外。

接口未生效时可依次检查：文件是否位于扫描目录、是否匹配文件名规则、是否使用默认导出、目录推导出的模块名是否正确，以及同名分组是否被后加载的配置覆盖。修改扫描文件后如构建未刷新，可重新启动开发服务验证。

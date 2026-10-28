# 社区、商业动态菜单模块接入说明

业务模块需要根据接口数据生成顶部菜单时，在模块内创建 `store/modules/topMenu.js`，**默认导出一个更新函数**。公共 [topMenu.js](./topMenu.js) 会自动发现并调用这个函数，函数通过 `commit('updateMenu', ...)` 写入菜单。

## 1. 创建约定目录下的文件

根据业务模块所属目录，选择其中一种位置：

```text
src/community-module/<模块名>/store/modules/topMenu.js
src/commercial-module/<模块名>/store/modules/topMenu.js
```

社区模块和商业模块使用相同的导出协议。文件建好后，无需修改公共 `topMenu.js`，也无需在 Store 或 `import.js` 中手动注册。

## 2. 默认导出更新函数

以已有的社区知识库为例，文件为 [knowledge/store/modules/topMenu.js](../../../community-module/knowledge/store/modules/topMenu.js)：

```js
import knowledgeApi from '@/community-module/knowledge/api/knowledge/knowledge.js';
import { $t } from '@/resources/init.js';

async function updateKnowledgeMenu({
  commit,
  state,
  forceUpdate = true,
  hasCustomMenuAuthority
} = {}) {
  // 1. 等待模块接口请求。
  await state.gettingModuleList;

  // 2. 找到要更新的模块，并检查缓存、权限。
  const knowledgeModule = state.moduleList.find(item => item.moduleId === 'knowledge');
  if (
    !knowledgeModule ||
    (!forceUpdate && state.dynamicMenu.hasOwnProperty('knowledge')) ||
    !hasCustomMenuAuthority('knowledge', 'knowledge-overview')
  ) {
    return;
  }

  // 3. 获取业务数据。
  const res = await knowledgeApi.updateKnowledgeMenu();
  if (!res.Return || res.Return.length === 0) {
    return;
  }

  // 4. 转换成菜单分组并提交。
  const newMenuGroup = [
    {
      menuTypeName: $t('term.knowledge.knowtype'),
      menuList: res.Return.map(type => ({
        name: type.text,
        path: `/knowledge-overview-${type.value}`,
        icon: 'tsfont-book'
      }))
    }
  ];
  commit('updateMenu', {
    module: knowledgeModule,
    startIndex: 0,
    newMenuGroup
  });
  return res;
}

// 必须默认导出函数，函数名可按业务命名。
export default updateKnowledgeMenu;
```

商业模块也照此编写，将文件放到商业目录，并替换以下内容：

- API 的导入路径和请求方法。
- `moduleId` 及缓存检查使用的模块标识。
- 权限检查对应的路由 `name`。
- 菜单分组名称、接口字段映射、跳转路径和插入位置。

也可以直接写 `export default async function (...) { ... }`。只提供具名导出 `export { updateKnowledgeMenu }`，或默认导出 `{ actions, state }` 这样的 Vuex 模块对象，都不会被当前加载器调用。

## 3. 函数能接收哪些参数

公共入口以一个对象传入参数，按需解构即可：

```js
export default async function ({
  commit, dispatch, state, rootState, forceUpdate, hasCustomMenuAuthority
}) {
  // 业务更新逻辑。
}
```

| 参数 | 用法 |
| --- | --- |
| `commit` | 提交 `updateMenu` mutation，将生成的菜单写入对应模块。 |
| `dispatch` | 调用已有 Vuex action，业务不需要时可不接收。 |
| `state` | 公共 topMenu 的状态；通过 `moduleList` 查模块、`dynamicMenu` 查缓存、`gettingModuleList` 等待模块请求。 |
| `rootState` | 根 Store 状态，可读取用户信息等数据。 |
| `forceUpdate` | 公共入口默认传入 `false`；为 `true` 时，业务函数应跳过缓存判断重新请求。 |
| `hasCustomMenuAuthority(moduleId, routeName)` | 检查目标动态路由权限，第二个参数是路由 `name`，不是 URL。 |

示例函数自己的 `forceUpdate = true` 只在调用方没有传值时生效；经公共入口调用时会收到明确的 `false` 或 `true`。

`hasCustomMenuAuthority` 找不到同名路由或对应路由未配置 `authority` 时默认返回 `true`。需要控制权限时，应确保路由已配置正确权限，并在导出函数中主动检查。

## 4. 如何提交生成的菜单

```js
commit('updateMenu', {
  module,          // state.moduleList 中找到的模块对象。
  startIndex: 0,   // 动态分组在 module.menuGroupList 中的插入/替换位置。
  newMenuGroup: [
    {
      menuTypeName: '分组名称',
      menuList: [
        {
          name: '菜单名称',
          path: '/detail/123',
          icon: 'tsfont-book'
        }
      ]
    }
  ]
});
```

`newMenuGroup` 是分组数组，每组包含 `menuTypeName` 和 `menuList`。菜单项的 `path` 必须是已有路由能匹配的具体路径；部分全局跳转场景还需要同值的 `url` 字段。分组名称可使用 `$t()` 获取。

`startIndex` 为非负数时直接作为数组下标；负数按 `module.menuGroupList.length + startIndex` 计算。首次提交会插入新分组，后续提交会按该模块上次缓存的动态分组数量删除旧分组，再写入新分组；因此多次更新时应保持插入位置对应同一片动态区域。

导出函数的返回值不会被公共入口用于生成菜单。仅 `return newMenuGroup` 不会更新界面，必须调用上述 mutation。也不需要给 `commit` 添加 `topMenu/` 前缀，公共模块未启用命名空间。

## 5. 公共入口如何加载、何时触发

公共 `updateMenu` action 中的加载逻辑如下：

```js
const moduleContexts = [
  require.context('@/community-module/', true, /store\/modules\/topMenu\.js$/),
  require.context('@/commercial-module/', true, /store\/modules\/topMenu\.js$/)
];
const args = { commit, dispatch, state, rootState, forceUpdate, hasCustomMenuAuthority };
moduleContexts.forEach(context => {
  context.keys().forEach(path => {
    const fn = context(path) && context(path).default;
    if (fn && typeof fn === 'function') {
      fn(args);
    }
  });
});
```

顶部应用菜单首次展开时，[topnav-menu.vue](../../../views/components/topnav/topnav-menu.vue) 会调用：

```js
this.$store.dispatch('updateMenu');
```

业务需要主动刷新动态菜单时，例如新增或修改菜单数据后，调用：

```js
this.$store.dispatch('updateMenu', { forceUpdate: true });
```

上述调用会调度公共内置菜单更新和两个目录中的所有动态菜单函数。导出的业务函数不会被自动注册成 Vuex action，例如导出 `updateKnowledgeMenu` 不意味着可以直接 `dispatch('updateKnowledgeMenu')`。

## 接入注意

- 目标模块应已存在于 `state.moduleList`，动态菜单函数只更新模块内菜单，不负责新增顶部模块或注册路由。
- 扫描按社区目录、商业目录的顺序调用函数，两边都会执行，没有同名模块覆盖机制。每个函数应自行检查模块是否存在和是否有权限。
- 缓存按 `moduleId` 保存，同一模块只有一份动态分组记录。应为同一模块确定统一的更新入口，避免社区与商业函数分别提交时相互替换。
- 缓存判断、权限检查、空结果和异常处理都由导出函数实现。上面的知识库示例遇到空结果直接返回，会保留旧菜单；需要清空时应提交 `newMenuGroup: []`。
- 公共入口没有等待各函数返回的 Promise，`await dispatch('updateMenu')` 不表示所有请求已完成，也不能依赖调用顺序推断请求完成顺序。
- `state.gettingModuleList` 仅代表模块接口请求。自定义初始化流程应先 `await store.dispatch('getModuleList')`，再触发 `updateMenu`，确保基础菜单已经提交。

另一个现有实现可参考 [社区告警动态菜单](../../../community-module/alert/store/modules/topMenu.js)。

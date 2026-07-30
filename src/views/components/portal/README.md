# 总工作台组件扩展

公共目录只维护模板、布局、编辑器、权限和组件生命周期。业务组件通过模块自己的
`workbench/provider.js` 注册，系统会自动发现基础、社区和商业模块中的 provider。

## Provider 约定

```js
export default {
  moduleGroup: 'process',
  moduleName: 'IT 服务',
  scopes: ['global', 'module'],
  widgetList: [{
    name: 'processMyTodo',
    version: 1,
    label: '我的待办',
    group: { name: 'process.task', label: 'IT 服务 · 任务处理', sort: 100 },
    defaultLayout: { w: 8, h: 8, minW: 5, minH: 6 },
    dataSource: 'api',
    presentation: {
      type: 'list',
      isRecommended: true
    },
    config: {},
    component: () => import('./widgets/my-todo.vue'),
    configComponent: () => import('./widgets/my-todo-config.vue')
  }]
};
```

- `name` 必须使用“模块标识 + 组件标识”的小驼峰格式并保持全局唯一，例如 `processMyTodo`，不使用 `.` 分隔。
- 同一 `moduleGroup` 可以由基础、社区和商业 provider 共同贡献组件；同名组件冲突时保留
  先注册的基础定义，因此商业扩展必须使用新的全局唯一名称。
- `component`、`configComponent`、挡板数据和正式数据适配均由所属模块维护。
- `dataSource` 标识 `api`、`local` 或 `mock`；`presentation` 只保留展示类型和推荐标记，
  不会保存进模板。编辑器以中间画布中的真实组件作为预览，不维护静态预览数据。
- 编辑器组件库以 `/portal/widget/list/hasauthority` 的返回成员、顺序和展示数据为准。
  接口未返回的 Provider 定义不进入组件库；接口返回但前端未注册实现的组件显示为不可添加。
- 组件库当前只按模块分组并提供搜索；`group` 分类元数据仍用于模块内排序和未来扩展。
- `presentation.type` 支持 `metric`、`distribution`、`ranking`、`comparison`、`list`、
  `progress`、`trend`、`timeline` 和 `shortcut`。
- 通用配置可使用 `configSchema`；复杂组件可提供独立 `configComponent`。
- 配置升级使用 `version` 和 `migrateConfig(config, fromVersion, toVersion)`。
- 保存前校验和序列化分别使用 `validateConfig(config, widget)`、
  `serializeConfig(config, widget)`。
- 挡板组件设置 `dataMode: 'mock'`；只有接口明确返回时才进入组件库，接口失败时不回退
  Provider 或挡板列表。生产环境默认禁用挡板渲染，仅在显式设置 `VUE_APP_WORKBENCH_MOCK=true` 时启用。
- `scopes` 中的 `global` 表示可加入系统总工作台，`module` 表示可加入所属模块工作台。
- 公共组件统一归属 `framework` Provider，只有显式设置 `moduleSafe: true` 才能加入模块工作台；快捷入口和最近访问在
  模块范围内必须按当前模块过滤。
- 总工作台使用 `moduleGroup: "index"`，模块工作台使用实际模块标识。查询模块组件时传入
  `targetModuleGroup`，注册表只返回公共基础组件和目标模块自己的业务组件。

当模块未安装、被禁用或当前用户无模块访问权限时，其 provider 不会进入可添加组件
列表；存量模板中的对应组件由公共 Host 隔离显示为不可用，不影响其他组件。

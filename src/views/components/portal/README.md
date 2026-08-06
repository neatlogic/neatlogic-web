# 总工作台组件扩展

公共目录只维护模板、布局、编辑器、权限和组件生命周期。业务组件通过模块自己的
`workbench/provider.js` 注册，系统会自动发现基础、社区和商业模块中的 provider。
公共组件由 Framework 模块的 `src/views/pages/framework/workbench/provider.js` 注册，门户公共目录不维护业务 Provider。

## Provider 约定

```js
export default {
  moduleGroup: 'process',
  moduleName: 'IT 服务',
  scopes: ['global', 'module'],
  widgetList: [{
    name: 'processingOfMineProcessTask',
    version: 1,
    label: '我的待办',
    group: { name: 'process.task', label: 'IT 服务 · 任务处理', sort: 100 },
    defaultLayout: { w: 8, h: 8, minW: 5, minH: 6 },
    dataSource: 'api',
    presentation: {
      type: 'table',
      previewKey: 'processTask',
      isRecommended: true
    },
    config: {},
    component: () => import('./widgets/components/ProcessTaskList.vue'),
    configComponent: () => import('./widgets/configs/process-task-list-config.vue')
  }]
};
```

- 后台组件列表接口返回的 `name` 是唯一权威值，Provider 的 `name` 必须与其逐字一致；前端不得补模块前缀、
  删除前缀、转换大小写或维护别名。组件名称保持全局唯一且不使用 `.` 分隔，例如
  `processingOfMineProcessTask`、`processFavoriteService`。
- 同一 `moduleGroup` 可以由基础、社区和商业 provider 共同贡献组件；同名组件冲突时保留
  先注册的基础定义，因此商业扩展必须使用新的全局唯一名称。
- `component`、`configComponent` 和正式数据适配均由所属模块维护。
- `dataSource` 标识 `api` 或 `local`；`presentation.type` 选择管理页预览渲染器，
  可选的 `previewKey` 选择对应 Demo 数据和展示变体，`isRecommended` 标识推荐组件。这些字段不会保存进模板。
  编辑器中间画布渲染真实组件；管理页缩略图和完整预览只使用轻量 Demo，不挂载业务组件或请求业务接口。
  完整预览固定按 100% 逻辑尺寸展示，超出区域使用原生纵向滚动条。
- 编辑器组件库以 `/portal/widget/list/hasauthority` 的返回成员、顺序和展示数据为准。
  接口未返回的 Provider 定义不进入组件库；接口返回但前端未注册实现的组件显示为不可添加。
- 组件库当前只按模块分组并提供搜索；`group` 分类元数据仍用于模块内排序和未来扩展。
- 管理页 Demo 预览支持 `table`、`distribution`、`shortcut` 和 `welcome`。未配置 `previewKey` 时使用该类型的通用 Demo；未知类型或前端实现未注册时
  显示明确占位，不使用其他类型的虚假数据替代。
- 通用配置可使用 `configSchema`；复杂组件可提供独立 `configComponent`。
- 组件实例顶层使用 `backgroundTransparent: 0 | 1` 控制卡片背景，默认 `0`（不透明）；该字段只影响当前模板中的当前组件。
- 配置升级使用 `version` 和 `migrateConfig(config, fromVersion, toVersion)`。
- 保存前校验和序列化分别使用 `validateConfig(config, widget)`、
  `serializeConfig(config, widget)`。
- `scopes` 中的 `global` 表示可加入系统总工作台，`module` 表示可加入所属模块工作台。
- 公共组件统一归属 `framework` Provider，只有显式设置 `moduleSafe: true` 才能加入模块工作台；快捷入口在模块范围内
  必须按当前模块过滤。
- 总工作台使用 `moduleGroup: "index"`，模块工作台使用实际模块标识。查询模块组件时传入
  `targetModuleGroup`，注册表只返回公共基础组件和目标模块自己的业务组件。

当模块未安装、被禁用或当前用户无模块访问权限时，其 provider 不会进入可添加组件
列表；存量模板中的对应组件由公共 Host 隔离显示为不可用，不影响其他组件。

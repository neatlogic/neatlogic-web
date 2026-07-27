# IT 服务工作台

IT 服务只维护本模块的工作台路由页、组件定义、展示组件、配置组件和业务数据。网格布局、编辑交互和管理页由 `src/views/components/portal` 提供。

## 目录职责

- `workbench-home.vue`：加载当前启用模板，并通过公共只读工作台展示组件。
- `workbench-edit.vue`：加载和保存模板，组装公共编辑框架的展示、配置插槽。
- `widget-definition.js`：维护组件类型、初始尺寸、默认配置和配置 schema。
- `widgets/components`：维护组件展示、业务数据请求和交互。
- `widgets/configs/widget-config.vue`：根据 schema 渲染统一配置表单。
- `widgets/widget-renderer.vue`：将组件类型映射到展示组件。

## 组件授权

组件管理列表和当前用户可添加的组件均由公共 Portal Widget 接口返回。组件管理列表一次加载当前模块的全部组件，点击“授权”后再加载该组件的授权详情。

编辑页只在左侧组件库中过滤未授权组件，不影响首页或模板中已经存在的组件。接口返回的 `name` 必须与模块组件定义的 `type` 一致。分类使用嵌套的 `group.name/group.label/group.sort`，组内使用组件行的 `sort`；没有分组的组件统一显示在最后的“未分组”中。

## 扩展组件

1. 在 `widgets/components` 新增展示组件，并在该目录的 `index.js` 导出。
2. 在 `widget-definition.js` 注册组件类型、展示组件名、初始尺寸和配置 schema。
3. 通用配置类型由 `widget-config.vue` 渲染；复杂配置可在 `widgets/configs` 中增加模块专属配置组件。
4. 组件业务接口、参数转换和加载状态留在展示组件内，不进入公共工作台。

新建工作台使用空白画布，不提供整套预置布局。尚未接入业务接口的业务组件在组件内部保留一组最小案例数据，并统一标注为后续接口替换点。`favoritedServices` 已在初始化时直接调用 Widget Data 接口，请求参数为 `handler: 'process.favoritedServiceList'`、`portalWidgetName: 'favoritedServices'` 和空的 `param`。

读取存量模板时会过滤已删除类型、重复标识和无效布局组件，保留其余有效组件继续展示；只有用户主动保存模板时，过滤结果才会写回后端。

## 模板接口

路由页直接调用 `$api.common` 下的 Portal 接口。公共 API 会为需要模块隔离的列表和保存请求追加当前 `MODULEID` 作为 `moduleGroup`，组件业务数据不会保存到模板接口。

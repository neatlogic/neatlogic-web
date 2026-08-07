# IT 服务工作台组件

IT 服务模块只维护自己的工作台组件定义、展示组件、配置表单和数据适配逻辑。模板管理、布局编辑、权限过滤及运行时容错由 `src/views/components/portal` 统一提供。

## 目录职责

- `provider.js`：注册 IT 服务组件的名称、分类、默认尺寸、支持范围、权限和异步组件。
- `widgets/components`：维护组件展示、业务数据适配和模块内操作。
- `widgets/configs`：维护组件专属配置表单。
- `widgets/utils/process-widget-constants.js`：集中维护与后台一致的组件名称和 `handler`。

## 扩展组件

1. 在 `widgets/components` 新增独立业务组件。
2. 在 `provider.js` 注册全局唯一名称、分类、默认配置和异步加载入口。
3. 复杂配置通过组件定义的 `configComponent` 指向模块专属配置表单。
4. 业务组件只接入后台正式接口，不得在组件内部保留 mock、测试列表或接口失败后的演示数据回退。
5. Provider 的组件名称必须与 `/portal/widget/list/hasauthority` 返回名称逐字一致；接口未返回的组件不在前端自行补充。

当前正式组件为 `processingOfMineProcessTask`、`draftProcessTask`、`processTaskSearch`、
`processFavoriteService` 和 `personalProcessTaskOverview`。其中待办与草稿共用工单表格和配置实现，仅数据 handler 不同。

`processFavoriteService` 的管理页预览使用 `table/processFavoriteService` 轻量 Demo，保持与编辑画布中的服务列表形态一致。

公共管理页使用的轻量预览 Demo 由公共预览层维护，不属于业务组件数据。公共层不会解析工单、SLA 或服务目录等业务字段；模块组件可复用公共展示积木，但业务权限、数据请求、配置校验和跳转仍由 IT 服务模块负责。

## 国际化

IT 服务工作台的前端兜底标题、说明、配置项、校验和错误消息使用公共 `workbench` 语言命名空间。
工单统一翻译为 `Work Order`，我的待办使用 `My To-Dos`，表头设置使用 `Column Settings`。
接口返回的动态表头、服务名称和 `Message` 不在前端按中文值二次映射；组件名称及 `process.*` handler 始终保持协议原值。

# ResourceTypeTree 重构与逻辑补齐计划

## Summary

将资源类型树抽成公共组件，并补齐它在资产、巡检、监控页面中的状态同步和回显逻辑。目标是：

- 不在每个页面重复维护 `TsFormTree`、树加载、选中同步、展开回显等逻辑。
- 公共组件只负责资源类型树加载、搜索定位、展开/选中、清空选择、输出选中节点及子节点 id 列表。
- 各页面继续负责把树选中结果合并进自己的查询对象，保持现有后端接口参数和页面业务语义不变。
- 父级 `v-model`、路由参数、历史条件恢复、手动点击树节点后的筛选状态保持一致。
- 清空树选择后，同步清空对应列表、分页、选中项和相关操作态，避免旧数据残留。

## Scope

本计划只调整前端公共组件和相关页面状态同步逻辑，不新增或修改后端 API。

目标公共组件：

- `src/resources/components/ResourceTypeTree/index.vue`

目标页面范围：

- CMDB 资产页
- 巡检最新问题页
- 资产巡检页
- 巡检配置文件页
- 监控告警页
- 监控历史告警页
- 监控目标页
- 性能曲线页

`resource-type-tree.vue` 不再作为上述页面的新依赖；如果仍有其他页面引用，可临时保留兼容。

## Public Interfaces

`ResourceTypeTree` 对外接口保持兼容：

- 支持 `v-model` 绑定当前选中 `typeId`。
- props：
  - `title`
  - `placeholder`
  - `emptyText`
  - `autoSelectFirst`
  - `allowClear`
  - `showSearch`
- emits：
  - `change({ selectedId, node, idList, selected })`
  - `load`
- `idList` 表示当前选中节点及其全部子节点 id。
- 支持 `empty` slot，巡检页面可继续展示原设置入口文案。

组件内部增强 `value` 同步，但页面侧仍使用现有 `selectedId/idList/selected` 事件数据。

## Component Changes

### 树加载与搜索

- 内部调用 `$api.cmdb.asset.getResourceTreeType()` 加载资源类型树。
- 顶部使用 `TsFormTree` 搜索定位节点，接口为 `/api/rest/resourcecenter/resourcetype/tree`。
- 主树使用 iview `Tree` 渲染，不继续沿用监控模块递归组件作为页面依赖。
- 搜索选择节点后，同步展开、选中、高亮和 `v-model`。

### v-model 同步

- 增加 `value` 监听：
  - 父组件后续修改 `v-model` 时，同步 `currentValue`、搜索框值和 `Tree.selected`。
  - 如果新值为空，清空选中态，但避免重复触发无意义查询。
  - 如果树数据尚未加载，加载完成后继续按当前 `value` 回显。
- 支持 `autoSelectFirst=false` 时不自动选中。
- 支持再次点击已选节点后按现有语义清空选择。

### 选择输出

- 选择普通节点时触发 `change`，输出：
  - `selectedId`：当前选中节点 id。
  - `node`：当前选中节点。
  - `idList`：当前节点及全部子节点 id。
  - `selected`：当前是否处于选中状态。
- 清空选择时同步输出空选择状态，页面按各自规则清空查询条件或列表数据。

## Page Changes

### 巡检与资产页面

- `recent-issues.vue`、`assets-inspection-manage.vue`、`configfile-manage.vue`：
  - 选中资源类型后写入对应 `typeId`。
  - 与已有 `searchVal/searchValue/searchParam` 合并后查询。
  - 无 `typeId` 时清空表格数据，避免旧数据残留。
- CMDB 资产页：
  - 清空 `selectType.typeId` 时，同步清空表格、选中资产、分页总数和相关操作态。
- 资产巡检页：
  - 保持现有清空逻辑不变，只做与公共组件接入后的一致性校验。
- 没有资源类型树时，仍显示原设置入口。

### 监控页面

- `alert-all-manage.vue`：
  - 选中后写入 `searchValue.targetTypeIdList = idList`。
  - 从路由 `targetTypeId` 进入时，按树节点展开成包含子节点的 `targetTypeIdList`，与手动点击父节点一致。
  - 保存并恢复 `selectedTypeNodeId`，确保历史或路由回显后左侧树高亮与实际筛选值一致。
  - 接入公共组件后继续传入 `emptyText="$t('term.monitor.currentNoCatalogData')"`，保留原监控目录空态文案。
- `alert-history-manage.vue`：
  - 保存并恢复 `selectedTypeNodeId`。
  - 继续使用单个 `targetTypeId`，因为当前接口字段是单值筛选。
  - 接入公共组件后继续传入 `emptyText="$t('term.monitor.currentNoCatalogData')"`，保留原监控目录空态文案。
- `target-manage.vue`：
  - 选中后写入 `searchValue.typeIds = idList`。
  - 与原目标筛选条件一起搜索。
  - 保持点击父节点时请求包含子节点 id 列表。
  - 接入公共组件后继续传入 `emptyText="$t('term.monitor.currentNoCatalogData')"`，保留原监控目录空态文案。
- 再修改顶部搜索条件时，树筛选条件按现有页面规则保留或清空，不改变当前业务语义。

### 性能曲线页面

- `scope-chart-manage.vue`：
  - 只使用 `selectedId` 加载当前节点曲线。
  - 不使用子节点列表。
  - 搜索并选择节点后只加载当前节点曲线。
  - 接入公共组件后使用 `empty` slot 继续渲染原 `<NoData :text="$t('term.monitor.currentNoCatalogData')"></NoData>` 空态，保留原性能曲线页面空态组件和文案。

## Test Plan

### 组件验证

- 首次加载时默认选中行为符合页面配置。
- `autoSelectFirst=false` 时不自动选中。
- 点击同一节点可清空选择。
- 父组件异步写入 `v-model` 后，树搜索框、树节点高亮、展开状态同步。
- 树数据晚于 `value` 加载完成时，仍能正确回显选中节点。

### 巡检与资产页面验证

- 巡检最新问题、资产巡检、配置文件页面：
  - 输入关键字搜索树节点，选择后表格按新 `typeId` 和已有 CombineSearcher 条件一起刷新。
  - 历史条件恢复后，树节点保持选中并展开。
  - 没有资源类型树时仍显示原设置入口。
- CMDB 资产页、巡检配置文件页、近期问题页：
  - 选中类型后有数据。
  - 再次点击清空后表格为空，分页和选中项不残留。

### 监控页面验证

- `target-manage`、`alert-all`：
  - 点击父节点时请求参数包含该节点及子节点 id 列表。
  - 修改顶部筛选条件时，树筛选条件按现有页面规则保留或清空。
- `alert-all?targetTypeId=xxx`：
  - 从路由进入时筛选范围与手动点击同一节点一致。
  - 历史恢复后，树高亮与实际请求参数一致。
- `alert-history`：
  - 路由和历史回显仍按单个目标类型筛选。
  - 不改为列表筛选。
- 监控目标类型树无数据时：
  - `alert-all`、`alert-history`、`target-manage` 均显示原 `term.monitor.currentNoCatalogData` 文案，而不是公共默认 `page.nodata`。
  - `scope-chart` 继续使用原 `NoData` 组件展示 `term.monitor.currentNoCatalogData` 文案。

### 性能曲线验证

- 搜索并选择节点后只加载当前节点曲线。
- 再次点击已选节点按现有行为清空选择。

### 静态检查

- 运行针对改动 Vue 文件的 lint 检查。
- 不使用 `--fix` 做全项目格式化。
- 如果项目脚本不可用，至少用页面级搜索确认没有遗漏旧字段或重复触发逻辑。

## Assumptions

- “选中之后和之前的搜索条件合并”指合并到请求 payload，不需要把树条件显示进 CombineSearcher 标签。
- 保持现有页面筛选语义：
  - 巡检类页面使用单个 `typeId`。
  - `alert-all` 和 `target-manage` 使用包含子节点的 id 列表。
  - `alert-history` 使用单个 `targetTypeId`。
  - 性能曲线使用单个节点 id。
- 父节点筛选在 `alert-all` 和 `target-manage` 中应包含子节点，这是按当前手动点击树的行为作为标准。
- 当前工作区可能已有未提交改动，实施时只修改本计划相关文件，不回滚无关变更。

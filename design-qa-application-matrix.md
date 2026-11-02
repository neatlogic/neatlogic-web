# 应用清单矩阵与独立详情页验收记录

日期：2026-11-02。状态：实现与本地验证通过，待用户验收；未提交、未部署。本记录替代先前右侧详情栏的验收结论，最终交互以用户选定的效果 3 为准。

## 本次结果

矩阵不再包含右侧详情栏。点击应用或模块进入 `application-overview` 独立页面；该页不包含应用模块树，保留产品全局导航，顶部展示真实应用与模块信息、固定系统总览卡片、可横向滚动的模块卡片及可搜索模块选择器，下方完整宽度展示原资产清单和信息页签。原列表模式继续使用原应用模块树、详情和管理流程。

## 复用与变更文件

新增组件：

- `src/views/pages/cmdb/application/application-overview.vue`：独立页面，负责可见范围核对、系统与模块范围、刷新和原编辑弹窗接入。
- `src/views/pages/cmdb/application/application-module-switcher.vue`：独立可复用导航组件，输入模块列表及当前 ID，输出选择事件；固定系统入口，仅模块带横向滚动。
- `src/views/pages/cmdb/application/application-detail.vue`：复用 AssetsManage、既有 AppInfo、ModuleInfo，表格继续使用 TsTable。
- `src/views/pages/cmdb/application/application-matrix.vue`、`application-matrix-loader.js`：应用分页和模块展示，四请求并发、局部重试、缓存与竞态隔离；增加返回所需的界面状态及从新数据恢复真实选中对象。

修改文件：

- `src/views/pages/cmdb/application/application-manage.vue`：矩阵入口、显示模式、共享选择和框架历史恢复；移除矩阵右栏。原列表点击不跳转新页。
- `src/views/pages/cmdb/application/app-module-tree.vue`：真实选中项定位，保持搜索分页，默认行为保持兼容。
- `src/views/pages/cmdb/application/assets-manage.vue`：之前阶段增加的可选 compact 布局，默认 false；本次二级页未启用紧凑模式。
- `src/views/pages/cmdb/router.js`：CMDB 独立详情路由，沿用 RESOURCECENTER_APP_VIEW。
- `src/commercial-module/dr/router.js`：独立仓库内增加同一组件路由，沿用 DR_BASE 和 moduleName: dr，避免复用入口失效。
- `src/resources/api/cmdb/resource/applicationManage/applicationManage.js`：封装现有应用可见列表接口，未新增后端。
- `src/resources/assets/languages/term/zh.json`、`en.json`：界面中英文。

未更改后端、数据库和用户已有 apiconfig.json；之前暂停的 Informant 匹配调整保持原状，不属于本交付。

## 视觉依据和截图

效果 3 来源：`/Users/chenqiwei/.codex/generated_images/01a19a58-8835-7223-aea8-4af886e0b608/exec-a7cf2d0e-8204-4121-a262-80cd720e0a8c.png`，1774 × 887。

实际入口：`http://localhost:3000/develop/cmdb.html#/application-manage`，Chrome 既有登录用户、真实 develop 租户数据。实际截图为 1920 × 797，未缩放：

- 系统总览：`/Users/chenqiwei/.codex/visualizations/2026/11/02/01a19a58-8835-7223-aea8-4af886e0b608/application-overview-system.png`。
- PAYADM 模块浅色资产：同目录 `application-overview-light.png`。
- PAYADM 模块深色资产：同目录 `application-overview-dark.png`。

参考图和浅深截图已在同次图像检查中一起查看。核对顶部身份、系统卡片、模块带、选中态、范围说明、完整宽度资产区域及环境按钮。采用产品现有字号、间距、页签和权限操作样式；原全局导航占用的空间计入比较，不作像素一致声明。参考图中的所属部门、示例负责人等未从简单列表接口返回的字段不伪造，完整属性由原信息页签读取。

没有阻断本次范围的 P0/P1/P2 视觉问题。深色品牌图片存在原有资源缺失，位置在全局导航，本次不修改。

## 实际登录浏览器验证

- 矩阵点击 PAYADM 进入独立详情，显示真实系统、模块和资产；不再占用右侧窄栏。
- PAYADM → GSDADT → 系统总览 → PAYADM；路由与资产范围同步，GSDADT 不显示 PAYADM 的 OS 资源。
- 全部模块选择器按简称 PAY 检索并选中聚合支付，切换到真实模块。
- 系统总览显示应用信息页签，模块范围显示模块信息页签；模块信息读取真实简称、名称、状态和负责人。
- 环境从所有环境切 DEV 后不显示 PRD OS，切 PRD 后恢复对应 OS。
- 连续范围切换后，标准返回直接回到矩阵；ANPP 搜索条件保留。
- 返回矩阵再切列表，树定位 PAYADM，原列表资产及管理操作恢复。
- 编辑模块弹窗按真实实体打开，显示 PAYADM，取消后回到当前阅读范围；未保存。
- 浅色与深色检查完毕后恢复原明亮模式。
- 最终重新进入详情及切换系统总览，未产生新增错误日志。

## 修复与独立回归

浏览器检查发现并已修复：

1. 返回矩阵后再切列表，树静默定位完成但父页真实实体未同步，造成详情空白。现在从当前页新数据恢复上下文，列表定位后同步真实实体，浏览器复查通过。
2. 框架以完整路径维护返回栈，单用 router.replace 仍会累计模块切换；改为沿用 $skipHistory，清除 isBack，同范围不导航。实际标准返回直接到应用清单。
3. 首次异步组件未挂载时切换模式可能访问空引用；增加组件就绪和当前模式检查，初始化仍依赖原输入值。独立回归覆盖无引用初始化。

验证通过：

- 所有本次变更 Vue/JS 的 ESLint。
- 七个相关 Vue 模板、脚本和 Less 编译，中英 JSON 解析。
- 两个前端仓库 git diff --check。
- `node scripts/test-cmdb-application-matrix.cjs`：并发上限、旧队列、缓存失效竞态、重试、列表竞态、12 模块展开、静默恢复、新实体上下文、用户模式隔离、未挂载切换、编辑删除刷新替身。
- `/tmp/application-overview-verify.cjs`：可见范围拦截、大 ID 保留、无效及其他系统模块、旧响应隔离、同范围不导航、历史跳过和编辑权限。
- `/tmp/application-overview-parent-verify.cjs`：路由跳转前保存框架历史、模块作用域、大 ID、搜索、页码、展开、滚动状态及隐藏树覆盖防护。

测试脚本遵循仓库已有 scripts/test-* 忽略规则，本地保留。开发服务实际编译并渲染了新页面；未执行全量生产打包。

## 风险和待验收

- 未对真实业务数据执行新增、编辑保存或删除，保存及删除刷新分支采用替身验证。
- DR 新路由已静态验证，尚未进入 DR 实际登录页面验收。
- 超过 12 个模块、网络失败和极端长名称由独立回归或代码检查覆盖，未在真实租户构造数据。
- 本轮二级页返回的搜索、选择及原列表详情已现场核对；多页滚动及展开状态恢复通过独立回归，完整现场检查仍可作为人工验收项目。
- 本阶段不包含告警冒泡、异常检索、拓扑和自动修复。

## 后续调整：顶部右侧控件

按用户红框要求，将列表／矩阵切换、刷新和矩阵应用名称搜索统一放入 application-manage.vue 的 topRight，移除矩阵内容区搜索。沿用 action-group、action-item 和 InputSearcher 的宽度能力，未新增页面样式。搜索输入由父页持有，矩阵读取同一关键词，框架返回时同时恢复顶部输入和矩阵条件。

实际浏览器验证：顶部右侧排列；ANPP 搜索；进入模块二级页后返回保持 ANPP；清空后恢复其他应用；列表／矩阵切换；浅深主题。主题已恢复明亮模式。ESLint、两个 Vue 模板编译、原矩阵独立回归和 git diff --check 通过。

截图：`/Users/chenqiwei/.codex/visualizations/2026/11/02/01a19a58-8835-7223-aea8-4af886e0b608/application-matrix-topright-light.png`，深色为同目录 application-matrix-topright-dark.png。

## 后续调整：分离一级浏览与二级管理

最终交互采用用户提出的后一种方式：一级矩阵无选中态，应用和模块卡片点击仅跳转二级页面；不改变原列表的选择。一级矩阵不再显示编辑、删除入口，新增模块不预填隐藏列表中的旧应用。二级页保留范围选中，明确显示编辑／删除应用或编辑／删除模块，均沿用 RESOURCECENTER_MODIFY 权限及既有弹窗。原列表模式的选择、详情和管理入口保留。

本轮修改 application-matrix.vue、application-manage.vue、application-overview.vue 和中英 term 资源。移除矩阵选择 API、选中样式、aria-pressed、v-model 和父页联动选择，仅保留 open 跳转事件。二级页复用 DeleteCiEntityDialog，取消或仅创建删除事务不跳转，模块删除并提交后回系统总览并重读，应用删除并提交后走标准返回；直接打开页面无返回记录时转应用清单。上述最终交互替代本记录前文有关矩阵选中同步的描述。

实际登录验证：模块点击进入详情；删除模块弹窗打开并取消；编辑模块弹窗打开并取消；切到系统总览显示编辑应用和删除应用；返回后矩阵无选中样式、无 aria-pressed、无编辑删除入口；原列表选择 ANPP 后仍有编辑删除入口；浅深主题正常并恢复明亮模式；最终复查无新增页面错误。没有执行真实保存或删除。

独立回归验证矩阵只发出 open、不改变列表选择；保留搜索分页展开和滚动历史；删除权限、取消、模块删除后刷新及应用删除后的返回与无历史回退。原并发、缓存、竞态及范围校验回归通过。三文件 ESLint、模板／脚本／Less 编译、中英资源解析和 git diff --check 通过。

截图在相同验收目录：application-matrix-browse-light.png、application-matrix-browse-dark.png、application-overview-module-actions.png。真实删除成功后的服务端行为未现场执行，客户端后续分支由替身验证，等待用户验收。

## 后续调整：移除重复下拉与恢复默认页签

application-module-switcher.vue 移除模块下拉选择器及其注册和专属样式，仅保留系统总览与模块卡片，横向模块带自动占用剩余空间。application-detail.vue 新增默认开启的 blockTabs 属性保留原列表外观，application-overview.vue 明确关闭该属性，二级页不使用 block-tabs，恢复 Tabs 默认样式；原代码没有 type="card"，卡片外观实际由 block-tabs 公共样式提供。未修改公共 Tabs 样式。

本轮 ESLint、三个组件模板及模块切换组件 Less 编译、git diff --check 通过。Chrome 被另一扩展面板阻止自动操作，本轮无法完成真实页面的浅深主题和卡片切换复查；前文截图均早于此次调整，不能作为本轮最终视觉证据。本轮状态为待页面复查、待用户验收。

## 后续调整：列表默认自动选中

默认列表继续自动选中第一个应用并显示详情；已有选择时恢复原应用或模块，矩阵仍无选中态。app-module-tree.vue 的 restoreSelection 在应用清单上下文且禁止反选时，即使没有 appId 也运行原 reSelectNode 规则，修复从矩阵切回列表时空选择被静默保留的问题。其他允许反选的树不受此分支影响。

独立回归使用真实树脚本验证首次数据加载自动选中首项、空选择恢复自动选中首项、保留已有选择及允许反选时仍可为空；原矩阵回归、ESLint 和 git diff --check 通过。当前登录页可读取到列表资产，但刷新及点击仍被 Chrome 扩展面板阻止，不能据此声称本轮完整浏览器复查通过。

## 后续调整：图标按钮切换模式

application-manage.vue 参考 cientity-manage 的 button 单选按钮组及 tsfont-blocklist／tsfont-list 图标，使用内部 TsFormRadio 的 radioType="button" 和 label 插槽实现，位置仍为 topRight。矩阵按钮在左、列表按钮在右，移除文字标签，Tooltip 分别说明浏览和管理方式，并补充中英资源。沿用原模式记忆与 changeViewMode，没有新增局部样式。

本轮 ESLint、模板和中英 JSON 检查、原矩阵独立回归及 git diff --check 通过。实际登录页面已验证图标切换、列表自动选中和浅深主题；Tooltip 文案已在实际渲染的提示节点中核对。截图为相同验收目录 application-mode-icons-light.png 和 application-mode-icons-dark.png。

之前被扩展阻挡的二级页检查本轮补齐：模块选择器数量为 0；PAYADM／GSDADT／系统总览卡片切换及查询参数正确；二级页 Tabs 类名为 ivu-tabs ivu-tabs-no-animation，没有 block-tabs 卡片样式。截图 application-overview-default-tabs.png。主题已恢复明亮模式，仍未执行真实保存或删除。

## 后续调整：移除一级刷新并接入组合搜索

application-manage.vue 移除一级顶部刷新按钮，将矩阵 InputSearcher 换成现有 CombineSearcher，宽度由 240px 调整为 480px，使用组件自身 width 属性，未增加页面样式。当前仅使用原有应用名称关键词查询，不增加尚未支持的高级条件。父页保存完整搜索条件对象，进入详情返回时恢复条件和标签，兼容此前仅含 keyword 的历史数据；原列表树搜索保持原样，二级页刷新入口保持原样。

实际返回检查发现公共 CombineSearcher 的 updateVal 使用普通赋值添加初始关键词，Vue 2 无法感知新属性，导致结果已过滤而条件标签未显示。组件中仅将该处替换为 $set 并补充中文说明，没有修改其他搜索行为；独立回归验证初始回显触发响应式更新、清除及再次恢复。修改文件为 application-manage.vue、src/resources/components/CombineSearcher/CombineSearcher.vue 和本记录。

ESLint、两个组件模板编译、原矩阵及父页历史回归、组合搜索响应式回归、git diff --check 通过。实际登录验证 ANPP 名称查询、标签回显、从模块详情返回后条件及单系统结果保持、删除标签后恢复其他应用、搜索框实际宽度 480px、顶部刷新数量为 0，并完成浅深主题检查，已恢复明亮模式。截图同验收目录 application-combine-search-light.png、application-combine-search-dark.png。本轮没有修改业务数据或部署，复杂条件查询仍待后续设计。

final result: passed

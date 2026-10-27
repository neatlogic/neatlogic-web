# 流程编辑表单组件引用分阶段改造

## 目标与适用规则

流程编辑中，**直接取自表单组件接口**的组件和表格列引用，选择框统一使用用户在表单编辑时填写的 `key` 回显；用户选中组件时，从当前接口结果取得其 `uuid` 与 `key`，配置中同时保留两者。旧配置由后端根据已保存的 UUID 补回 key，前端用补回的 key 回显。后续阶段不引入 `formReferenceVersion` 等版本标记；数据转换节点待最后实施时再按此规则调整。

- 每阶段只改表中指定的节点或公共配置。开始下一阶段前确认字段结构、表单标签来源及接口实际返回的 `uuid`、`key`；阶段完成后核对配置 JSON 和验收项，再询问是否继续。
- 只有表单接口返回的组件及表格列执行双存。CMDB 属性、配置项、流程节点、表单本身、模板、作业、用户组、矩阵及其他独立接口的 ID/UUID 按原语义保留。
- 选择框和相关联动按 key 工作。选择时从**当前表单场景/标签的接口结果**同步 UUID/key，保存时提交配对字段；不把 key 写进 UUID 字段，也不从标签、显示文案或过期快照推算。
- 初始化只使用配置接口返回的 key，前端不根据旧 UUID 反查或补写 key；旧数据补 key 由后端统一处理。接口尚未补 key 的引用保留原值并在保存时提示修复，不自动清空。
- 列表刷新和场景切换不能仅凭同名 key 自动改写已有 UUID；旧引用由用户重新选择后才更新配对字段。
- 已失效的引用在编辑草稿中保留原值；缺 key、重复 key、组件或列不存在、接口读取失败时不能静默替换或清空。统一在保存时校验；用户可重新选择或明确删除对应配置。关闭弹窗不提交清理结果。
- 同名列必须按所属表格定位；隐藏字段保留 `#` 后缀，只转换组件前缀。常量、流程参数及其他非表单映射不转换。
- 所有提示沿用项目 i18n 规范；不为同一问题增加重复的字段下方提示。商业版目录 `src/commercial-module` 被 `.gitignore` 忽略，提交时需显式加入本次修改的文件。

## 阶段清单

| 阶段 | 状态 | 修改范围 | 本阶段验收标准 |
| --- | --- | --- | --- |
| 1. 工单集合节点 | 前端已完成；待服务端联调 | `src/commercial-module/process/pages/flow/node/collection/collection-setting.vue`、`collection-handler.js`；仅标签映射 `tagList[].formItemUuid` / `formItemKey`。 | 旧值按 key 回显；选择组件时立即更新匹配的 UUID/key，保存直接提交；缺失或重复的组件引用在流程保存时拦截；模板 ID、标签名和独立接口字段不变。 |
| 2. 定时节点 | 前端已完成；待服务端联调 | `src/views/pages/process/flow/flowedit/components/timer-node.vue`、`timer-form-reference.js`、`src/views/pages/process/flow/floweditor/element/components/element/timer-handler.js`；时间表单组件 `attributeUuid` / `attributeKey`。 | 当前场景内必填日期组件按 key 显示；选择时同步双字段，保存直接提交；切换场景后失效引用保持可见并在保存时拦截，校验过程不直接清空旧值；`formSceneUuid` 不转换。 |
| 3. 公共分配设置 | 前端已完成；待界面及服务端联调 | `src/views/pages/process/flow/flowedit/components/nodesetting/assign-setting.vue`、`src/views/pages/process/flow/floweditor/element/components/element/base/assign-valid.js`；“表单值”处理人策略的 `attributeUuidList` / `attributeKeyList`。自动分派器内部字段已在第 4 阶段处理。 | 多选组件按 key 回显并成对保存；校验不删除旧配置；节点 UUID、处理人、组、其他分派策略不转换。所有使用公共分配设置的节点回归。 |
| 4. 公共分派器 | 前端已完成；待界面及服务端联调 | `src/views/pages/process/flow/flowedit/components/nodesetting/dispatcher/default/`、`dispatcher/cmdb/` 及公共保存校验；默认分派器 `type=formselect` 字段和 CMDB 分派器 `filterList[].formAttributeUuid` / `formAttributeKey`。 | 表单侧按 key 回显并双存；CMDB `filterList[].key` 仍为 CMDB 属性标识，优先级、视图、处理人等独立接口值不变；失效映射在保存时拦截。 |
| 5. 自动执行节点 | 按要求跳过；本轮不实施 | `src/views/pages/process/flow/flowedit/components/autoexec/setting/`；`autoexec-config.vue`、`joppolicy/` 中的单条/批量数据源、筛选、关联、普通/表格组件与表达式。 | 若以后单独实施：普通、批量及表达式映射按所属表格/标签准确双存；切换执行策略不误删其他映射；作业、执行器、CMDB 等独立标识不变；旧配置与保存 JSON 回归。 |
| 6. 商业版 EOA 节点 | 前端已完成；待界面及服务端联调 | `src/commercial-module/process/pages/flow/node/eoa/`；`edit-template-dialog.vue` 中模板步骤处理人的表单模式引用及保存校验。`workerdispatcher/` 复用第 4 阶段完成的公共分派器，不重复修改。 | 表单处理人映射按 key 回显，选择时 `valueList` / `valueKeyList` 双存；人员、模板和流程节点 UUID 保持原语义；多选、旧值、失效值与保存校验通过。 |
| 7. 商业版子流程映射核查 | 前端核查完成；现有文案映射不修改，待后端确认执行契约 | `src/commercial-module/process/pages/flow/node/subprocess/edit-formmapping-dialog.vue` 及其保存入口。当前 `formMapping` 以子表单和父表单的**标签文案**为键/值，并非 UUID 字段。 | 已核对前端保存结构与接口来源；若后端仍按文案映射，则不套用 UUID/key 双存；若后端改为组件引用，再单独制定字段及迁移、回显、保存验收。子流程渠道 UUID 不转换。 |
| 8. 商业版架构图节点 | 前端已完成；待界面及服务端联调 | `src/commercial-module/diagram/pages/flow/node/diagram/`；应用系统关联 `ciEntityIdMappingFormAttributeUuid/Key`、需求关联 `requestMappingFormAttributeUuid/Key`、联动必填规则 `formItemUuid/Key`。 | 选择按 key 回显并同步保存 UUID/key；旧配置由后端补 key；缺失、重复或不配对的引用在保存时拦截，不自动清空；目录 ID、模板状态 ID、规则行 UUID 和规则值保持原样。 |
| 9. 同步配置项节点 | 前端已完成；待界面及服务端联调 | `src/views/pages/cmdb/flow/node/cientitysync.vue`、`cientitysync-form-reference.js` 与 `src/views/pages/process/flow/floweditor/element/components/element/cientitysync-handler.js`；所选表单组件的 `handlerList` UUID 列表与新增的 `handlerKeyList`。选项由流程表单接口返回，包含旧表单的 `formcientityselector` 与新表单的 `formcientitymodify`。 | 按 key 多选回显，选择时同步保存 UUID/key；跨同类节点的组件排除继续按 UUID 工作；组件失效时流程校验只报错，不清空原 `handlerList`；表单 UUID、CMDB 配置项及公共分配设置不重复转换。 |
| 10. 创建作业节点 | 待执行；此前改动已撤销 | `src/views/pages/process/flow/flowedit/components/createjob/`；`createjob-config.vue`、`autoexecservice-createjob-config.vue`、`filter-list.vue`、`params/` 中由表单接口取得的普通组件、表格/列、批量源、表达式和参数映射。 | 每个表单标签使用对应目录；组件及列双存并按 key 回显；自动执行服务组件不与其他配置重复选用；常量、作业参数、运行参数不转换；旧配置与保存 JSON 回归。 |
| 11. 数据转换节点 | 待执行；新增 key 的改动已撤销，排在最后一个节点阶段 | `src/commercial-module/process/pages/flow/node/dataconversion/`。批量数据源、筛选、关联表与列、普通/表格组件映射、表达式、隐藏字段；只转换表单引用，`mappingList[].key` 仍是目标 CMDB 属性。 | 旧配置经接口补 key 后能回显；新配置提交组件/列 UUID 与 key 成对字段，不引入 `formReferenceVersion`；多标签、同名列、失效引用、替换与明确删除均正确；取消不改节点配置。 |
| 12. 全流程回归与联调 | 待执行 | 流程基础设置、各节点保存入口、表单场景/标签切换、服务端执行接口。基础设置中的关联表单 UUID 属于表单自身标识，不按组件 key 转换；只处理检查中证实的组件引用。 | 新旧配置均可打开、编辑、保存、重新打开；服务端能读取双字段并执行；未编辑的有效配置不丢失；接口失败不当作引用失效；普通版和商业版节点回归。 |

## 每阶段执行与交付记录

每阶段记录以下内容，未满足验收标准时保持“进行中”，不开始下一阶段：

1. **范围核对**：列出实际字段、所属表单场景/标签、接口来源，以及应保持原样的非表单标识。
2. **实现**：读取接口补回的 key，按 key 回显；用户选择时从当前接口目录同步 UUID/key，提交时保留这对字段；只在成功保存后更新节点配置。
3. **验证**：检查旧配置、新配置、组件/列缺失和重复、替换、明确删除、取消、接口失败；核对提交 JSON，并运行受影响文件的静态检查。
4. **交付**：写明已修改文件、验证结果、待服务端联调项；询问用户是否开始下一阶段。

### 已完成记录

| 阶段 | 本次前端结果 | 已做验证 | 未完成项 |
| --- | --- | --- | --- |
| 1. 工单集合节点 | 标签映射按 key 回显；选择时同步 `formItemUuid` / `formItemKey`，保存直接提交，流程保存时校验配对；初始化不再反查旧 UUID。 | 旧值回显、更换组件和双字段输出的逻辑用例；受影响文件 ESLint 通过。 | 核对实际接口返回结构及服务端工单集合执行。 |
| 2. 定时节点 | 时间组件按 key 回显；选择时同步 `attributeUuid` / `attributeKey`，保存直接提交；场景列表与流程校验不再清空旧引用；初始化不再反查旧 UUID。 | 默认/其他场景、旧值、缺失和重复 key、保存双字段及只读校验的逻辑用例；受影响文件 ESLint 通过。 | 核对实际表单场景数据及服务端定时节点执行。 |
| 3. 公共分配设置 | “表单值”多选按 key 回显，选择时同步有序的 `attributeUuidList` / `attributeKeyList`；刷新组件列表不删旧值，流程校验只读。 | 表单选项、双字段顺序、缺 key、重复 key 和接口列表为空的逻辑用例；受影响文件 ESLint 与 `git diff --check` 通过。 | 在共用该设置的节点界面核对回显与保存 JSON；服务端补 key 及执行联调。 |
| 4. 公共分派器 | 默认分派器的 `type=formselect` 字段按 key 回显并在重新选择时同步 UUID/key；配对 key 字段将原字段名的 `Uuid` 后缀换成 `Key`，其他名称追加 `Key`。CMDB 筛选映射增加 `formAttributeKey`；初始化保留未补 key 的旧值，校验只读。 | 默认及 CMDB 选择、双字段输出、缺 key、重复 key、空组件列表与旧值保留的逻辑用例；受影响文件 ESLint 与 `git diff --check` 通过。 | 与服务端确认动态分派器 key 字段命名，并在节点界面核对保存 JSON、失效引用与执行结果。 |
| 6. 商业版 EOA 节点 | 模板步骤处理人 `mappingMode=form` 按 key 回显；选择时同步原 `valueList` UUID 与新增 `valueKeyList`，旧值缺 key 时保持 UUID 原样显示。弹窗按当前表单标签目录核对配对，流程保存时检查双字段结构；公共分派器沿用第 4 阶段实现。 | 单选、多选、旧值缺 key、同 key 重复、组件缺失、非表单模式的逻辑用例；受影响文件 ESLint 与 `git diff --check` 通过。 | 核对真实表单标签接口返回及后端 `valueKeyList` 字段契约；在页面验证保存 JSON、重开回显、取消和服务端 EOA 执行。 |
| 7. 商业版子流程映射核查 | `channelList[].formMapping` 保存 `{子表单组件标签文案: 父表单组件标签文案}`，子表单字段来自 `channelForm` 独立接口，父表单选项来自 `store.allFormitemList`，但选择器的实际值和保存值均为 `label`。渠道 UUID 是渠道标识。按现有结构不新增组件 UUID/key 字段，也不改变旧配置。 | 核对 `edit-formmapping-dialog.vue` 的选择、自动匹配、`subprocess-setting.vue` 的 `getData()` 与节点 `saveNodeData()` 保存链路；本阶段无代码修改。 | 本地未发现服务端执行代码；需后端确认是否继续按标签文案解析。若契约改为组件标识，另立迁移阶段。 |
| 8. 商业版架构图节点 | 应用系统、需求关联及联动必填规则的组件按 key 选择和回显，用户选择时分别同步 `ciEntityIdMappingFormAttributeUuid/Key`、`requestMappingFormAttributeUuid/Key`、`formItemUuid/Key`。旧配置不在前端反查补 key；保存校验检查 UUID/key 配对，失效引用保留到用户修复或删除规则。 | 核对节点 `saveNodeData()`、规则弹窗及流程校验链路；受影响文件 ESLint 与引用选择逻辑检查。 | 在真实表单场景中验证旧配置经后端补 key 后回显、保存 JSON、缺失及重复 key、规则删除和架构图执行。商业版目录被忽略，提交时需显式加入。 |
| 9. 同步配置项节点 | `handlerList` 继续保存所选组件 UUID，新增同顺序的 `handlerKeyList`；选择框按 key 回显，选择时从流程表单接口组件同步两组值。旧值缺 key 时保留原 UUID 供修复，流程保存校验不再清空 `handlerList`；跨节点禁选仍按 UUID 判断。 | 旧值、旧值与新增值混选、多选顺序、重复 key、缺失组件、空接口列表及非目标组件的引用逻辑用例；受影响文件 ESLint 与 `git diff --check` 通过。 | 后端确认并补回 `handlerKeyList` 字段；在旧/新表单的真实页面验证保存 JSON、重开回显、跨节点禁选、接口失败及配置项同步执行。 |

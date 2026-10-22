# 快捷服务（quickservice）开发说明

本目录包含快捷服务的目录管理、服务配置、服务浏览及作业创建功能。组合工具配置统一放在 `components/combopconfig/`，包含场景、执行目标（含分批/并发策略、执行器组、协议及执行用户等）和作业参数。服务配置和作业创建共用其中的字段定义、编辑器和数据转换逻辑；新增配置项时，优先通过字段注册机制接入。

本文中的相对路径均以当前 `quickservice/` 目录为基准；以 `src/` 开头的路径以项目根目录为基准。

## 1. 目录结构与文件用途

```text
quickservice/
├── README.md                                # 目录说明与组件扩展指南
├── catalog/                                 # 管理端：维护目录和服务配置
│   ├── catalog-manage.vue                   # 目录树、节点选择、新增/保存/删除及拖拽移动
│   ├── catalog.vue                          # 目录基本信息编辑：名称、启用状态、权限、描述
│   ├── catalogmixin.js                      # 目录/服务编辑共享的 props、父目录计算及启用状态更新
│   └── service.vue                          # 服务配置编辑：基本信息、组合工具、引用表单及参数映射
├── servicecatalog/                          # 使用端：浏览服务并创建作业
│   ├── service-catalog-manage.vue           # 服务目录浏览、搜索、收藏及收藏状态协调
│   ├── service-list-dialog.vue              # “查看更多”服务列表弹窗，一次加载列表，支持搜索和收藏
│   ├── create-job.vue                       # 创建作业页面入口，加载服务并转发保存/执行操作
│   ├── form-reference-service-edit.vue      # 引用表单的兼容入口，通过 extends 复用 JobEditor
│   └── no-form-reference-service-edit.vue   # 未引用表单的兼容入口，通过 extends 复用 JobEditor
├── components/                              # 快捷服务共用的界面组件及组合工具配置
│   ├── service-invalid-alert.vue            # 服务配置失效提示，支持跳转管理页或通知父组件定位
│   ├── job-editor.vue                       # 作业编辑主体：表单、参数、回填、校验、保存及执行
│   ├── service-card.vue                     # 单个服务卡片，发出选择及收藏事件
│   ├── service-group.vue                    # 服务分组：目录路径标题、卡片列表、左右翻页及“查看更多”入口
│   ├── service-basic-info.vue               # 使用共享基本信息定义，在作业页只读展示
│   ├── collapse-section.vue                 # 可折叠内容分区，统一标题、边框及展开交互
│   └── combopconfig/                        # 组合工具配置：场景、执行目标及作业参数
│       ├── editor-contract.js              # 值编辑器统一 props 与子控件异步校验工具
│       ├── groups.js                       # 参数分组名称及分组顺序
│       ├── mapping-mode-select.vue         # 参数映射方式选择控件
│       ├── mapping-rules.js                # 映射枚举、选项、必填/可编辑规则及映射数据清理
│       ├── param-value-editor.vue          # 动态加载值编辑器，转发事件、取值及校验
│       ├── service-param-field.vue         # 单个完整字段：标签、映射方式、值控件及校验提示
│       ├── service-param-panel.vue         # 参数面板：分组/平铺、整行布局、统一取值/校验/定位
│       └── fields/                          # 组合工具配置项定义与对应 Vue 控件
│           ├── index.js                    # 内置参数注册、定义/控件完整性校验、动态参数合并
│           ├── scenario/                   # 场景，参数 key 为 scenarioId
│           │   ├── index.js                # 默认场景继承、场景回填及服务保存转换
│           │   └── index.vue               # 场景单选控件
│           ├── parallelpolicy/             # 并发策略，参数 key 为 parallelPolicy
│           │   ├── index.js                # 并发策略默认值、分组及显隐规则
│           │   └── index.vue               # 分批/并发策略切换控件
│           ├── roundcount/                 # 分批数量，参数 key 为 roundCount
│           │   ├── index.js                # 分批模式下的显隐及默认值
│           │   └── index.vue               # 分批数量选择控件
│           ├── parallelcount/              # 并发数量，参数 key 为 parallelCount
│           │   ├── index.js                # 并发模式下的显隐及默认值
│           │   └── index.vue               # 并发数量选择控件
│           ├── runnergrouptag/             # 执行器组标签，参数 key 为 runnerGroupTag
│           │   ├── index.js                # 作业可覆盖规则、回填及作业提交转换
│           │   └── index.vue               # 执行器组标签选择控件
│           ├── runnergroup/                # 执行器组，参数 key 为 runnerGroup
│           │   ├── index.js                # 执行能力显隐、回填及作业提交转换
│           │   └── index.vue               # 复用 RunnergroupSetting 的执行器组控件
│           ├── executetarget/              # 执行目标，参数 key 为 executeNodeConfig
│           │   ├── index.js                # 目标继承、锁定及 fullField/fullWidth 配置
│           │   └── index.vue               # 完整字段控件，组合执行目标选择与前置条件配置
│           ├── protocol/                   # 连接协议，参数 key 为 protocol
│           │   ├── index.js                # 协议能力显隐，从 executeConfig.protocolId 继承值
│           │   └── index.vue               # 协议选择控件
│           ├── executeuser/                # 执行用户，参数 key 为 executeUser
│           │   ├── index.js                # 执行用户能力显隐、默认值及必填规则
│           │   └── index.vue               # 执行用户输入控件
│           └── runtimeparam/               # 根据组合工具 runtimeParamList 生成的动态作业参数
│               ├── index.js                # 动态定义、按类型生成默认值及作业回填
│               └── index.vue               # 按参数 type 选择已有编辑/只读 Handler
└── model/                                   # 数据初始化、加载和提交转换
    ├── request-state.js                     # 仅服务配置编辑器和作业编辑器使用的请求通道版本控制
    ├── service-info.js                      # 基本信息字段、场景差异、默认值和回填
    ├── service-loader.js                    # 加载组合工具、表单配置并提取可映射表单字段
    ├── service-model.js                     # 初始化参数映射，构造共享 parameterContext
    └── service-payload.js                   # 清理无效表单映射，生成服务/作业接口请求数据
```

## 2. 页面入口与数据流

路由统一定义在 `src/views/pages/autoexec/router.js`：

| 路由 | 页面文件 | 用途 |
| --- | --- | --- |
| `/catalog-manage` | `catalog/catalog-manage.vue` | 管理目录树及服务配置 |
| `/service-catalog-manage` | `servicecatalog/service-catalog-manage.vue` | 浏览、搜索及收藏快捷服务 |
| `/create-job` | `servicecatalog/create-job.vue` | 根据选中的服务创建作业 |

服务编辑的数据流：

```text
catalog/catalog-manage.vue
  → catalog/service.vue
  → service-loader.js 加载组合工具和表单
  → initializeValues() 初始化参数映射
  → parameterContext() 构造共享上下文
  → createDefinitions() 生成可见字段及对应控件
  → ServiceParamPanel → ServiceParamField → ParamValueEditor → fields/*/index.vue
  → toServicePayload() 生成服务配置，由 catalog-manage.vue 调用接口保存
```

作业创建由 `create-job.vue` 选择引用表单/未引用表单入口，两者均继承 `components/job-editor.vue`。`JobEditor` 使用同一套参数定义，将可编辑参数放在参数区，已配置参数放在“其他参数”只读区，并通过 `toJobPayload()` 生成作业数据。

表单组件 `src/commercial-module/autoexec/form/component/formautoexecservice/index.vue` 也复用这两个兼容入口，通过 `defaultData` 传入服务配置、`serviceData` 回填作业，并接收 `set-value` 事件更新表单值。

参数值统一保存在 `parameterValues` 中：

```js
{
  executeUser: { mappingMode: 'constant', value: 'root' },
  'runtime:exampleKey': { mappingMode: 'notsetup', value: '' }
}
```

内置参数使用定义的 `key`；动态参数使用 `runtime:${param.key}`，提交时恢复为原始 `paramKey`。不要在控件中直接拼接服务或作业接口请求数据。

## 3. 新增组件时需要修改哪些文件

### 3.1 新增一个内置组合工具配置项（常见扩展）

最小改动为：**新增两个文件，并修改一个注册文件**。

| 文件 | 是否必改 | 修改内容 |
| --- | --- | --- |
| `components/combopconfig/fields/<参数目录>/index.js` | 新增 | 声明参数 key、标签、分组、默认值、显隐及转换规则 |
| `components/combopconfig/fields/<参数目录>/index.vue` | 新增 | 实现参数值编辑与只读展示，提供取值及校验方法 |
| `components/combopconfig/fields/index.js` | 是 | 导入定义并加入 `FIELDS`，绑定对应 Vue 控件 |
| `components/combopconfig/groups.js` | 按需 | 需要新分组或调整分组顺序时修改 |
| `model/service-model.js` | 按需 | 现有上下文不足，需要补充共享状态时修改；普通参数初始化由注册定义自动接入 |
| `model/service-payload.js` | 按需 | 只有新增特殊请求结构或跨字段转换时修改；单字段转换优先放定义钩子 |
| `components/combopconfig/mapping-rules.js` | 按需 | 只有修改公共映射方式、必填或作业可编辑规则时修改 |
| `catalog/service.vue`、`components/job-editor.vue` | 按需 | 需要额外页面状态、交互或面板外内容时修改；普通注册参数可直接复用面板 |
| `src/resources/assets/languages/term/zh.json`、`en.json` | 按需 | 新文案无法复用已有词条时，补充中英文词条 |

#### 第一步：添加参数定义

以新增示例参数 `customParam` 为例，新建 `components/combopconfig/fields/customparam/index.js`：

```js
import { $t } from '@/resources/init.js';

export default {
  key: 'customParam',
  label: $t('term.autoexec.customparam'),
  group: 'jobParam',
  required: false,
  defaultValue: ''
};
```

`term.autoexec.customparam` 为示例新词条，使用前需补齐中英文。参数 key 必须唯一，并与接口约定一致；`group` 必须已在 `groups.js` 中注册，否则 `assertDefinitions()` 会报错。

常用定义属性及钩子如下：

| 属性/方法 | 作用 |
| --- | --- |
| `key`、`label`、`group` | 字段标识、显示名称及分组；动态参数也可使用 `labelText` |
| `required`、`defaultValue` | 必填标记和默认值，实际必填状态还受场景与映射方式影响 |
| `visible(context)` | 根据组合工具能力、当前参数值等决定是否显示；未配置时默认显示 |
| `locked` / `locked(context)` | 锁定参数；只读和禁用行为仍需控件配合实现 |
| `direct` | 服务编辑时不展示映射方式选择；现有场景、并发策略使用此配置 |
| `allowJobOverride` | 允许作业创建时覆盖常量值，仍受 `locked` 限制 |
| `fullWidth` | 平铺布局中占据整行 |
| `fullField` | 控件承载完整字段，直接由面板渲染，跳过默认字段包装 |
| `tip` | 字段下方的说明文案 |
| `getInheritedValue(input)` | 自定义从工具配置继承的值，默认读取 `executeConfig[key]` |
| `getJobValue(input)` | 在作业回填时自定义取值；存在此钩子时需自行处理是否允许覆盖 |
| `normalizeMapping(mapping, input)` | 初始化后统一修正映射结构 |
| `toServiceValue(mapping)` | 自定义服务配置中的单字段结构，默认清理后保留映射对象 |
| `toJobValue(mapping)` | 自定义作业中的单字段结构，默认提交 `mapping.value` |

初始化钩子的 `input` 包含 `config`（服务配置）、`toolConfig`、`executeConfig`、`job`、`scene` 和 `definition`；`getJobValue` 另外接收当前 `mapping`。可参考 `scenario/index.js` 和 `runnergroup/index.js` 的特殊取值转换。

#### 第二步：实现值编辑器

新建 `components/combopconfig/fields/customparam/index.vue`。普通文本参数可参考 `executeuser/index.vue`，选择类参数可参考 `protocol/index.vue`。

普通值编辑器统一使用 `editor-contract.js` 导出的 `editorProps`：

| 输入 | 含义 |
| --- | --- |
| `value` | 当前参数的原始值，即映射对象内的 `value` |
| `definition` | 当前字段定义 |
| `context` | 共享上下文，包含工具配置、能力标记、当前参数映射、表单字段等 |
| `mode` | `edit` 或 `readonly`，由字段包装层根据页面场景转换 |
| `disabled` | 是否禁用控件 |
| `isRequired` | 结合当前场景和映射方式计算后的必填状态 |

实现时遵循以下约定：

1. 使用 `input` 事件向外提交原始值；现有控件通常同时发出 `change` 事件，包装层会处理重复值。
2. 提供 `getValue()`，返回最新原始值。存在延迟提交的控件应从内部控件读取，避免仅依赖事件状态。
3. 提供 `async valid()`，返回布尔值；根据 `isRequired` 配置内部控件校验。
4. 处理 `mode === 'readonly'` 和 `disabled`，对象/数组值按需深拷贝，避免直接修改 props。
5. 参数业务规则放在同目录的 `index.js`；控件选项、内部配置及交互放在 `index.vue`。

若配置 `fullField: true`，组件接收的是完整 `{ mappingMode, value }` 对象，`mode` 为 `service-edit`、`job-create` 或 `readonly`，需自行提供完整字段交互、`getValue()` 和 `valid()`。可参考 `executetarget/index.vue`，其内部复用 `ServiceParamField` 并通过插槽替换编辑器，另外转发 `precondition` 事件。

#### 第三步：注册定义与控件

修改 `components/combopconfig/fields/index.js`：

```js
import customParam from './customparam/index.js';

// 在现有 FIELDS 数组的合适位置追加一条记录：
{ definition: customParam, loadComponent: () => require('./customparam/index.vue').default }
```

同组参数按 `FIELDS` 的注册顺序显示，分组顺序由 `groups.js` 决定。平铺布局会把 `fullWidth` 字段排在普通字段之后。注册完成后，初始化、字段生成及常规提交转换都会使用该定义，无需再手动维护一套参数列表。

`assertDefinitions()` 检查内置参数 key 唯一性及分组有效性，`assertEditors()` 检查定义与编辑器是否匹配。新增内置参数通常不需要修改路由。

### 3.2 新增一种动态作业参数类型

动态参数由组合工具的 `config.runtimeParamList` 驱动，已有类型新增一个参数实例时，无需在 `FIELDS` 中逐个注册。

如果新增的是一种参数 **type**，需检查以下位置：

| 文件/目录 | 处理方式 |
| --- | --- |
| `components/combopconfig/fields/runtimeparam/index.js` | 新类型有特殊默认值时，补充 `defaultValueByType()`；默认值也可由工具参数显式提供 |
| `components/combopconfig/fields/runtimeparam/index.vue` | 确认类型解析、传入 Handler 的配置及特殊属性满足需求 |
| `src/views/pages/autoexec/components/param/view/index.js` | 注册 `${type}Handler` 编辑组件，组件可放在 `view/` 或复用 `edit/` 中的实现 |
| `src/views/pages/autoexec/components/param/readonly/index.js` | 添加只读组件并注册 `${type}Handler` |

当前解析器在没有编辑 Handler 时回退到默认输入框/只读文本；有编辑 Handler 但没有只读 Handler 时，只读模式会复用编辑 Handler。因此新增类型应验证只读状态的实际表现。上述 Handler 注册位于快捷服务目录之外，修改时也要检查其他复用页面。

### 3.3 新增服务基本信息字段

基本信息统一在 `model/service-info.js` 的 `SERVICE_INFO_FIELDS` 中定义。`catalog/service.vue` 和 `components/service-basic-info.vue` 都通过 `getServiceBasicInfoItemList()` 获取表单项列表；`getServiceInfoValues(service)` 按字段定义提取表单值，缺失时使用默认值，不传服务数据时则返回新建服务的默认值。

新增普通字段只需在 `SERVICE_INFO_FIELDS` 中添加定义：

```js
{
  name: 'customInfo',
  label: $t('term.autoexec.custominfo'),
  type: 'text',
  defaultValue: '',
  edit: { maxlength: 100 }
}
```

`label` 使用已有词条，或补齐新词条的中英文。字段默认同时进入编辑表单、基本信息回填、服务保存请求和作业页只读展示。默认保存行为为按字段名原样提交，后端需支持该字段。

- 通用控件配置直接放在定义上；编辑专用配置放在 `edit` 中，只读专用配置放在 `readonly` 对象中。
- `readonly: false` 表示明确不在只读区展示，例如仅用于控制编辑交互的 `citeForm` 开关。
- 派生字段可提供 `getValue(service)`，如根据 `formUuid` 推导 `citeForm`；描述解码由编辑页处理。
- 需要加载数据等交互时，在 `catalog/service.vue` 的 `onChange` 中按字段名绑定处理函数。跨字段联动仍由页面维护。
- 派生字段或特殊接口结构需在 `model/service-payload.js` 中处理；例如 `citeForm` 不提交给接口。

### 3.4 新增普通展示组件、业务区块或页面

普通组件放在 `components/`，由使用它的父组件导入、在 `components` 中注册并添加模板即可，不需要接入参数 `FIELDS`。

| 新增内容 | 通常修改的位置 |
| --- | --- |
| 目录基本信息字段 | 在 `catalog/catalog.vue` 的 `catalogFields` 中添加字段配置和 `defaultValue`；表单项、新建默认值和接口回填自动生成，特殊回填可配置 `getValue(value)` |
| 服务卡片或列表区块 | `service-card.vue`、`service-group.vue` 或 `servicecatalog/service-catalog-manage.vue` |
| 服务配置中的额外区块 | `catalog/service.vue`，需要保存新数据时同步检查 `getSaveData()` 与 payload 转换 |
| 作业创建中的额外区块 | `components/job-editor.vue`，需要提交新数据时同步检查 `getSaveData()`、`valid()` 与 `toJobPayload()` |
| 独立管理或使用页面 | 在 `catalog/` 或 `servicecatalog/` 新增页面，并在 `src/views/pages/autoexec/router.js` 注册路由及相应权限元信息 |

引用表单/未引用表单入口目前均继承 `JobEditor`，共用功能应优先修改 `job-editor.vue`。

### 3.5 当前异步请求控制

`model/request-state.js` 当前仅由以下两个组件使用：

| 组件 | 请求通道及用途 |
| --- | --- |
| `catalog/service.vue` | `initialize` 管理初始化与组合工具切换，`form` 管理表单字段加载；关闭引用表单时使旧表单请求失效 |
| `components/job-editor.vue` | `initialize` 管理依赖加载，`submit` 管理作业提交；重新初始化时使旧提交流程失效 |

同一通道只允许最后一次请求回填数据和结束对应加载状态；两个组件均在 `beforeDestroy()` 中调用 `invalidate()`，使未完成请求的通道判断失效。该机制只忽略过期回调，不取消已经发出的接口请求。

以下组件不再使用请求通道，保留各自的加载或操作状态：

- `catalog/catalog.vue`：`loading` 控制加载，`validating` 避免重复校验；校验结束后核对编辑目标。
- `catalog/catalog-manage.vue`：`treeloading` 控制树加载，`saving` / `deleting` 避免重复提交，`editRevision` 判断编辑位置是否变化。
- `servicecatalog/create-job.vue`：`loadingShow` 控制加载及保存、执行按钮的可用状态。
- `servicecatalog/service-catalog-manage.vue`：`loadingShow` / `favoriteLoading` 控制列表加载，`favoritePending` 避免同一服务重复提交收藏操作。
- `servicecatalog/service-list-dialog.vue`：`loadingShow` 控制列表加载展示。
- `components/service-group.vue`：`listLoading` 阻止重复翻页，`pagingDisabled` 接收父组件的分页禁用状态；`item` 更新时重置列表和加载状态。

新增异步交互时，根据是否可能出现旧响应覆盖新数据决定是否需要请求通道，无需给所有接口统一添加。

## 4. 映射规则与提交位置

| 映射方式 | 含义及当前行为 |
| --- | --- |
| `constant` | 服务配置固定值；作业中仅允许 `allowJobOverride` 且未锁定的字段修改 |
| `formattr` | 映射引用表单字段；服务编辑时必须选择有效表单字段 |
| `notsetup` | 服务未设置，作业创建时允许未锁定的字段填写 |
| `isempty` | 显式空值，当前只向非必填动态参数提供此选项 |
| `runtimeparam` | 映射已有作业参数，字段层展示关联名称；服务 payload 构建时跳过此类映射 |

`mappingOptions()` 当前提供常量、表单/未设置及可选空值选项；`runtimeparam` 用于已有数据展示，并非当前选择器提供的新增选项。

服务保存时，内置参数通常进入 `config[definition.key]`，动态参数进入 `config.runtimeParamList`；场景等特殊字段通过定义钩子转换。作业创建时，只提交可编辑参数：内置参数进入请求顶层，动态参数进入 `runtimeParamMap[paramKey]`。

接口定义主要位于 `src/resources/api/autoexec/catalog/service.js`，通过 `$api.autoexec.catalogManage` 调用；组合工具和表单加载封装在 `model/service-loader.js`。新增服务基本信息统一修改 `model/service-info.js`，普通字段无需再同步修改编辑页和只读组件。

## 5. 修改后建议验证

1. 在目录管理中新增/编辑服务，确认新字段的分组、顺序、默认值、工具能力显隐及保存后回显。
2. 分别使用引用表单和未引用表单的服务，检查常量、表单映射、未设置及可选空值的切换和校验。
3. 创建作业并回填已有作业数据，确认可编辑参数、锁定参数及“其他参数”只读展示符合定义。
4. 检查保存服务、保存作业及立即执行的请求数据，确认字段名、映射结构和动态参数 key 正确。
5. 涉及联动或异步加载时，检查快速切换组合工具/表单/服务的结果，以及失效参数定位、窄屏布局和中英文显示。

新增或调整文件后同步更新本文的目录树与扩展说明。

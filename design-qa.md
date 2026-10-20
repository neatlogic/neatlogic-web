# CMDB 批量模型权限视觉验收

- Source visual truth: `/Users/chenqiwei/.codex/generated_images/01a0bced-f392-7df1-affe-98c298c85891/exec-58e188a8-248d-492a-b0a6-0cbb7c1e2a7c.png`
- Implementation screenshot: unavailable
- Viewport: intended desktop viewport; source image is 1487 x 1058 pixels
- CSS size and density normalization: unavailable because the authenticated implementation state could not be rendered
- State: model selection mode with the batch permission dialog open

## Full-view comparison evidence

The local frontend compiled successfully and the development server responded, but an isolated browser was redirected to the login page. The available Chrome control session did not respond, so the authenticated CMDB page and batch dialog could not be captured. No visual comparison is claimed from source code or build output alone.

## Focused region comparison evidence

Blocked for the same reason. The selected-model tag area, per-model strategy dropdowns, shared permission form, footer actions, light theme, and dark theme were not browser-rendered for comparison.

## Findings

- [P1] Browser-rendered visual evidence is missing.
  - Location: `ci-manage.vue` selection state and `batch-auth-edit.vue` dialog.
  - Evidence: the reference image is available, but the local implementation route requires an authenticated session that was not available to the isolated browser.
  - Impact: spacing, wrapping, scrolling, theme tokens, and interactive states cannot be visually accepted yet.
  - Fix: open the local CMDB model-management page in an authenticated browser session, select enough models to open the batch dialog, and capture the same desktop state for comparison.

## Primary interactions tested

- Browser interactions: not tested because the implementation route was not authenticated.
- Static validation: targeted ESLint passed.
- Production build: Rsbuild completed successfully.
- Browser console: the login page showed no captured warning or error, but this does not validate the implementation route.

## Comparison history

- Initial pass: blocked before implementation capture; no P0/P1/P2 visual fixes were inferred from source code alone.

## Implementation checklist

- Capture the authenticated selection-mode page and open batch dialog at a desktop viewport.
- Verify card and table selection, current-result selection, strategy changes, tag search and overflow.
- Compare typography, spacing, colors, copy, and light/dark themes against the source visual.

final result: blocked

---

# 集成数组默认值合并弹窗视觉验收（2026-10-19，最新）

本节记录本次集成页面验收，上方 CMDB 历史记录保持原样。

- Source visual truth: `C:/Users/14378/.codex/generated_images/01a13eac-8f31-74d0-8dad-b337f050a806/exec-bdb7e508-b2e1-424e-a932-179a2912df68.png`
- Implementation screenshot: `C:/Users/14378/.codex/visualizations/2026/10/15/01a13eac-8f31-74d0-8dad-b337f050a806/unified-defaults-desktop.png`
- 首轮截图：同目录 `unified-defaults-first.png`；响应式截图：同目录 `unified-defaults-responsive.png`。
- Viewport: 桌面 CSS 1330 × 1182；源图和最终实现截图均为 1330 × 1182 像素，1:1 对照，无密度缩放。
- State: 已登录的集成管理 → 编辑 test 集成 → 参数说明 → theadList 默认值设置；固定对象结构只读，下方两行 a/A/1/0、b/B/0/0。

## Full-view comparison evidence

源图与实现截图通过同一次图像工具输入共同查看。实现保留标题、副标题、浅蓝生效说明、上方元素类型与字段、下方默认数据及统一底部操作。弹窗桌面宽度 1168px，窗口变窄时保留左右 24px；复用项目字体、色值、图标、TsForm、TsDialog，未添加图片、样式文件或公共样式规则。

## Focused region comparison evidence

重点核对标题与副标题不重叠、分区标题为深色、固定字段无可编辑控件及操作列、默认数据必填星号和输入框对齐、底部只保留取消与确定。DOM 测量确认标题 20px、分区标题 16px，默认数据区保留原输入组件字号。多列数组实际横向滚动至 scrollLeft=461，最右字段到达滚动视口右边界；表头和输入框同步滚动。

## Findings and comparison history

1. 首轮发现 P2：默认 large 弹窗仅 1000px 宽、标题缺少足够强调，分区 text-title 使标题变灰；使用自适应 1168px 宽度、20px 粗标题、正文 fz14、深色分区标题修正。
2. 第二轮发现 P2：公共弹窗固定表头高度使副标题与说明过近，且公共样式覆盖标题字号；将副标题移入正文独立留白，标题使用局部字号修正。最终桌面截图已重新与源图共同核对，相关问题关闭。
3. 复核补齐打开已有非法配置时自动定位正文错误；新空白数组只有引导，不自动滚动。
4. 最终无未关闭的 P0/P1/P2。P3：实现沿用现有共享表格和输入框密度，比生成稿略紧凑；信息顺序、含义和操作一致，未改动全局控件样式。

## Primary interactions tested

- 固定结构文字只读，输入与输出默认值说明按方向展示；主表无数组附加编辑行。
- 临时修改后取消，再开仍为原值；新增第三行时主表保持两行，弹窗确定后才更新为三行，重新打开回显正确，删除后恢复两行。
- 整数 1.5 显示字段错误并阻止确定；filterList.valueList 非法 JSON 保留草稿并阻止确定，取消再开仍为原数组文本。
- 自定义数组选择对象、增加字段、填写默认数据；类型变化提示清理，取消保留原草稿，确认清理只更新弹窗，最终确定才应用外层，数值 0 保留。
- 窄窗口 CSS 768 × 900 下弹窗宽 720px、左右各 24px；正文 clientHeight=622、scrollHeight=909，底部按钮仍在窗口内，数组独立横向滚动。
- 91 项前端行为测试全部通过；7 个变更前端文件 ESLint --no-fix --no-cache 通过，git diff --check 通过。测试日志 `node_modules/.cache/unified-default-tests.out`。
- 现有开发服务实际加载新组件，未出现编译错误覆盖层；页面控制台 error/warn 查询为空。
- 页面验收没有点击集成测试执行按钮；所有临时外层表单改动通过取消丢弃，没有写入集成配置数据库。

## Residual test gaps

未重新联调目标集成实际请求，也未重测后端运行补齐；本轮仅调整前端入口和编辑事务，不变更接口、后端或 JSON 存储格式。

final result: passed

# 数组默认值表格行尾悬浮操作验收（2026-10-19）

- 字段配置与默认数据均复用公共 TsTable，悬停显示“添加 | 复制 | 删除 | 上移 | 下移”，移出隐藏；可收起操作栏后编辑最右侧控件。
- 已验证字段复制清空列名、数据复制插入当前行后且可独立编辑、上下移动和首末置灰、添加空行的必填提示、固定字段只读。
- 字段排序后下方表头同步，已有值按名称对应；复制字段没有自动复制原字段数据。
- 弹窗确认仅更新外层表单，重新打开回显正确；随后取消外层编辑，重新加载确认临时 ff 默认值没有写入数据库。
- 少量列均分可用宽度（两个字段约 540px，操作列 24px）；多列宽表 clientWidth=1098、scrollWidth=1565，横向滚动后悬浮栏仍位于可视右侧。
- CSS 768×900 下数组 clientWidth=650、scrollWidth=1565，操作栏宽 300px、右端 682px，保持在可视区域（右端 706px）内；验收后已恢复浏览器默认尺寸。
- 98 项前端测试全部通过，包括重复基础值、复制深隔离、非法 JSON 草稿移动及新行号定位、只读权限、取消、稳定行键和列宽。
- 本轮 3 个实现文件与 2 个测试文件 ESLint --no-fix --no-cache 通过；git diff --check 通过。
- npm run serve -- --no-open 完整编译成功（40867ms）；原 8081 被占用，临时检查服务自动使用 8082，编译完成后已停止临时服务。
- 页面控制台 error/warn 查询为空；没有执行集成“测试”请求。
- 截图：default-column-row-actions.png、default-data-row-actions.png，位于本任务 visualizations 目录。

final result: passed

# 两个默认值表格固定控件宽度与表头提示验收（2026-10-19）

- 字段配置与默认数据统一使用局部 DefaultValueTable 适配，不修改公共 TsTable 或 TsForm。
- 真实页面测量：表格字号 14px，名称文本框、类型选择框、数据文本框及整数 InputNumber 外框均为 126px，即 9em。桌面与 CSS 768×900 下宽度一致。
- 表头复用 ParamText：临时中文名称“这是超过八个汉字的表头名称”显示“这是超过八个汉字...”；省略号提示全文，普通文字区域不触发提示，Tooltip 挂载 body。
- 长英文表头同样按实际字体宽度省略；固定字段只读、4 个必填星号保留。输入框保留完整名称和默认值。
- 整数输入 1.5 的错误提示在 126px 内正常换行（实测高度 52.5px），不遮挡内容；取消后不影响来源。
- 8 列默认数据控件全部为 126px，桌面滚动区 clientWidth=1098、scrollWidth=1176；窄窗口 clientWidth=650、scrollWidth=1176，悬浮操作保持正常。
- 中文表头仅为验收草稿，取消后重新打开恢复原 h 字段名称；未点击外层集成确认或执行集成测试请求。
- 100 项前端行为测试全部通过，日志 node_modules/.cache/fixed-width-tests.out；本轮 3 个实现文件与 2 个测试文件 ESLint --no-fix --no-cache 通过，git diff --check 通过。
- npm run serve -- --no-open 完整编译成功；原 8081 服务保留，自动使用 8082 的临时编译检查服务已停止。浏览器 console error/warn 为空。
- 截图 fixed-width-header-tooltip.png 位于本任务 visualizations 目录。验收后恢复浏览器默认尺寸，保留原配置的弹窗供查看。

final result: passed

# 两个默认值表格紧凑布局验收（2026-10-19，最新）

- 视觉依据：`C:/Users/14378/.codex/generated_images/01a13eac-8f31-74d0-8dad-b337f050a806/exec-f0be580b-31ff-4ac2-8779-a6be25b6ad75.png`。
- 桌面真实截图：`C:/Users/14378/.codex/visualizations/2026/10/15/01a13eac-8f31-74d0-8dad-b337f050a806/compact-default-tables.png`。源图与截图同为 1505×1045，已在同一次图像查看中对照。两个表格左对齐、背景止于内容边界，右侧保留弹窗空白；控件遵守用户明确的 9em 精度，实际像素比例比生成稿更紧凑，沿用现有字号和公共控件。
- 本轮仅修改局部 default-value-table.js、defaults-editor.test.cjs 及本验收记录，保留其他已有本地修改；未修改公共组件、CSS、后端或保存格式。
- 桌面实测：普通输入框与类型选择框外框 126px（14px 字号的 9em）；普通业务列 144px，必填列额外 10px。可编辑字段表 384px（144+144+72+24），单字段和双字段默认数据表均 324px，仅操作列补足宽度；固定只读字段表 360px，没有操作占位。
- 真实 DOM 根容器、table 和背景宽度一致，少列表格 clientWidth=scrollWidth，无多余横向滚动；两个表格均不再填满 1098px 的弹窗正文。
- 窄窗口 CSS 768×900 下，少列表格仍分别 384px、324px，控件仍 126px。8 列表格 clientWidth=650、scrollWidth=1176，横向滚动至 scrollLeft=526 的最右边界，表头和输入列保持对齐，五项悬浮操作及末端收起箭头完整位于可视范围内。
- 已检查公共收起箭头的真实零宽锚点，沿用公共定位，无额外箭头样式覆盖。窄表收起操作栏后可编辑右侧输入框；数据复制后 a/A 与 b/B 独立保留，上下移动正确，取消后重新打开仍为原配置。
- 只读字段结构无修改操作，固定数组默认数据仍可编辑；原有必填星号、8 字宽省略和 Tooltip、错误换行、稳定行键及草稿行为由行为测试回归。
- 102 项前端行为测试全部通过，0 失败，日志 `node_modules/.cache/compact-table-tests.out`；局部适配器及相关测试 ESLint `--no-fix --no-cache` 通过，`git diff --check` 通过。
- `npm run serve -- --no-open` 实际完整编译及最终增量编译成功，最终编译 24217ms。原 8081 保留，临时 8082 编译检查服务已停止；真实页面控制台 error/warn 查询为空。
- 辅助截图：同目录 `compact-default-tables-narrow.png`、`compact-default-tables-wide-scroll.png`。验收临时草稿全部取消，没有点击外层集成确认或执行集成测试请求；浏览器恢复默认尺寸并保留原配置弹窗。
- 本轮未重新联调后端运行请求，布局改动不涉及后端。

final result: passed

# 字段失焦联动与弹窗草稿验收（2026-10-20）

- 上方字段配置仅显示“添加、删除、上移、下移”，下方默认数据继续保留整行复制；局部表格分别按四项、五项操作计算最小空间，原 9em 控件、紧凑列宽及表头省略保留。
- 已在真实 ff 配置验收：原有 8 列、5 行数据；添加空字段后上方变为 9 行，下方仍为 8 列、5 行，没有结构错误。输入“验收新增列”但未失焦时下方不变，Tab 失焦后新增一列，该列值为空，原有各列值不变。
- 将 key 改名为“验收改名”并失焦后，五行值仍为 aaaaaa、aaaaaa、vvvvvvvv、a、未设置。重复名称只显示上方字段错误，下方继续使用最后合法名称；点击确定被阻止，默认数据表仍保留。
- 删除原 title 字段后，下方立即隐藏该列，数据行仍为 5，没有清理确认弹层；取消再开后恢复 key、title 和原有数据，说明删除与改名都只操作弹窗草稿。
- 输入新列名后直接点击确定（不单独 Tab）可正确提交至外层未保存表单；重新打开回显新名称且原字段数据不变。验收完成后仅移除本次临时新增列并应用，已核对恢复原 8 列、5 行数据，保留原有外层表单草稿；没有点击外层集成确认，没有数据库配置写入，也没有执行集成测试请求。
- 稳定字段身份仅存在于页面，默认数据单元格使用稳定公共 header.uuid、插槽及组件键；单元格 JSON 原格式、非法文本和行身份由组件回归覆盖，改名、移动不重建输入实例。
- 113 项前端行为测试全部通过（3 个测试文件），覆盖新增空字段、失焦、空名/重名、确定前 flush、字段增删改名与排序、全类型数据迁移、批量交换列名、特殊 JSON 属性名、取消/关闭/确定、类型变化确认、只读及操作宽度。日志：node_modules/.cache/blur-field-tests.out。
- 六个业务文件、两个实际修改测试文件 ESLint --no-fix --no-cache 通过，git diff --check 通过。未修改公共组件、后端、接口、存储字段或全局样式。
- npm run serve -- --no-open 实际编译成功，最终增量编译 19433ms；临时 8082 检查服务已停止，原 8081 保留。页面 error/warn 查询为空，浏览器恢复默认尺寸并保留原配置弹窗。
- 截图：本任务 visualizations 目录下 blur-fields-empty-draft-20261020.png（空列草稿与原数据并存）、blur-fields-confirmed-draft-20261020.png（确定后重新打开回显）。

final result: passed

# 默认数据失焦类型校验与确定必填校验（2026-10-20）

- 仅合并默认值弹窗的下方表格启用延迟校验：打开、新增、复制和输入时不显示新错；非空输入失焦检查类型，空值失焦不提示；确定时同步当前输入并完整检查必填和结构。上方列名失焦联动不变。
- 必填 string/enum/date 的空串及纯空白在前后端均拒绝，可选空串仍合法，0/false/[]/{} 不视为空。后端空白集合精确匹配 JavaScript trim，含 NBSP、BOM 等；显式传入值仍不被默认值覆盖。
- 本地 8081 原页面仍表现旧校验，独立新页面加载也未及时完成，因此未停止或替换用户 8081 服务。页面验收使用本轮成功编译、可被本机浏览器访问的临时 8082 实例；首次沙箱内服务无法从浏览器访问，改为本机网络实例后完成验收。
- 实测 theadList 原 3 行：新增空行后 4 行、错误数 0；空字符串和空数字失焦错误数仍为 0。整数输入 1.5 时无错，Tab 后显示“必须为整数”，清空再失焦无错。
- 必填 key 输入纯空白并失焦仍无错；点击确定后四个必填单元格和底部摘要显示错误，弹窗保持打开。改正 key 后仅清除该格错误和底部旧摘要，其他已提交错误保留；补齐其他字段并填写整数 0 后确定成功，外层表单显示 4 行。
- filterList.valueList 输入 [1, 时无错，失焦显示 JSON 格式错误，原文本保留；清空再失焦不报类型错误。取消弹窗及外层验收表单后重新打开，theadList 恢复原 3 行，未保存到数据库，也没有执行集成测试请求。
- 前端 125 项测试全部通过（原 113 + 本轮 12），含递归跳过必填、JSON 原文、稳定身份、迟到失焦保护、连续确定一次提交、等待更新时取消不泄漏、未触碰可选字符串保持缺失。10 个业务文件与 3 个测试文件 ESLint --no-fix --no-cache 通过；git diff --check 通过。日志 node_modules/.cache/validation-ui-tests.out。
- 后端 JDK 17 Maven 默认值 19 项、输入校验 6 项、参数合并 4 项共 29 项全部通过；tenant 及依赖 develop compile BUILD SUCCESS。日志位于 neatlogic-framework/target/validation-timing-*.log。运行 JVM 未部署或重启，后端实际联调仍需加载更新 framework 类。
- npm run serve -- --no-open 成功编译，最终本机实例增量编译 44624ms；临时服务均已停止，原 8081 保留。新实例页面控制台 error/warn 查询为空，验收标签页关闭，浏览器尺寸恢复。
- 截图位于本任务 visualizations 目录：validation-new-row-before-confirm-20261020.png（新增空行无错误）、validation-type-on-blur-20261020.png（失焦类型错误）、validation-required-on-confirm-20261020.png（确定后必填提示）、validation-original-restored-20261020.png（取消恢复）。

final result: passed (new-build UI); runtime backend reload pending

# 默认值结构移除整数、布尔候选项（2026-10-20）

- 元素类型菜单仅为字符串、数字、枚举、日期、对象；字段类型菜单为上述五项及数组。通过页面 DOM 的可见菜单和截图分别核对，整数、布尔均未出现在候选项中，主参数类型列表没有修改。
- 完整类型定义和原编辑器继续保留；局部 DefaultTypeSelect 仅补充历史选中标签，候选 nodeList 不加入历史类型，不发出配置 change。字段、元素及兼容子级的变更处理也拦截新选 int/boolean。
- 真实 gg 配置的 8 个原字段正常回显，cc 为整数、dd 为布尔；原默认数据包括整数 4、布尔 true 和对象/数组 JSON，重新打开后完整保留。固定结构的只读名称继续使用完整类型表，按中文类型名称显示。
- 页面验收曾被悬浮操作栏遮挡，误触删除了未确认弹窗草稿中的 cc。自动审批拒绝取消操作后保留现场；经用户明确允许取消并恢复，已取消重新打开，核对原 8 字段与全部值恢复。没有点击弹窗确定或外层集成确认，没有数据库写入，也没有执行集成测试请求。
- 字段菜单使用键盘 Enter 打开，绕开行尾悬浮操作区域；最终可见菜单为字符串、数字、枚举、日期、对象、数组。验收结束后再次取消、重新打开，原字段和值正确，浏览器尺寸恢复默认，保留当前最新页面。
- 128 项前端测试全部通过（125 项原测试 + 3 项新增兼容测试），覆盖过滤、事件拦截、公共选择框的真实初始化方法、历史选中值、子级路径、打开/取消/关闭/确定及 0/false 保留。日志 `node_modules/.cache/type-options-tests.out`。
- 4 个业务文件与组件测试 ESLint `--no-fix --no-cache` 通过，`git diff --check` 通过。8082 开发服务增量编译成功，最终耗时 18034ms。未修改公共组件、后端、接口或配置格式。
- 截图位于本任务 visualizations 目录：`default-types-element-options-20261020.png`、`default-types-field-options-20261020.png`。本轮为选项行为调整，不改变 medium 宽度、9em 控件、字体、颜色、表格布局或图片资源。

final result: passed

# 默认值弹窗 medium 与元素类型固定宽度（2026-10-20）

- 视觉依据：用户选定的 `exec-772862f0-2dc6-4332-82ba-3660fef7ffef.png`。已同次打开设计稿和真实页面截图对照；布局按明确约定的 800px / 9em 实现，不照搬生成图片中的近似像素。真实截图使用 defaultValue 参数的临时 key/title 双字段、a/A 与 b/B 两行，参数名称及必填状态与设计稿示例不同，按原结构保留。
- 实测桌面视口 1440×1024：弹窗宽 800px、高 685.75px，标签宽 80px，选择框宽 126px。发现公共 TsFormItem 字号 13px 会令 9em 变成 117px，已局部复用 fz14 修正，再次实测为 126px，与两个表格控件一致。
- 字段配置表 384px、双字段默认数据表 324px，元素类型整行与两个表格左边缘均为 x=352；仅下拉框按标签宽度偏移 80px。两个表格均 clientWidth=scrollWidth，没有多余滚动，右侧保持留白。
- 字体与层级沿用项目现有字体、fz14/fz16 和标题 20px；间距、表格圆角、分隔线、蓝色说明、主次按钮及图标均复用现有组件。没有新增图片、图标、全局规则或公共组件改动。实际内容、必填标记由数据决定；生成稿中的示例文案与控件视觉近似不作为业务或字体变更依据。
- 900×900 窗口仍为 800px 弹窗、126px 选择框，正文没有内部横向溢出，底部按钮完整。768×900 沿用公共 medium 弹窗行为：弹窗仍宽 800px，外层 wrap clientWidth=768、scrollWidth=800，通过公共外层横向滚动访问边缘，不另加局部响应式规则。
- 8 列默认数据表可视宽 730px、内容宽 1176px；点击最后一个输入框后表格自动横向滚动至 scrollLeft=413，最右字段可见可编辑。固定 theadList 字段表宽 360px，无字段操作栏，元素类型选择框仍为 126px；已有固定数据可正常编辑。
- 真实页面回归：两列两行草稿点击确定后仅更新外层未保存表单，重新打开值完整；改名后取消恢复原名；右上角关闭后重新打开也恢复原名。关闭验收曾被后台轮询的“接口异常 / 服务器错误”通知遮挡，移除通知后通过。取消外层表单丢弃本轮全部验收草稿，没有保存数据库，没有执行集成测试请求。
- 125 项前端行为测试全部通过，0 失败；变更的两个 Vue 文件及测试文件 ESLint `--no-fix --no-cache` 通过，`git diff --check` 通过。日志：`node_modules/.cache/medium-dialog-tests.out`。
- `npm run serve -- --port 8082 --no-open` 完整编译及修正后的增量编译成功。保留原 8081 服务，最新预览在 8082；本轮临时服务保留用于查看。服务仍有既存 MaxListenersExceededWarning，未提高监听器上限；后台轮询接口异常不属于本次布局调整。
- 真实截图位于本任务 visualizations 目录：`medium-default-dialog-20261020.png`（双字段布局）、`medium-default-dialog-wide-20261020.png`（宽表末列）。浏览器尺寸已恢复默认。
- 实现检查：弹窗 medium、局部 9em、标签左右布局、表格紧凑及草稿规则均通过。窄屏公共弹窗的外层滚动属于本次明确保留的行为；无待修复的本次 P0/P1/P2 问题。

final result: passed

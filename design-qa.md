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

# scenario-run 纵向步骤布局验收

日期：2026-10-22。原 `design-qa.md` 属于其他 CMDB 任务，本次保留原文件，单独记录自检页面验收。

## 视觉基准与证据

- Source visual truth：`/Users/chenqiwei/.codex/generated_images/01a1618d-2720-7110-9fd2-4097d9455804/exec-b59c5eb5-461c-40e5-9be5-63be86f9aef2.png`。
- 证据目录：`/Users/chenqiwei/.codex/visualizations/2026/10/22/01a1618d-2720-7110-9fd2-4097d9455804/`。
- Implementation screenshot：上述目录的 `step-result-qa-console.png`；最终响应查看截图为 `step-result-desktop.png`。
- Viewport：1440 × 1024 CSS px；实现截图为 1440 × 1024 像素，截图密度为 1。源图为 1487 × 1058 像素，等比缩放并补边至 1440 × 1024，未拉伸。
- State：亮色、执行结束、3 个检查项、2 成功/1 失败、单项展开、控制台标签。源图是第二项连接超时的示例数据；实际运行 `1802138809442308` 是第三项布尔断言失败且控制台为空。数据、展开位置和日志高度差异按真实快照接受，不补造日志、阶段或错误消息。
- 全景并排比较：`step-design-comparison.png`；步骤、阶段、标签和日志区局部并排比较：`step-design-comparison-focus.png`。两张比较图均已实际打开审阅。
- 补充：`step-before-desktop.png`（执行前）；`step-result-dark.png`（暗色）；`step-result-narrow-light.png`、`step-result-narrow-dark.png`（1024px 窄屏）。

## 比较结果与调整历史

1. [P2，已修复] 第一轮执行前截图中，摘要使用白底、大数字分区，信息密度偏离目标。改成无白底标题与紧凑同排统计，步骤名称加粗。后续实际运行截图已确认。
2. [P2，已修复] 执行结果中“无需清理”沿用空视觉状态，亮色下文字过淡。改成公共 `text-grey` 状态，亮暗截图确认可读。
3. [P2，已修复] 阶段初版为多块纵向灰底内容，过高。改成同一区域的可换行横排摘要，错误类型、消息和 Trace ID 仍在其下完整保留。
4. 窄屏验证发现原框架全局 `common.less` 设置 `min-width: 1024px`。800px 页面会横向滚动，保留该既有边界，不修改全局框架。1024px 时文档宽度为 1024px，步骤内状态与耗时换行，无新增横向溢出；步骤换行断点调整为 1200px。

## 五项视觉检查

- 字体：保留框架系统字体、字号及公共 Monaco；主标题加粗，步骤名称与 API 路径有明确主辅层级。字号比概念图略紧凑，属于复用产品组件的有意差异。
- 间距与布局：摘要、单一共享结果面板、编号连接线、单项内嵌详情均落地。没有为每个步骤增加独立卡片；使用公共间距。具体 API 名称额外占行是保留真实目标信息的有意差异。
- 色彩：亮色使用现有公共主题，暗色编号/连接线/背景使用 `variable.less`；失败与成功使用既有语义色，文字同时描述状态。
- 资产：全局品牌、导航和字体图标保持原产品资源；未新增装饰图或替换品牌资产。编号和连接线是布局组件的界面元素。
- 文案：新增中英文摘要、等待和阶段名；阶段按真实 `phaseList` 顺序，未知阶段保留原文。概念图的虚构日期、示例状态和错误不进入产品。

## 行为与静态验证

- 已登录浏览器实际执行场景，正确切换到 runId，并自动展开失败项；请求、响应、控制台、只读脚本可切换。复制操作显示“复制成功”。
- 切换到控制台后刷新，标签和展开项保留；手动收起再刷新仍不展开。Enter 键可以展开其他步骤。代码标签最多一个 Monaco，控制台下为零。
- 执行前默认展开首启用项，请求/脚本只读预览正常。主题切换后恢复亮色，临时视口将在交付前恢复。
- 浏览器控制台出现一次扩展消息通道异步错误（`A listener indicated an asynchronous response...`），未见本次 Vue 模板或组件异常。
- 自动化：`node --test tests/unit/selfcheck-step-view.test.cjs tests/unit/selfcheck-script-mode.test.cjs`，11 项通过。覆盖默认调试展示、诊断延迟定位、轮询标签保留、超时/清理失败/中止统计、等待轮询、手动收起、并发刷新与切换记录的旧响应隔离。
- 5 个变更 Vue/JS 文件定向 ESLint、中英文 JSON 解析、`git diff --check` 通过；`rsbuild build --log-level error` 退出码 0。构建有既有 Browserslist 数据过期提示。

## 验证边界与风险

- 现有单项编辑弹窗已打开并尝试调试，本次未观察到其结果弹窗。默认 `stepMode=false` 的摘要/阶段表格分支与诊断定位已通过组件断言；旧入口的完整浏览器结果展示仍需人工验收。本次未修改该编辑窗口或保存任何配置。
- 等待、清理失败、中止、截断、脚本诊断及全成功的组合覆盖以自动化为主，没有通过修改数据库或配置制造这些运行记录。实际浏览器证据是部分失败场景。
- `tests/unit` 已由原工程忽略，本次测试文件保留在本地，未修改忽略规则。
- 无后端、接口、数据库变更；未提交、推送、部署，未覆盖其他未提交改动。

## 变更文件

- `src/resources/components/TsStepList/TsStepList.vue`
- `src/resources/components/TsStepList/TsStepList.md`
- `src/views/pages/framework/selfcheck/scenario-run.vue`
- `src/views/pages/framework/selfcheck/scenario-item-preview.vue`
- `src/views/pages/framework/selfcheck/selfcheck-run-utils.js`
- `src/views/pages/framework/selfcheck/execution-result.vue`
- `src/resources/assets/languages/term/zh.json`
- `src/resources/assets/languages/term/en.json`
- `tests/unit/selfcheck-step-view.test.cjs`
- 本验收报告。

当前无未解决的 P0/P1/P2 视觉问题；功能验收边界如上，等待用户验收。

## 后续调整：箭头对齐与重新执行

- 展开箭头改为与检查项名称首行对齐；浏览器测量三项箭头和标题顶部一致，截图为证据目录的 `step-arrow-aligned.png`。
- 结果页增加复用 `page.reexecute` 的“重新执行”按钮，权限仍为 `SELF_CHECK_EXECUTE`。加载、等待、运行和提交期间禁用；每轮使用执行记录所属 `scenarioId` 创建全新运行，失败保留原结果。
- 浏览器连续两轮验证：`1802156534571012` → `1802158086463491` → `1802158212292611`；两轮均切换到新的运行记录及新结果。截图为证据目录的 `scenario-rerun.png`。
- 仅新增按钮和复用既有创建接口，没有修改后端接口或历史记录。场景停用、删除、另一页面并发运行仍由现有后端校验。
- 当前自动化共 16 项通过；新增覆盖成功/失败/中止记录重跑、运行中禁止提交、重复点击、创建失败恢复、旧请求隔离和新运行展开/统计重置。定向 ESLint、`git diff --check` 及完整 Rsbuild 构建通过。
- 本轮源码变更仅 `scenario-run.vue`，并补充既有本地测试及本报告；未提交或部署。

## 后续调整：移除手动刷新并澄清脚本判定

- `scenario-run.vue` 移除手动刷新入口，保留运行期间自动更新和重新执行。
- `execution-result.vue` 将原“脚本返回值”标签改为“脚本判定”，显式展示验证脚本、实际返回值及 `context.response` 目标响应快照。真实布尔值与输入对象分区展示；不改变 Boolean 返回契约，不伪造完整 context，也不增加后端或持久化字段。
- 编译/目标失败显示未执行提示；执行异常、超时及返回值类型错误显示无有效返回值，避免把后端失败标记 `false` 当作真实 return。历史缺阶段但状态明确异常的记录同样区分；其他历史对象/布尔值兼容展示。
- 断言失败且没有脚本诊断时首次默认打开判定标签；有诊断仍优先脚本，轮询保持用户选择。
- 本次浏览器读取记录 `1802265972350980`：MySQL 的真实返回值为 `true` 且响应 `reachable:true`；MongoDB 的真实返回值为 `false` 且响应含 `reachable:false`、`status:DOWN`、`message:连接失败`、`durationMs:1`。未重新运行或修改记录。
- 浏览器确认手动刷新元素数为 0，亮暗主题可读，响应快照复制提示成功，控制台无错误。截图：证据目录的 `script-verdict-detail.png`、`script-verdict-dark.png`。
- 自动化共 22 项通过；本轮新增判定来源、异常标记与历史兼容覆盖。定向 ESLint、中英文 JSON 校验、`git diff --check` 通过；完整前端构建通过。
- 本次源码仅修改上述两个 Vue 和中英文 term 资源，补充本地测试及本报告；保留既有 `apiconfig.json` 修改，未提交、推送或部署。

## 后续调整：结果信息去重

- 本节替代上一版三段式判定展示：合并目标响应与脚本判定为“响应与判定”标签，顶部只显示一行真实脚本返回值，下方仅展示一次 `context.response` JSON。验证脚本只留在自己的标签，移除重复编辑器及大段说明，未执行/无有效返回值提示缩短。
- 修改文件：`execution-result.vue`、中英文 `term` 资源、既有本地 `selfcheck-step-view.test.cjs` 及本报告。没有新增页面 CSS 或依赖，未修改后端和数据库，保留其余已有改动。
- 已登录浏览器沿用记录 `1802265972350980`，确认失败项默认打开合并标签、真实值 `false` 与响应对象分别可辨，页面仅挂载一个 Monaco；切换到脚本标签只显示一次脚本，响应复制提示成功。亮暗主题均已截图并恢复亮色，浏览器错误日志为空。本轮未重新执行场景或修改运行记录。
- 证据：`script-result-compact.png`、`script-result-compact-dark.png`，位于本报告既有证据目录。
- 自动化 22 项、定向 ESLint、中英文 JSON 校验、`git diff --check` 和完整 Rsbuild 构建均通过。构建仍有既有 Browserslist 数据过期提示。
- 风险边界：异常、截断与历史记录组合依靠已有自动化覆盖，未制造新的异常运行；原单项调试窗口的完整浏览器验收边界仍如前述。未提交、推送或部署。

final result: passed

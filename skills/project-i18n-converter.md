# 项目多语言转换规则

## 适用场景

当需要给项目页面补充多语言时，按此规则处理页面中的硬编码中文、公共语言包复用、以及模块内语言包补充。

常见路径格式：

- 页面目录：`src/commercial-module/<module>/pages/<module-page>`
- 商业模块语言目录：`src/commercial-module/<module>/languages`
- 社区模块语言目录：`src/community-module/<module>/languages`
- 公共语言目录：`src/resources/assets/languages`

例如 `<module>` 可以是 `cmdbtransfer`，页面目录可以是 `src/commercial-module/cmdbtransfer/pages/cmdbtransfer`。

## 转换流程

1. 扫描目标页面目录下的 `.vue` 文件，找出硬编码中文。
   - 推荐命令：`rg "[一-龥]" <target-folder>`
   - 重点检查 template 文案、组件 `title/label/placeholder`、表格 `theadList`、下拉选项、弹窗标题和内容、校验提示、`$Message`。

2. 优先复用公共语言包。
   - `src/resources/assets/languages` 下的语言包属于基础公共语言包，基础、商业和社区模块都可以直接复用。
   - 可复用类型包括 `dialog/form/message/page/router/term`，不能因为 key 位于公共 `router` 或公共 `term` 就在当前模块重复创建。
   - 示例：`page.new`、`page.edit`、`message.savesuccess`、`dialog.title.deleteconfirm`、`term.expression.like`。

3. 公共 key 不存在时，新增到当前模块语言包。
   - 商业模块路径：`src/commercial-module/<module>/languages/term/zh.json`、`src/commercial-module/<module>/languages/term/en.json`。
   - 社区模块路径：`src/community-module/<module>/languages/term/zh.json`、`src/community-module/<module>/languages/term/en.json`。
   - 页面使用当前模块命名空间，例如：`term.<module>.syncpolicy`。
   - 新增模块 `router/term` key 时只能写入当前模块自己的语言包，不能写入基础公共语言包，也不能写入其他商业或社区模块的语言包。

4. 严格遵守语言包读取边界。
   - 商业模块可以读取基础公共语言包和当前商业模块语言包，不能读取其他商业模块或任何社区模块的语言包。
   - 社区模块可以读取基础公共语言包和当前社区模块语言包，不能读取其他社区模块或任何商业模块的语言包。
   - 基础模块只读取基础公共语言包，不读取商业或社区模块语言包。
   - 如果当前模块语言包与基础公共语言包存在同名 key，当前模块的翻译优先。

5. 页面替换方式。
   - template 文本：`{{ $t('term.<module>.xxx') }}`
   - 组件属性：`:title="$t('term.<module>.xxx')"`、`:label="$t('page.name')"`、`:placeholder="$t('term.<module>.xxx')"`
   - script 中：`this.$t('term.<module>.xxx')`
   - 动态句子优先使用参数：`this.$t('term.<module>.deletemappingcontent', { oldCiName: row.oldCiName, newCiName: row.newCiName })`

6. 中英文同时补齐。
   - `zh.json` 与 `en.json` 的 key 必须保持一致。
   - 英文翻译保持清晰业务语义，常用词如 configuration item、mapping、sync、relation、topology。

## i18n 通用翻译要求

- 所有中英文翻译必须结合运维与软件研发专业语境，优先采用业内通用术语，避免脱离业务场景的直译或口语化表达。
- 同一概念在页面、API、文档及语言包中应保持术语一致。
- 英文短 UI 文案使用 Title Case。
- 完整句子使用 Sentence case。
- `ID`、`IP`、`AI`、`UUID`、`API`、`URL`、`HTTP`、`HTTPS`、`SSH`、`SQL` 等业界通用缩写保持全大写。

## Key 命名建议

- 使用小写、简短、语义明确的 key。
- 优先按业务含义命名，而不是按页面位置命名。
- 模块专用词统一放在当前模块 `term` 命名空间下。
- 不要把模块页面专用文案加到公共语言包，除非明确要做全局公共词。

## 验证要求

完成转换后执行：

1. `rg "[一-龥]" <target-folder>`，确认目标页面没有未转换硬编码中文。
2. 解析模块 `zh.json` 和 `en.json`，确认 JSON 格式正确。
3. 检查页面中所有 `$t('...')` key 都能在 `src/resources/assets/languages` 的基础公共语言包或当前模块语言包中找到。
4. 检查页面没有引用其他商业或社区模块语言包中的 key。
5. 如项目可用，针对修改过的 Vue 文件单独跑 ESLint；不要直接跑全项目 `lint --fix`。

## 注意事项

- 不覆盖用户已有改动，不做无关格式化。
- 公共 `router/term` 与其他基础公共语言包一样可以直接复用；不要在模块语言包中重复创建已有公共 key。
- 模块专用语言不能跨商业模块或社区模块复用；确实需要跨模块的词条应先明确其公共属性，再由用户确认是否提升到 `src/resources/assets/languages`。
- 不对 API 返回的业务数据做多语言替换，只处理页面自身 UI 文案。

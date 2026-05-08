# 项目多语言转换规则

## 适用场景

当需要给项目页面补充多语言时，按此规则处理页面中的硬编码中文、公共语言包复用、以及模块内语言包补充。

常见路径格式：

- 页面目录：`src/commercial-module/<module>/pages/<module-page>`
- 模块语言目录：`src/commercial-module/<module>/languages`
- 公共语言目录：`src/resources/assets/languages`

例如 `<module>` 可以是 `cmdbtransfer`，页面目录可以是 `src/commercial-module/cmdbtransfer/pages/cmdbtransfer`。

## 转换流程

1. 扫描目标页面目录下的 `.vue` 文件，找出硬编码中文。
   - 推荐命令：`rg "[一-龥]" <target-folder>`
   - 重点检查 template 文案、组件 `title/label/placeholder`、表格 `theadList`、下拉选项、弹窗标题和内容、校验提示、`$Message`。

2. 优先复用公共语言包。
   - 如果 `src/resources/assets/languages` 下的 `dialog/form/message/page` 中已有相同或可复用文案，页面直接使用公共 key。
   - 示例：`page.new`、`page.edit`、`page.delete`、`page.status`、`page.loading`、`message.savesuccess`、`message.deletesuccess`、`dialog.title.deleteconfirm`。

3. 不直接复用公共 `router` 和公共 `term`。
   - 如果文案只在 `src/resources/assets/languages/router` 或 `src/resources/assets/languages/term` 中存在，需要添加到当前模块的 `languages/term/zh.json` 和 `languages/term/en.json`。
   - 路径格式：`src/commercial-module/<module>/languages/term/zh.json`、`src/commercial-module/<module>/languages/term/en.json`。
   - 页面使用模块命名空间，例如：`term.<module>.syncpolicy`。

4. 页面替换方式。
   - template 文本：`{{ $t('term.<module>.xxx') }}`
   - 组件属性：`:title="$t('term.<module>.xxx')"`、`:label="$t('page.name')"`、`:placeholder="$t('term.<module>.xxx')"`
   - script 中：`this.$t('term.<module>.xxx')`
   - 动态句子优先使用参数：`this.$t('term.<module>.deletemappingcontent', { oldCiName: row.oldCiName, newCiName: row.newCiName })`

5. 中英文同时补齐。
   - `zh.json` 与 `en.json` 的 key 必须保持一致。
   - 英文翻译保持清晰业务语义，常用词如 configuration item、mapping、sync、relation、topology。

## Key 命名建议

- 使用小写、简短、语义明确的 key。
- 优先按业务含义命名，而不是按页面位置命名。
- 模块专用词统一放在当前模块 `term` 命名空间下。
- 不要把模块页面专用文案加到公共语言包，除非明确要做全局公共词。

## 验证要求

完成转换后执行：

1. `rg "[一-龥]" <target-folder>`，确认目标页面没有未转换硬编码中文。
2. 解析模块 `zh.json` 和 `en.json`，确认 JSON 格式正确。
3. 检查页面中所有 `$t('...')` key 都能在公共 `dialog/form/message/page` 或模块 `languages/term` 中找到。
4. 如项目可用，针对修改过的 Vue 文件单独跑 ESLint；不要直接跑全项目 `lint --fix`。

## 注意事项

- 不覆盖用户已有改动，不做无关格式化。
- 不把公共 `router/term` 作为页面转换的直接复用来源。
- 不对 API 返回的业务数据做多语言替换，只处理页面自身 UI 文案。

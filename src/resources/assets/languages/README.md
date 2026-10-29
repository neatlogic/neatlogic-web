# 多语言使用说明

商业与社区模块的合并示例见 [商业与社区模块多语言合并规则](./MODULE_LANGUAGE_MERGE.md)。

## 合并规则

`zh.js` / `en.js` 自动加载公共语言包及社区、商业模块的语言包，按分类和命名空间合并：

- 没有重复的 key：作为新词条保留。
- 相同 key：对象递归合并，具体文案由后加载的值覆盖。
- 加载顺序：公共语言包 → 社区模块 → 商业模块。

以上规则适用于挂载到对应命名空间后的词条。模块语言包建议显式包一层模块名，不要在同一文件中混放其他命名空间，避免词条被忽略。

## 新增词条

在当前模块的 `languages/<分类>/zh.json` 和 `en.json` 中同步添加词条。例如：

`src/commercial-module/cmdbtransfer/languages/term/zh.json`：

```json
{
  "cmdbtransfer": {
    "syncpolicy": "同步策略"
  }
}
```

英文文件保持相同结构，将文案改为 `Sync Policy`。页面使用：

```js
// 模板中
$t('term.cmdbtransfer.syncpolicy')

// 组件脚本中
this.$t('term.cmdbtransfer.syncpolicy')
```

优先复用公共词条；模块专用文案放在当前模块下，中英文 key 保持一致。社区模块对应目录为 `src/community-module/<模块名>/languages`。

## 同步配置 i18nhelper

**新增语言文件后，需要同步配置 [.vscode/i18nhelper-setting.json](../../../../.vscode/i18nhelper-setting.json)，否则 VS Code 中可能看不到 key 对应的中文提示。**

例如新增模块的 `term` 文件时，在 `i18nhelper` 数组中找到 `type: "term"` 的配置，将以下项添加到它的 `children` 数组：

```json
{
  "type": "term.cmdbtransfer.",
  "path": "/src/commercial-module/cmdbtransfer/languages/term/zh.json",
  "path_en": "/src/commercial-module/cmdbtransfer/languages/term/en.json"
}
```

- `type`：词条前缀，建议以 `.` 结尾；`path`、`path_en`：相对于项目根目录的中英文文件路径。
- `router` 等其他分类同理，添加到对应分类的配置中。
- 已有路径只新增词条时无需重复配置；文件移动或重命名时同步更新路径。
- 确认 VS Code 已启用 `neatlogic.i18nhelper` 扩展。保存后未显示中文，可切换编辑器标签或重新加载窗口。

当前配置已包含示例中的 `cmdbtransfer` 路径，无需重复添加。

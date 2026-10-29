# 商业与社区模块多语言合并规则

商业模块和社区模块可以直接使用现有 `zh.js` / `en.js` 的自动合并逻辑，无需单独编写加载代码。

## 文件位置与写法

| 类型 | 语言文件路径 |
| --- | --- |
| 公共语言包 | `src/resources/assets/languages/<分类>/zh.json`、`en.json` |
| 社区模块 | `src/community-module/<模块名>/languages/<分类>/zh.json`、`en.json` |
| 商业模块 | `src/commercial-module/<模块名>/languages/<分类>/zh.json`、`en.json` |

模块业务词条建议放在 `term` 分类，JSON 显式包一层模块名。文件目录决定分类，不需要再包 `term`。中英文文件保持相同的 key 和层级。

## 合并规则与示例

加载顺序：**公共语言包 → 社区模块 → 商业模块**。

- 没有重复的 key：作为新词条保留。
- 相同完整 key：对象递归合并，具体文案由后加载的值覆盖。
- 不同模块名下的同名词条互不覆盖；同一模块、同一分类的商业词条可以补充或覆盖社区词条。
- 中文、英文分别合并；缺少英文不会由合并器自动补齐。

例如社区文件 `src/community-module/demo/languages/term/zh.json`：

```json
{
  "demo": {
    "name": "名称",
    "description": "描述"
  }
}
```

商业文件 `src/commercial-module/demo/languages/term/zh.json`：

```json
{
  "demo": {
    "name": "业务名称",
    "syncpolicy": "同步策略"
  }
}
```

合并后的使用结果：

| 页面 key | 中文结果 | 合并方式 |
| --- | --- | --- |
| `term.demo.name` | 业务名称 | 商业词条覆盖社区词条 |
| `term.demo.description` | 描述 | 保留社区词条 |
| `term.demo.syncpolicy` | 同步策略 | 新增商业词条 |

模板中使用 `{{ $t('term.demo.syncpolicy') }}`，组件脚本中使用 `this.$t('term.demo.syncpolicy')`。仅安装社区模块时，不会有商业模块新增的词条；社区页面不要依赖商业模块专用 key。

## 同步配置 i18nhelper

**新增语言文件后，必须同步配置 [.vscode/i18nhelper-setting.json](../../../../.vscode/i18nhelper-setting.json)，让 VS Code 显示 key 对应的中文提示。**

例如商业模块 `demo` 的 `term` 文件，在 `i18nhelper` 数组中找到 `type: "term"`，将以下项加入其 `children`：

```json
{
  "type": "term.demo.",
  "path": "/src/commercial-module/demo/languages/term/zh.json",
  "path_en": "/src/commercial-module/demo/languages/term/en.json"
}
```

社区模块同样登记一项，将路径中的 `commercial-module` 改为 `community-module`。两边都有文件时分别登记；`router` 等分类配置到对应分类下。已有路径只新增词条时无需重复登记。

## 注意事项

- 优先复用公共词条，模块专用文案放在当前模块的命名空间下。
- 模块名应与目录解析结果一致：目录名带 `-` 时取最后一段，例如 `neatlogic-web-demo` 对应 `demo`。
- 不要在同一个模块 JSON 中混放其他命名空间，否则部分 key 可能被忽略。
- 同一扫描目录内不要依赖文件加载顺序覆盖其他模块；数组和 `null` 等值会直接替换原值。
- 配置后在当前模块页面验证中文提示，并分别检查页面中英文显示。完整使用方式见 [README](./README.md)。

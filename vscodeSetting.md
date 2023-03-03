# vscode 如何设置代码格式化等配置

## 安装插件

EsLint、vetur、Prettier - Code formatter

## 打开设置文件

参考：
设置>命令面板>输入“setting”>选择“首选项：打开设置”>打开 settings.json

## 设置参数

```
{
  "git.user.name": "自己的git用户名",
  "git.user.email": "自己的git邮箱",
  "git.branchValidationRegex": "branch-*",//分支名称校验，推荐设置为branch-名字首字母小写-功能（branch-需求、缺陷id），与balantflow分支命名保持一致
  ...其他个人设置
  "editor.fontSize": 13,


  以下为代码规范相关设置！！！！
  "git.enableCommitSigning": true,
  "gitlens.views.repositories.files.layout": "list",
  "files.autoSave": "afterDelay",
  "git.confirmSync": false,
  "gitlens.advanced.similarityThreshold": null,
  "editor.tabSize": 2,
  "vetur.validation.script": true,
  "vetur.validation.style": true,
  "vetur.format.defaultFormatter.html": "js-beautify-html",
  "editor.formatOnSave": false,
  "vetur.format.defaultFormatterOptions": {
    "js-beautify-html": {
      "wrap_attributes": "auto",
      "indent_size": 2,
      "indent_char": " ",
      "indent_with_tabs": false,
      "eol": "\n",
      "end_with_newline": true,
      "preserve_newlines": true,
      "max-preserve-newlines": 3,
      "indent-inner-html": true,
      "wrap_line_length": 120,
      "editorconfig": true
    }
  },
  "prettier.semi": true,
  "prettier.singleQuote": true,
  "html.format.maxPreserveNewLines": 3,
  "html.format.enable": false,
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[less]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "gitlens.advanced.blame.customArguments": [],
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "HookyQR.beautify"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "javascript.updateImportsOnFileMove.enabled": "always",

    "[json]": {
    "editor.defaultFormatter": "HookyQR.beautify"
  },
  "window.zoomLevel": 1,
  "[git-commit]": {
    "editor.rulers": [
      72
    ],
    "workbench.editor.restoreViewState": false
  },
  "gitlens.advanced.messages": {},  
  "gitlens.gitCommands.closeOnFocusOut": true,
  "workbench.startupEditor": "newUntitledFile",
  "npm.enableRunFromFolder": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}



```

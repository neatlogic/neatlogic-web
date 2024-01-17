[中文](README.md) / English

## about
neatlogic-web is the front-end code of the neatlogic platform, and the front-end codes of all submodules are in neatlogic-web.

neatlogic-web is based on vue2.7.16, and the UI framework has been adjusted on the basis of iView4.x source code.

## Build Dependencies
vue/cli 5.x, webpack 5.x

First, globally install the latest version of vue/cli:
```
npm install -g @vue/cli
```

## Initialize dependencies
```
npm install
```

## local development environment running project
>To modify the "apiconfig.json" configuration file, change the value of "tenantName" to the tenant you are using (if you are using the official sample data, the tenant is "demo"). Change the "urlPrefix" to the HTTP address of the Neatlogic backend Tomcat service, which should be "http://ip:port".
```
npm run serve
```
<font color="red">Exception:</font>
If a large number of unknown errors are found at startup, the possible reason may be that the dependency packages loaded during the `npm install` phase are incomplete. It is suggested to downgrade npm and install again. Currently, tests indicate that npm v14 can install normally, while npm v18+ might cause exceptions. Alternatively, loading dependency packages through `cnpm install` could also work. The cnpm version should not be too high, it's recommended to use v8.2.0.
```
sudo npm install -g cnpm@8.2.0 --registry=https://registry.npm.taobao.org
```

## Packaging Project Code
```
npm run build
```

## Update a dependency
```
npm update dependent package name

eg: npm update neatlogic-ui
```
## Automatically correct syntax that does not conform to eslint in the file
```
npm run lint
```

## Set automatic eslintrc
https://www.cnblogs.com/weilai-info/p/10988829.html


## Set the personal configuration of vscode
In order to unify the code style, there will be no format confusion when multiple people develop, please use the same code style configuration when opening the second version.
#### Install plugin
EsLint, vetur, Prettier - Code formatter, i18nhelper（auto translate）

#### Settings > Command Palette > Type "settings" > Select "Preferences: Open Settings" > Open settings.json
```
{
   "git.user.name": "My own git username",
   "git.user.email": "Own git email",
   "editor. fontSize": 13,
   "git.enableCommitSigning": true,
   "gitlens.views.repositories.files.layout": "list",
   "files.autoSave": "afterDelay",
   "git. confirmSync": false,
   "gitlens.advanced.similarityThreshold": null,
   "editor.tabSize": 2,
   "vetur.validation.script": true,
   "vetur.validation.style": true,
   "vetur.format.defaultFormatter.html": "js-beautify-html",
   "editor. formatOnSave": false,
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
   "prettier. semi": true,
   "prettier. singleQuote": true,
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
   "window. zoomLevel": 1,
   "[git-commit]": {
     "editor.rulers": [
       72
     ],
     "workbench.editor.restoreViewState": false
   },
   "gitlens.advanced.messages": {},
   "gitlens.gitCommands.closeOnFocusOut": true,
   "workbench.startupEditor": "newUntitledFile",
   "npm. enableRunFromFolder": true,
   "editor. codeActionsOnSave": {
     "source.fixAll.eslint": true
   }
}

```
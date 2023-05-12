[中文](README.md) / English

## about
neatlogic-web is the front-end code of the neatlogic platform, and the front-end codes of all submodules are in neatlogic-web.

neatlogic-web is based on vue2.x, and the UI framework has been adjusted on the basis of iView4.x source code.

## Initialize dependencies
```
npm install
```

## Run the project in the local development environment
```
npm run serve
```

## Package project code
```
npm run build
```

## Update a dependency
```
npm update dependent package name

eg: npm update techsure-ui
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
EsLint, vetur, Prettier - Code formatter

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
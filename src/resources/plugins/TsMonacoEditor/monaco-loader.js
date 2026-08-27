// Monaco 0.56的语言Worker会延迟注册以下编辑器扩展，需先注册其依赖服务。
import 'monaco-editor/editor/contrib/codelens/browser/codeLensCache.js';
import 'monaco-editor/editor/common/services/treeViewsDndService.js';
import * as monaco from 'monaco-editor/editor.js';
import { javascriptDefaults, ScriptTarget } from 'monaco-editor/language/typescript/monaco.contribution.js';
import { jsonDefaults } from 'monaco-editor/language/json/monaco.contribution.js';
import { registerHTMLLanguageService } from 'monaco-editor/language/html/monaco.contribution.js';
import { conf as xmlConf, language as xmlLanguage } from 'monaco-editor/languages/definitions/xml/xml.js';
import { conf as freemarkerConf, language as freemarkerLanguage } from './freemarker-language.js';
import 'monaco-editor/languages/definitions/javascript/register.js';
import 'monaco-editor/languages/definitions/html/register.js';
import 'monaco-editor/languages/definitions/python/register.js';
import 'monaco-editor/languages/definitions/ruby/register.js';
import 'monaco-editor/languages/definitions/perl/register.js';
import 'monaco-editor/languages/definitions/powershell/register.js';
import 'monaco-editor/languages/definitions/shell/register.js';
import 'monaco-editor/languages/definitions/bat/register.js';
import 'monaco-editor/languages/definitions/vb/register.js';
import 'monaco-editor/features/suggest/register.js';
import 'monaco-editor/editor/contrib/suggest/browser/suggestController.js';
import 'monaco-editor/features/snippet/register.js';
import 'monaco-editor/features/hover/register.js';
import 'monaco-editor/features/folding/register.js';
import 'monaco-editor/features/find/register.js';
import 'monaco-editor/features/bracketMatching/register.js';
import 'monaco-editor/features/gotoError/register.js';
import 'monaco-editor/features/contextmenu/register.js';
import 'monaco-editor/features/placeholderText/register.js';

let initialized = false;

/**
 * 配置Monaco所需的Worker，并保留其他模块已经注册的Worker处理逻辑。
 * 当其他模块重新设置MonacoEnvironment后，本方法会在下次编辑器初始化时恢复通用Worker路由。
 */
export function configureMonacoWorker() {
  const environment = globalThis.MonacoEnvironment || {};
  if (environment.getWorker && environment.getWorker.isTsMonacoWorkerFactory) {
    return;
  }
  const fallbackGetWorker = typeof environment.getWorker === 'function' ? environment.getWorker.bind(environment) : null;
  const getWorker = (moduleId, label) => {
    if (label === 'javascript' || label === 'typescript') {
      return new Worker(new URL('./typescript.worker.js', import.meta.url), { type: 'module' });
    }
    if (label === 'json') {
      return new Worker(new URL('./json.worker.js', import.meta.url), { type: 'module' });
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor' || label === 'freemarker') {
      return new Worker(new URL('./html.worker.js', import.meta.url), { type: 'module' });
    }
    if (fallbackGetWorker) {
      return fallbackGetWorker(moduleId, label);
    }
    return new Worker(new URL('./editor.worker.js', import.meta.url), { type: 'module' });
  };
  getWorker.isTsMonacoWorkerFactory = true;
  globalThis.MonacoEnvironment = {
    ...environment,
    getWorker
  };
}

/** 按需初始化公共编辑器当前支持的语言服务。 */
export function loadMonaco() {
  if (!initialized) {
    if (!monaco.languages.getLanguages().some(item => item.id === 'xml')) {
      monaco.languages.register({ id: 'xml', extensions: ['.xml', '.dmn'] });
    }
    monaco.languages.setLanguageConfiguration('xml', xmlConf);
    monaco.languages.setMonarchTokensProvider('xml', xmlLanguage);
    if (!monaco.languages.getLanguages().some(item => item.id === 'freemarker')) {
      monaco.languages.register({ id: 'freemarker', extensions: ['.ftl'], aliases: ['FreeMarker', 'freemarker'] });
    }
    monaco.languages.setLanguageConfiguration('freemarker', freemarkerConf);
    monaco.languages.setMonarchTokensProvider('freemarker', freemarkerLanguage);
    // 复用HTML语言服务提供标签、属性、悬浮和折叠；FreeMarker自身诊断由业务后端负责。
    registerHTMLLanguageService('freemarker');
    // 告警脚本中的O、N由后端运行时注入，只启用语法校验，避免产生未定义变量等误报。
    javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false
    });
    javascriptDefaults.setCompilerOptions({
      target: ScriptTarget.ES5,
      allowJs: true,
      allowNonTsExtensions: true
    });
    javascriptDefaults.setEagerModelSync(true);
    jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false
    });
    initialized = true;
  }
  return monaco;
}

export default loadMonaco;

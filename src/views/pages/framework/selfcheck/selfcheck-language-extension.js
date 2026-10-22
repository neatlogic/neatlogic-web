import { getJavaScriptWorker } from 'monaco-editor/language/typescript/monaco.contribution.js';
import { conf as javascriptConf, language as javascriptLanguage } from 'monaco-editor/languages/definitions/javascript/javascript.js';
import {
  mapSelfCheckWrappedPosition,
  SELF_CHECK_SCRIPT_LANGUAGE,
  wrapSelfCheckScript
} from './selfcheck-script-mode.js';

/**
 * 将 API 输入输出定义转换为 Monaco 补全项。
 * 后端允许返回数组或对象形式的 schema，这里统一规范化，避免页面关心元数据来源。
 */
function normalizeSchema(schema) {
  if (!schema) {
    return [];
  }
  if (typeof schema === 'string') {
    try {
      return normalizeSchema(JSON.parse(schema));
    } catch (error) {
      return [];
    }
  }
  if (Array.isArray(schema)) {
    return schema;
  }
  if (Array.isArray(schema.propertyList)) {
    return schema.propertyList;
  }
  if (schema.properties && typeof schema.properties === 'object') {
    return Object.keys(schema.properties).map(name => Object.assign({ name }, schema.properties[name]));
  }
  return Object.keys(schema).map(name => {
    const value = schema[name];
    if (value && typeof value === 'object') {
      return Object.assign({ name }, value);
    }
    return { name, type: value };
  });
}

function getFieldName(field) {
  return field.name || field.key || field.field || field.paramName;
}

function getChildren(field) {
  return normalizeSchema(field.children || field.childList || field.propertyList || field.properties);
}

function getFieldDocumentation(field) {
  return [field.description, field.help].filter((text, index, list) => text && list.indexOf(text) === index).join('\n\n');
}

function flattenSchema(schema, parentPath, result) {
  normalizeSchema(schema).forEach(field => {
    const name = getFieldName(field);
    if (!name) {
      return;
    }
    const path = parentPath ? `${parentPath}.${name}` : name;
    result.push({
      name,
      path,
      type: field.type || field.dataType || 'Object',
      typeText: field.typeText || '',
      description: field.description || field.desc || '',
      help: field.help || '',
      rule: field.rule || '',
      maxLength: field.maxLength,
      required: field.isRequired === true || field.required === true || field.isRequired === 1
    });
    flattenSchema(getChildren(field), path, result);
  });
  return result;
}

/** 将 API schema 转换为页面展示和 Monaco 补全共用的字段路径列表。 */
export function createSelfCheckSchemaFieldList(schema) {
  return flattenSchema(schema, '', []);
}

function getPathBeforeCursor(model, position) {
  const line = model.getLineContent(position.lineNumber).slice(0, position.column - 1);
  const match = line.match(/(?:context\.(?:request|response|target|run|timing))(?:\.[A-Za-z_$][\w$]*)*\.?$/);
  return match ? match[0] : '';
}

function createFieldSuggestions(monaco, fieldList, root, currentPath, range, requiredText) {
  let normalizedPath = currentPath.endsWith('.') ? currentPath.slice(0, -1) : currentPath;
  if (!currentPath.endsWith('.') && currentPath !== root) {
    const lastDotIndex = normalizedPath.lastIndexOf('.');
    normalizedPath = lastDotIndex > -1 ? normalizedPath.slice(0, lastDotIndex) : normalizedPath;
  }
  const relativeParent = normalizedPath === root ? '' : normalizedPath.slice(root.length + 1);
  return fieldList.filter(field => {
    const index = field.path.lastIndexOf('.');
    const parent = index > -1 ? field.path.slice(0, index) : '';
    return parent === relativeParent;
  }).map(field => ({
    label: field.name,
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: field.name,
    range,
    detail: `${field.type}${field.required ? ` | ${requiredText}` : ''}`,
    documentation: getFieldDocumentation(field)
  }));
}

function flattenDiagnosticMessage(message) {
  if (typeof message === 'string') {
    return message;
  }
  if (Array.isArray(message)) {
    return message.map(flattenDiagnosticMessage).filter(Boolean).join('\n');
  }
  if (!message) {
    return '';
  }
  return [message.messageText, flattenDiagnosticMessage(message.next)].filter(Boolean).join('\n');
}

function createLocalSyntaxMarker(monaco, hiddenModel, diagnostic, script) {
  const startOffset = Math.max(0, diagnostic.start || 0);
  const endOffset = startOffset + Math.max(1, diagnostic.length || 1);
  const start = mapSelfCheckWrappedPosition(hiddenModel.getPositionAt(startOffset), script);
  const end = mapSelfCheckWrappedPosition(hiddenModel.getPositionAt(endOffset), script);
  if (end.lineNumber < start.lineNumber || (end.lineNumber === start.lineNumber && end.column < start.column)) {
    end.lineNumber = start.lineNumber;
    end.column = start.column;
  }
  return {
    severity: monaco.MarkerSeverity.Error,
    message: flattenDiagnosticMessage(diagnostic.messageText),
    code: String(diagnostic.code || ''),
    source: 'selfcheck',
    startLineNumber: start.lineNumber,
    startColumn: start.column,
    endLineNumber: end.lineNumber,
    endColumn: Math.max(end.column, start.column)
  };
}

function createLocalSyntaxValidation(monaco, model) {
  const markerOwner = 'selfcheck-local-syntax';
  const hiddenUri = model.uri.with({ path: `${model.uri.path}.wrapped.js` });
  const oldHiddenModel = monaco.editor.getModel(hiddenUri);
  if (oldHiddenModel) {
    oldHiddenModel.dispose();
  }
  const hiddenModel = monaco.editor.createModel(wrapSelfCheckScript(model.getValue()), 'javascript', hiddenUri);
  let timer = null;
  let requestId = 0;
  let disposed = false;

  const validate = async currentRequestId => {
    const script = model.getValue();
    hiddenModel.setValue(wrapSelfCheckScript(script));
    try {
      const workerFactory = await getJavaScriptWorker();
      const worker = await workerFactory(hiddenModel.uri);
      const diagnosticList = await worker.getSyntacticDiagnostics(hiddenModel.uri.toString());
      if (disposed || currentRequestId !== requestId || model.isDisposed()) {
        return;
      }
      const markerList = diagnosticList.map(diagnostic => createLocalSyntaxMarker(monaco, hiddenModel, diagnostic, script));
      monaco.editor.setModelMarkers(model, markerOwner, markerList);
    } catch (error) {
      if (!disposed && !model.isDisposed()) {
        monaco.editor.setModelMarkers(model, markerOwner, []);
      }
    }
  };
  const scheduleValidate = () => {
    clearTimeout(timer);
    const currentRequestId = ++requestId;
    timer = setTimeout(() => validate(currentRequestId), 200);
  };
  const contentDisposable = model.onDidChangeContent(scheduleValidate);
  scheduleValidate();

  return {
    dispose() {
      disposed = true;
      requestId += 1;
      clearTimeout(timer);
      contentDisposable.dispose();
      if (!model.isDisposed()) {
        monaco.editor.setModelMarkers(model, markerOwner, []);
      }
      hiddenModel.dispose();
    }
  };
}

/** 创建仅服务于当前自检检查项的 JavaScript 语言扩展。 */
export function createSelfCheckLanguageExtension(target, translate) {
  const t = typeof translate === 'function' ? translate : key => key;
  const inputFieldList = createSelfCheckSchemaFieldList(target && target.inputSchema);
  const outputFieldList = createSelfCheckSchemaFieldList(target && target.outputSchema);
  const fixedFieldMap = {
    'context.target': [
      { name: 'token', type: 'String', description: t('term.framework.selfcheck.contexttarget') },
      { name: 'name', type: 'String', description: t('term.framework.selfcheck.contexttarget') },
      { name: 'moduleId', type: 'String', description: t('term.framework.selfcheck.contexttarget') },
      { name: 'risk', type: 'String', description: t('term.framework.selfcheck.contexttarget') }
    ],
    'context.run': [
      { name: 'runId', type: 'Long', description: t('term.framework.selfcheck.contextrun') },
      { name: 'runItemId', type: 'Long', description: t('term.framework.selfcheck.contextrun') },
      { name: 'scenarioId', type: 'Long', description: t('term.framework.selfcheck.contextrun') }
    ],
    'context.timing': [
      { name: 'startTime', type: 'Long', description: t('term.framework.selfcheck.contexttiming') },
      { name: 'endTime', type: 'Long', description: t('term.framework.selfcheck.contexttiming') },
      { name: 'durationMs', type: 'Long', description: t('term.framework.selfcheck.contexttiming') }
    ]
  };

  return {
    registerLanguage({ monaco }) {
      if (!monaco.languages.getLanguages().some(item => item.id === SELF_CHECK_SCRIPT_LANGUAGE)) {
        monaco.languages.register({
          id: SELF_CHECK_SCRIPT_LANGUAGE,
          aliases: ['Self-check JavaScript']
        });
        monaco.languages.setLanguageConfiguration(SELF_CHECK_SCRIPT_LANGUAGE, javascriptConf);
        monaco.languages.setMonarchTokensProvider(SELF_CHECK_SCRIPT_LANGUAGE, javascriptLanguage);
      }
    },
    triggerCharacters: ['.'],
    provideCompletionItems({ monaco, model, position }) {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      };
      const currentPath = getPathBeforeCursor(model, position);
      if (currentPath.startsWith('context.request')) {
        return { suggestions: createFieldSuggestions(monaco, inputFieldList, 'context.request', currentPath, range, t('page.isrequired')) };
      }
      if (currentPath.startsWith('context.response')) {
        return { suggestions: createFieldSuggestions(monaco, outputFieldList, 'context.response', currentPath, range, t('page.isrequired')) };
      }
      const fixedRoot = Object.keys(fixedFieldMap).find(root => currentPath === root || currentPath.startsWith(`${root}.`));
      if (fixedRoot) {
        return {
          suggestions: fixedFieldMap[fixedRoot].map(field => ({
            label: field.name,
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: field.name,
            range,
            detail: field.type,
            documentation: field.description
          }))
        };
      }
      const snippetKind = monaco.languages.CompletionItemKind.Snippet;
      return {
        suggestions: [
          {
            label: 'return true',
            kind: snippetKind,
            detail: t('term.framework.selfcheck.returnsuccess'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            insertText: 'return true;',
            range
          },
          {
            label: 'return false',
            kind: snippetKind,
            detail: t('term.framework.selfcheck.returnfailure'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            insertText: 'return false;',
            range
          },
          {
            label: 'context.request',
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: 'context.request',
            detail: t('term.framework.selfcheck.contextrequest'),
            range
          },
          {
            label: 'context.response',
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: 'context.response',
            detail: t('term.framework.selfcheck.contextresponse'),
            range
          },
          {
            label: 'context.target',
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: 'context.target',
            detail: t('term.framework.selfcheck.contexttarget'),
            range
          },
          {
            label: 'context.run',
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: 'context.run',
            detail: t('term.framework.selfcheck.contextrun'),
            range
          },
          {
            label: 'context.timing',
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: 'context.timing',
            detail: t('term.framework.selfcheck.contexttiming'),
            range
          },
          {
            label: 'console.log',
            kind: monaco.languages.CompletionItemKind.Method,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            insertText: 'console.log(${1:value});',
            detail: t('term.framework.selfcheck.consolehelp'),
            range
          },
          {
            label: 'console.warn',
            kind: monaco.languages.CompletionItemKind.Method,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            insertText: 'console.warn(${1:value});',
            detail: t('term.framework.selfcheck.consolehelp'),
            range
          },
          {
            label: 'console.error',
            kind: monaco.languages.CompletionItemKind.Method,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            insertText: 'console.error(${1:value});',
            detail: t('term.framework.selfcheck.consolehelp'),
            range
          }
        ]
      };
    },
    setup({ monaco, model }) {
      return createLocalSyntaxValidation(monaco, model);
    },
    provideHover({ monaco, model, position }) {
      const word = model.getWordAtPosition(position);
      if (!word) {
        return null;
      }
      const field = inputFieldList.concat(outputFieldList).find(item => item.name === word.word);
      if (!field) {
        return null;
      }
      return {
        range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
        contents: [
          { value: `\`${field.name}: ${field.type}\`` },
          { value: `${field.required ? `**${t('page.isrequired')}**  \n` : ''}${getFieldDocumentation(field)}` }
        ]
      };
    }
  };
}

export function createDefaultScript() {
  return "console.log('response', context.response);\nreturn false;";
}


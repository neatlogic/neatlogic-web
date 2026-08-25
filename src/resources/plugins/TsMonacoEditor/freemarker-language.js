import { conf as htmlConf, language as htmlLanguage } from 'monaco-editor/languages/definitions/html/html.js';

const directiveKeywordPattern = /\b(?:assign|attempt|break|case|compress|default|else|elseif|escape|fallback|flush|ftl|function|global|if|import|include|list|local|macro|nested|noescape|noparse|recover|recurse|return|setting|stop|switch|t|visit)\b/;

/**
 * FreeMarker模板保留HTML的标签规则，并优先识别插值、指令和模板注释。
 */
export const language = Object.assign({}, htmlLanguage, {
  tokenPostfix: '.freemarker',
  tokenizer: Object.assign({}, htmlLanguage.tokenizer, {
    root: [
      [/<#--/, 'comment', '@freemarkerComment'],
      [/\$\{/, 'delimiter.bracket', '@freemarkerInterpolation'],
      [/(<\/?#)([a-zA-Z_]\w*)/, ['delimiter.bracket', { token: 'keyword', next: '@freemarkerDirective' }]],
      [/<\/?#/, { token: 'delimiter.bracket', next: '@freemarkerDirective' }],
      ...htmlLanguage.tokenizer.root
    ],
    freemarkerComment: [
      [/-->/, 'comment', '@pop'],
      [/[^-]+/, 'comment'],
      [/./, 'comment']
    ],
    freemarkerInterpolation: [
      [/\}/, 'delimiter.bracket', '@pop'],
      [/\?[a-zA-Z_]\w*/, 'type.identifier'],
      [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/, 'string'],
      [/\b(?:true|false|null)\b/, 'constant'],
      [/\d+(?:\.\d+)?/, 'number'],
      [/[a-zA-Z_]\w*/, 'variable'],
      [/[.!,=+\-*\/%><&|()[\]]+/, 'operator'],
      [/\s+/, 'white']
    ],
    freemarkerDirective: [
      [/\/?\s*>/, 'delimiter.bracket', '@pop'],
      [directiveKeywordPattern, 'keyword'],
      [/\?[a-zA-Z_]\w*/, 'type.identifier'],
      [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/, 'string'],
      [/\b(?:true|false|null)\b/, 'constant'],
      [/\d+(?:\.\d+)?/, 'number'],
      [/[a-zA-Z_]\w*/, 'variable'],
      [/[.!,=+\-*\/%><&|()[\]]+/, 'operator'],
      [/\s+/, 'white']
    ]
  })
});

export const conf = Object.assign({}, htmlConf, {
  comments: {
    blockComment: ['<#--', '-->']
  },
  brackets: (htmlConf.brackets || []).concat([
    ['${', '}'],
    ['<#', '>']
  ]),
  autoClosingPairs: (htmlConf.autoClosingPairs || []).concat([
    { open: '${', close: '}' }
  ])
});

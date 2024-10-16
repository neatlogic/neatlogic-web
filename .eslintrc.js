module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: ['plugin:vue/recommended', 'eslint:recommended'],

  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 0,
    'vue/multi-word-component-names': 'off',
    'vue/no-mutating-props': 'off',
    'no-prototype-builtins': 'off',
    'vue/valid-next-tick': 'off',
    'vue/require-valid-default-prop': 'off',
    'vue/no-useless-template-attributes': 'off',
    'vue/no-side-effects-in-computed-properties': 'off',
    'no-useless-catch': 'off',
    'vue/v-slot-style': 'off',
    'vue/no-lone-template': 'off',
    'vue/one-component-per-file': 'off',
    'vue/max-attributes-per-line': [
      2,
      {
        singleline: 3, //100
        multiline: {
          max: 1//80
          //allowFirstLine: false
        }
      }
    ],
    'vue/html-self-closing': 'off',
    'vue/no-parsing-error': [2, { 'x-invalid-end-tag': false }],
    'vue/require-default-prop': 'off',
    'vue/mustache-interpolation-spacing': ['error', 'always'],
    'vue/attribute-hyphenation': 'off',
    // 组件顺序
    'vue/order-in-components': [
      'error',
      {
        order: ['el', 'name', 'parent', 'functional', ['delimiters', 'comments'],
          ['components', 'directives', 'filters'], 'extends', 'mixins', 'inheritAttrs', 'model', ['props', 'propsData'], 'fetch', 'asyncData', 'data', 'LIFECYCLE_HOOKS', 'methods', 'filter', 'computed', 'watch', 'head', ['template', 'render'], 'renderError'
        ]
      }
    ],
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/require-prop-types': 'off',
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/no-v-html': 'off',
    'no-constant-condition': 'off',
    'accessor-pairs': 2,
    'arrow-spacing': [
      2,
      {
        before: true,
        after: true
      }
    ],
    'block-spacing': [2, 'always'],
    'brace-style': [
      2,
      '1tbs',
      {
        allowSingleLine: true
      }
    ],
    camelcase: [
      0,
      {
        properties: 'always'
      }
    ],
    'comma-dangle': [2, 'never'],
    'comma-spacing': [
      2,
      {
        before: false,
        after: true
      }
    ],
    'comma-style': [2, 'last'],
    'constructor-super': 2,
    curly: [2, 'multi-line'],
    'dot-location': [2, 'property'],
    'eol-last': 2,
    eqeqeq: 0,
    'generator-star-spacing': [
      2,
      {
        before: true,
        after: true
      }
    ],
    'handle-callback-err': 0,
    indent: [
      2,
      2,
      {
        SwitchCase: 1
      }
    ],
    'jsx-quotes': [2, 'prefer-single'],
    'key-spacing': [
      2,
      {
        beforeColon: false,
        afterColon: true
      }
    ],
    'keyword-spacing': [
      2,
      {
        before: true,
        after: true
      }
    ],
    'new-cap': [
      2,
      {
        newIsCap: true,
        capIsNew: false
      }
    ],
    'new-parens': 2,
    'no-array-constructor': 'off',
    'no-caller': 2,
    'no-console': 'off',
    'no-class-assign': 2,
    'no-cond-assign': 2,
    'no-const-assign': 2,
    'no-control-regex': 0,
    'no-delete-var': 2,
    'no-dupe-args': 2,
    'no-dupe-class-members': 2,
    'no-dupe-keys': 2,
    'no-duplicate-case': 2,
    'no-empty-character-class': 2,
    'no-empty-pattern': 2,
    'no-eval': 2,
    'no-ex-assign': 2,
    'no-extend-native': 2,
    'no-extra-bind': 2,
    'no-extra-boolean-cast': 2,
    'no-extra-parens': [2, 'functions'],
    'no-fallthrough': 2,
    'no-floating-decimal': 2,
    'no-func-assign': 2,
    'no-implied-eval': 2,
    'no-inner-declarations': [2, 'functions'],
    'no-invalid-regexp': 2,
    'no-irregular-whitespace': 2,
    'no-iterator': 2,
    'no-label-var': 2,
    'no-labels': [
      2,
      {
        allowLoop: false,
        allowSwitch: false
      }
    ],
    'no-lone-blocks': 2,
    'no-mixed-spaces-and-tabs': 2,
    'no-multi-spaces': 2,
    'no-multi-str': 2,
    'no-multiple-empty-lines': [
      2,
      {
        max: 1
      }
    ],
    'no-native-reassign': 2,
    'no-negated-in-lhs': 2,
    'no-new-object': 0,
    'no-new-require': 2,
    'no-new-symbol': 2,
    'no-new-wrappers': 0,
    'no-obj-calls': 2,
    'no-octal': 2,
    'no-octal-escape': 2,
    'no-path-concat': 2,
    'no-proto': 2,
    'no-redeclare': 2,
    'no-regex-spaces': 2,
    'no-return-assign': [2, 'except-parens'],
    'no-self-assign': 2,
    'no-self-compare': 2,
    'no-sequences': 2,
    'no-shadow-restricted-names': 2,
    'no-spaced-func': 2,
    'no-sparse-arrays': 2,
    'no-this-before-super': 2,
    'no-throw-literal': 2,
    'no-trailing-spaces': 0,
    'no-undef': 0,
    'no-undef-init': 0,
    'no-unexpected-multiline': 2,
    'no-unmodified-loop-condition': 2,
    'no-unneeded-ternary': [
      2,
      {
        defaultAssignment: false
      }
    ],
    'no-unreachable': 2,
    'no-unsafe-finally': 2,
    'no-unused-vars': 0,
    'no-useless-call': 2,
    'no-useless-computed-key': 2,
    'no-useless-constructor': 2,
    'no-useless-escape': 0,
    'no-whitespace-before-property': 2,
    'no-with': 2,
    'one-var': [
      2,
      {
        initialized: 'never'
      }
    ],
    'operator-linebreak': [
      2,
      'after',
      {
        overrides: {
          '?': 'before',
          ':': 'before'
        }
      }
    ],
    'padded-blocks': [2, 'never'],
    quotes: [
      1,
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true
      }
    ],
    semi: ['error', 'always'],
    'semi-spacing': [
      2,
      {
        before: false,
        after: true
      }
    ],
    'space-before-blocks': [2, 'always'],
    'space-before-function-paren': [2, 'never'],
    'space-in-parens': [2, 'never'],
    'space-infix-ops': 2,
    'space-unary-ops': [
      2,
      {
        words: true,
        nonwords: false
      }
    ],

    'template-curly-spacing': [2, 'never'],
    'use-isnan': 2,
    'valid-typeof': 0,
    'wrap-iife': [2, 'any'],
    'yield-star-spacing': [2, 'both'],
    yoda: [2, 'never'],
    'prefer-const': 0,
    'no-debugger': 0,
    'object-curly-spacing': 'off',
    'array-bracket-spacing': [2, 'never']
  }
};

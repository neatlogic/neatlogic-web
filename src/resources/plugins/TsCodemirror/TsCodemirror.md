# TsCodemirror 组件开发文档

## 1. 组件简介

TsCodemirror 是基于 Vue 和 CodeMirror 实现的代码编辑器组件，提供了丰富的代码编辑功能，支持多种编程语言的语法高亮、代码折叠、行号显示等特性。

## 2. 目录结构

```
TsCodemirror/
├── TsCodemirror.vue  # 主组件文件
└── codemirror.less   # 样式文件
```

## 3. 技术依赖

- Vue 2.x
- vue-codemirror
- CodeMirror 5.x

## 4. 组件功能

- 支持多种编程语言的语法高亮
- 支持代码折叠功能
- 支持行号显示
- 支持主题切换
- 支持复制功能
- 支持表单验证
- 支持响应式布局
- 支持自动缩进
- 支持括号匹配
- 支持占位符

## 5. 支持的编程语言

| 语言 | 代码模式 |
|------|----------|
| JavaScript | text/javascript |
| JSON | text/javascript |
| HTML | htmlmixed |
| Python | python |
| Ruby | ruby |
| VBScript | vbscript |
| Perl | perl |
| PowerShell | powershell |
| Shell | shell |
| Vue | vue |
| XML | xml |
| Java | text/x-java |

## 6. 支持的主题

- eclipse（默认主题，白色主题）
- monokai（黑色主题）


## 7. 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| isLoading | Boolean | false | 是否显示加载状态 |
| loadingText | String | '' | 加载文本 |
| lineNumbers | Boolean | true | 是否显示行号 |
| value | String | '' | 初始值 |
| codeMode | String | 'text/javascript' | 代码模式 |
| classCode | String | '' | 样式类 |
| isReadOnly | Boolean | false | 是否只读 |
| theme | String | 'eclipse' | 主题 |
| height | String | '100%' | 高度 |
| code | String | '' | 代码 |
| blurText | String | '' | 失焦文本 |
| disabled | Boolean | false | 是否禁用 |
| config | Object | {} | 配置对象 |
| placeholder | String | '' | 占位符 |
| isCopy | Boolean | false | 是否显示复制按钮 |
| validateList | Array | [] | 校验规则列表 |

## 8. 组件事件

| 事件名 | 说明 | 参数 |
|--------|------|------|
| change | 值变更事件 | 当前值 |
| onBlur | 失焦事件 | 无 |
| onFocus | 聚焦事件 | 无 |
| onScroll | 滚动事件 | 编辑器实例 |
| repeatClick | 重复点击事件 | blurText 值 |

## 9. 组件方法

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| saveData | 保存数据 | 无 | 当前编辑器内容 |
| refresh | 刷新编辑器 | 无 | 无 |
| cursorActivity | 光标活动事件 | event | 无 |
| changeCode | 修改代码 | 无 | 无 |
| clipboardSuccess | 复制成功事件 | 无 | 无 |

## 10. 基本使用

### 10.1 引入组件

```javascript
export default {
  components: {
     TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror'),
  }
}
```

### 10.2 基本用法

```vue
<template>
  <TsCodemirror
    v-model="code"
    :codeMode="'javascript'"
    :height="'300px'"
    :placeholder="'请输入代码'"
    @change="handleChange"
  ></TsCodemirror>
</template>

<script>
export default {
  data() {
    return {
      code: 'console.log("Hello World");'
    };
  },
  methods: {
    handleChange(value) {
      console.log('Code changed:', value);
    }
  }
};
</script>
```

### 10.3 高级用法

```vue
<template>
  <TsCodemirror
    v-model="code"
    :codeMode="'python'"
    :height="'400px'"
    :lineNumbers="true"
    :isReadOnly="false"
    :isCopy="true"
    :placeholder="'请输入Python代码'"
    :config="{
      indentUnit: 4,
      smartIndent: true,
      lineWrapping: true
    }"
    @change="handleChange"
    @onFocus="handleFocus"
    @onBlur="handleBlur"
  ></TsCodemirror>
</template>

<script>
export default {
  data() {
    return {
      code: 'def hello():\n    print("Hello World")'
    };
  },
  methods: {
    handleChange(value) {
      console.log('Code changed:', value);
    },
    handleFocus() {
      console.log('Editor focused');
    },
    handleBlur() {
      console.log('Editor blurred');
    }
  }
};
</script>
```

## 11. 配置说明

### 11.1 基础配置

组件默认配置：

```javascript
cmOptions: {
  mode: this.codeMode, // 模式
  theme: this.theme, // 默认主题
  indentUnit: 2, // 缩近单位，默认2
  smartIndent: true, // 是否智能缩近
  tabSiae: 4, // Tab缩近，默认4
  readOnly: this.isReadOnly || this.disabled, // 是否只读
  lineNumbers: this.lineNumbers, // 是否显示行号
  firstLineNumber: 1, // 默认起始行号1
  foldGutter: true, // 折叠
  gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
  lineWrapping: true,
  autoRefresh: true // 自动刷新
}
```

### 11.2 语言映射

组件内置了语言映射配置，方便使用简写：

```javascript
modeMappingConfig: {
  javascript: 'text/javascript',
  json: 'text/javascript',
  htmlmixed: 'htmlmixed',
  python: 'python',
  ruby: 'ruby',
  vbscript: 'vbscript',
  perl: 'perl',
  powershell: 'powershell',
  shell: 'shell',
  sh: 'shell',
  csh: 'shell',
  bash: 'shell',
  cmd: 'shell',
  ksh: 'shell',
  vue: 'vue',
  xml: 'xml',
  java: 'text/x-java'
}
```

## 12. 样式定制

### 12.1 主题样式

组件支持浅色和深色主题，通过 HTML 根元素的 `theme-dark` 类切换：

```less
// 浅色主题
html {
  .theme(@default-op, @default-title, @default-text, @default-icon, @default-dividing, @default-mongolia, @default-background, @default-blockbg, @default-gray, @default-border, @default-boxshadow-main, @default-boxshadow-bolck, @default-disable, @primary-grey, @default-selectbg, @default-placeholder, @default-op, @default-footer-btn-bg, @default-shadow, @default-main-shadow,@default-primary-color,@default-error-color);
}

// 深色主题
html.theme-dark {
  .theme(@dark-op, @dark-title, @dark-text, @dark-icon, @dark-dividing, @dark-mongolia, @dark-background, @dark-blockbg, @dark-gray, @dark-border, @dark-boxshadow-main, @dark-boxshadow-bolck, @dark-disable, @menu-background, @dark-selectbg, @dark-placeholder, @dark-dividing, @dark-footer-btn-bg, @dark-shadow, @dark-main-shadow,@dark-primary-color,@dark-error-color);
}
```

### 12.2 自定义样式

可以通过 `classCode` 属性添加自定义样式类，或直接修改 `codemirror.less` 文件。

## 13. 性能优化

1. **延迟加载**：组件使用 `autoRefresh` 选项，确保编辑器在需要时自动刷新
2. **事件处理**：优化了光标活动事件的处理，避免频繁触发
3. **响应式设计**：支持不同高度设置，适应各种布局需求

## 14. 常见问题

### 14.1 代码不高亮

**原因**：可能是代码模式设置不正确
**解决方法**：确保 `codeMode` 属性值正确，或使用语言映射中的简写

### 14.2 主题不生效

**原因**：可能是主题文件未正确加载
**解决方法**：确保引入了相应的主题 CSS 文件

### 14.3 编辑器高度问题

**原因**：可能是高度设置不正确
**解决方法**：通过 `height` 属性设置合适的高度值，如 `'300px'` 或 `'100%'`

## 15. 示例代码

### 15.1 基本示例

```vue
<template>
  <div>
    <h3>JavaScript 编辑器</h3>
    <TsCodemirror
      v-model="jsCode"
      codeMode="javascript"
      height="300px"
      @change="handleChange"
    ></TsCodemirror>
    
    <h3>Python 编辑器</h3>
    <TsCodemirror
      v-model="pyCode"
      codeMode="python"
      height="300px"
      @change="handleChange"
    ></TsCodemirror>
  </div>
</template>

<script>

export default {
  components: {
    TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror.vue')
  },
  data() {
    return {
      jsCode: 'function hello() {\n  console.log("Hello World");\n}',
      pyCode: 'def hello():\n    print("Hello World")'
    };
  },
  methods: {
    handleChange(value) {
      console.log('Code changed:', value);
    }
  }
};
</script>
```

### 15.2 带复制功能的示例

```vue
<template>
  <TsCodemirror
    v-model="code"
    codeMode="htmlmixed"
    height="400px"
    theme="eclipse"
    isCopy="true"
    placeholder="请输入HTML代码"
    @change="handleChange"
  ></TsCodemirror>
</template>

<script>

export default {
  components: {
     TsCodemirror: () => import('@/resources/plugins/TsCodemirror/TsCodemirror.vue')
  },
  data() {
    return {
      code: '<div>\n  <h1>Hello World</h1>\n  <p>This is a test</p>\n</div>'
    };
  },
  methods: {
    handleChange(value) {
      console.log('Code changed:', value);
    }
  }
};
</script>
```

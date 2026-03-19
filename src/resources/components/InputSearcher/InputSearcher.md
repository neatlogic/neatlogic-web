## 输入搜索组件

### 组件描述

InputSearcher 是一个带搜索图标的输入框组件，支持关键字搜索功能。组件提供了便捷的搜索交互，包括回车搜索、点击搜索图标搜索、一键清空等功能。

### 功能特性

1. **搜索交互**：支持回车键、点击搜索图标触发搜索
2. **一键清空**：提供清空按钮，快速清空搜索内容
3. **双向绑定**：支持 v-model 双向数据绑定
4. **灵活样式**：支持自定义宽度、边框样式和尺寸
5. **图标前缀**：搜索图标位于输入框左侧

### Props

| 参数 | 说明 | 类型 | 默认值 | 必填 |
|------|------|------|--------|------|
| value | 搜索值，支持 v-model 双向绑定 | String/Number | '' | 否 |
| placeholder | 输入框占位符文本 | String | '请输入关键字'（国际化） | 否 |
| border | 边框样式，可选值：'border'（有边框）、'none'（无边框） | String | 'border' | 否 |
| width | 输入框宽度，支持数值（如 50）、像素（如 50px）、百分比（如 50%） | String/Number | '' | 否 |
| size | 输入框尺寸，可选值：'small'、'default'、'large' | String | - | 否 |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 搜索触发事件，回车、点击搜索图标、点击清空按钮时触发 | (value: String/Number) - 当前搜索值 |
| input | 输入值改变事件，用于 v-model 双向绑定 | (value: String/Number) - 当前输入值 |

### 使用示例

#### 基础使用

```vue
<template>
  <div>
    <InputSearcher v-model="searchValue" @change="handleSearch" />
  </div>
</template>

<script>
export default {
  components: {
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  data() {
    return {
      searchValue: ''
    };
  },
  methods: {
    handleSearch(value) {
      console.log('搜索内容：', value);
      // 执行搜索逻辑
    }
  }
};
</script>
```

#### 自定义占位符和宽度

```vue
<template>
  <div>
    <InputSearcher
      v-model="searchValue"
      placeholder="请输入用户名"
      width="300px"
      @change="handleSearch"
    />
  </div>
</template>

<script>
export default {
  components: {
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  data() {
    return {
      searchValue: ''
    };
  },
  methods: {
    handleSearch(value) {
      this.searchUser(value);
    },
    searchUser(keyword) {
      // 搜索用户逻辑
    }
  }
};
</script>
```

#### 无边框样式

```vue
<template>
  <div>
    <InputSearcher
      v-model="searchValue"
      border="none"
      width="50%"
      @change="handleSearch"
    />
  </div>
</template>

<script>
export default {
  components: {
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  data() {
    return {
      searchValue: ''
    };
  },
  methods: {
    handleSearch(value) {
      console.log('搜索：', value);
    }
  }
};
</script>
```

#### 不同尺寸

```vue
<template>
  <div>
    <div>
      <label>小尺寸：</label>
      <InputSearcher v-model="smallValue" size="small" @change="handleSearch" />
    </div>
    <div style="margin-top: 10px;">
      <label>默认尺寸：</label>
      <InputSearcher v-model="defaultSizeValue" @change="handleSearch" />
    </div>
    <div style="margin-top: 10px;">
      <label>大尺寸：</label>
      <InputSearcher v-model="largeValue" size="large" @change="handleSearch" />
    </div>
  </div>
</template>

<script>
export default {
  components: {
    InputSearcher: () => import('@/resources/components/InputSearcher/InputSearcher.vue')
  },
  data() {
    return {
      smallValue: '',
      defaultSizeValue: '',
      largeValue: ''
    };
  },
  methods: {
    handleSearch(value) {
      console.log('搜索值：', value);
    }
  }
};
</script>
```

### 交互说明

组件支持以下三种触发搜索的方式：

1. **回车键**：在输入框中输入内容后，按下 Enter 键触发搜索
2. **点击搜索图标**：点击输入框左侧的搜索图标触发搜索
3. **点击清空按钮**：点击输入框右侧的清空按钮，清空内容并触发搜索

### 样式说明

组件使用了 scoped 样式，主要样式特性：

- `.input-searcher-box`: 主容器样式
- 输入框内边距：左右各 26px
- 搜索图标位置：左侧 8px，字体大小 14px
- 支持通过 `border` 属性控制边框样式
- 支持通过 `width` 属性控制宽度

### 注意事项

1. **占位符国际化**：默认占位符使用 `$t('form.placeholder.keyword')` 进行国际化处理，确保项目已配置国际化
2. **值类型**：value 支持 String 和 Number 类型，根据实际需求选择
3. **宽度设置**：width 可以是数值（自动转为 px）、字符串（如 '50px'、'50%'）
4. **事件触发**：change 事件在搜索时触发，input 事件在值改变时触发
5. **清空行为**：点击清空按钮会清空输入框内容并触发 change 事件
6. **样式覆盖**：组件使用了 `::v-deep` 进行样式穿透，如需自定义样式请注意优先级

### 适用场景

1. **表格搜索**：在表格上方提供搜索框，用于过滤表格数据
2. **表单搜索**：在表单中提供搜索功能，用于快速查找数据
3. **页面搜索**：在页面顶部提供全局搜索功能
4. **列表筛选**：在列表页面提供关键字筛选功能
5. **数据查询**：在数据查询页面提供输入查询功能

### 依赖组件

- Input：ViewUI 的 Input 组件
- Icon：ViewUI 的 Icon 组件

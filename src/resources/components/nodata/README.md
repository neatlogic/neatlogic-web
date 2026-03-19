# NoData 组件使用说明

## 组件简介

NoData 是一个用于展示无数据状态的组件，支持多种显示模式、图标类型和布局方式，适用于列表、表格、搜索结果等场景。

## 全局注册

NoData 组件已在项目中全局注册，无需手动引入，可以直接在任何 Vue 组件中使用。

```vue
<template>
  <!-- 直接使用，无需 import -->
  <NoData />
</template>
```

## 基础用法

```vue
<template>
  <NoData />
</template>
```

## Props 参数

| 参数 | 说明 | 类型 | 默认值 | 可选值 |
|------|------|------|--------|--------|
| type | 显示类型 | String | 'small' | 'small' |
| text | 提示文本 | String | '暂无数据' | - |
| className | 自定义类名 | String | 'nodata' | 'nodata', 'fullNodata' |
| isSearchIcon | 是否使用搜索图标 | Boolean | false | - |
| isVerticalCenter | 是否垂直居中 | Boolean | false | - |

## Slots 插槽

| 插槽名 | 说明 |
|--------|------|
| default | 自定义提示文本内容 |

## 使用示例

### 示例1：基础用法（默认）

```vue
<template>
  <div class="container">
    <NoData />
  </div>
</template>
```

### 示例2：自定义提示文本

```vue
<template>
  <div class="container">
    <NoData text="暂无相关数据" />
  </div>
</template>
```

### 示例3：使用插槽自定义内容

```vue
<template>
  <div class="container">
    <NoData>
      <span>暂无数据，请稍后再试</span>
    </NoData>
  </div>
</template>
```

### 示例4：搜索无结果样式

```vue
<template>
  <div class="container">
    <NoData
      :is-search-icon="true"
      text="未找到相关结果"
    />
  </div>
</template>
```

### 示例5：全屏无数据样式

```vue
<template>
  <div class="full-page">
    <NoData
      class-name="fullNodata"
      text="暂无数据"
    />
  </div>
</template>
```

### 示例6：垂直居中显示

```vue
<template>
  <div class="container" style="height: 400px; position: relative;">
    <NoData
      :is-vertical-center="true"
      text="暂无数据"
    />
  </div>
</template>
```

### 示例7：在表格中使用

```vue
<template>
  <Table :columns="columns" :data="tableData">
    <template slot="empty">
      <NoData text="暂无表格数据" />
    </template>
  </Table>
</template>

<script>
export default {
  data() {
    return {
      columns: [
        { title: '姓名', key: 'name' },
        { title: '年龄', key: 'age' }
      ],
      tableData: []
    }
  }
}
</script>
```

### 示例8：在列表中使用

```vue
<template>
  <div class="list-container">
    <div v-if="list.length > 0" class="list">
      <div v-for="item in list" :key="item.id" class="list-item">
        {{ item.name }}
      </div>
    </div>
    <NoData v-else text="暂无列表数据" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: []
    }
  }
}
</script>
```

### 示例9：搜索结果为空

```vue
<template>
  <div class="search-result">
    <Input v-model="searchText" placeholder="请输入搜索关键词" />
    <div class="result-list">
      <div v-if="searchResults.length > 0">
        <!-- 搜索结果列表 -->
      </div>
      <NoData
        v-else-if="searchText"
        :is-search-icon="true"
        text="未找到与“{{ searchText }}”相关的结果"
      />
      <NoData v-else text="请输入关键词进行搜索" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchText: '',
      searchResults: []
    }
  }
}
</script>
```

### 示例10：带操作按钮的无数据状态

```vue
<template>
  <div class="empty-state">
    <NoData>
      <template>
        <div class="empty-content">
          <p>暂无数据</p>
          <Button type="primary" @click="handleAdd">添加数据</Button>
        </div>
      </template>
    </NoData>
  </div>
</template>

<script>
export default {
  methods: {
    handleAdd() {
      // 添加数据的逻辑
    }
  }
}
</script>
```

## 样式说明

### className 选项

#### nodata（默认样式）
- 相对定位
- 文本居中
- 最小高度 190px
- 适用于局部区域的无数据展示

#### fullNodata（全屏样式）
- 绝对定位
- 距离顶部 180px
- 宽度 100%
- 内容居中显示
- 适用于全页面的无数据展示

### 图标类型

#### 默认图标（isSearchIcon = false）
- 使用 `nodata-default.png`（浅色主题）
- 使用 `nodata-dark.png`（深色主题）

#### 搜索图标（isSearchIcon = true）
- 使用 `no-search-result-default.png`（浅色主题）
- 使用 `no-search-result-dark.png`（深色主题）

### 布局选项

#### 垂直居中（isVerticalCenter = true）
- 绝对定位
- 水平和垂直都居中
- 最大高度 190px
- 适用于需要在容器中居中显示的场景

## 主题支持

组件自动支持深色主题切换：
- 浅色主题：使用默认图片
- 深色主题：自动切换到深色图片

## 注意事项

1. 组件使用 `this.$t('page.nodata')` 作为默认文本，确保项目中已配置国际化
2. 使用 `fullNodata` 类名时，父容器需要有相对定位或固定定位
3. 使用 `isVerticalCenter` 时，父容器需要有明确的高度和 `position: relative`
4. 组件图片路径使用 `@img-module` 别名，确保项目中已配置该别名
5. 在表格中使用时，建议配合表格的 empty 插槽使用
6. 自定义插槽内容时，注意保持样式的一致性

## 常见使用场景

1. **表格空状态** - 表格没有数据时显示
2. **列表空状态** - 列表没有数据时显示
3. **搜索无结果** - 搜索没有匹配结果时显示
4. **页面空状态** - 整个页面没有数据时显示
5. **筛选无结果** - 筛选条件过滤后没有结果时显示

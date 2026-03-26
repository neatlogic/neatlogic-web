# ReferenceSelect 引用列表组件使用说明

## 组件概述

ReferenceSelect 是一个用于展示引用关系的下拉选择组件，支持从接口获取数据或直接使用本地数据，提供分页加载和跳转功能。

## 组件列表

- **ReferenceSelect.vue** - 下拉选择组件，支持点击展开引用列表
- **ReferenceList.vue** - 简单列表展示组件，直接展示引用内容

## ReferenceSelect 组件

### Props 参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| title | String | '引用列表' | 显示的标题文本 |
| isTable | Boolean | false | 是否在表格中使用 |
| referenceCount | Number | 0 | 引用数量 |
| calleeType | String | null | 引用类型 |
| isMargin | Boolean | false | 是否添加右边距 |
| arrLength | Number | null | 外部数据长度，用于判断是否显示省略号 |
| id | Number | null | 实体ID |
| uuid | String | null | 实体UUID |
| pageSize | Number | 10 | 每页显示数量 |
| placement | String | 'bottom-start' | 下拉框位置 |
| isIcon | Boolean | false | 是否显示工具图标 |
| isMove | Boolean | false | 超过10个时是否显示省略号 |
| isUrl | Boolean | true | 是否通过接口获取数据（false时使用dataList） |
| dataList | Array | [] | 本地数据列表（isUrl为false时使用） |
| textName | String | 'text' | 显示文本的字段名 |
| valueName | String | 'value' | 值的字段名 |
| jumpPath | String | '' | 跳转路径 |
| referenceName | String | '' | 数字前面的文案（isTable为true时使用） |
| numberClassName | String | '' | 数字样式类名 |
| isShowStatus | Boolean | false | 是否显示状态 |
| statusText | String | 'versionStatusText' | 状态文本字段名 |
| statusValue | String | 'versionStatus' | 状态值字段名 |

### 使用示例

#### 示例1：从接口获取数据

```vue
<template>
  <ReferenceSelect
    :referenceCount="count"
    :calleeType="'asset'"
    :id="assetId"
    :jumpPath="'/asset/detail?id='"
    @on-visible-change="handleVisibleChange"
  />
</template>

<script>
export default {
  components: {
    ReferenceSelect: () => import('@/resources/components/ReferenceSelect/ReferenceSelect.vue')
  },
  data() {
    return {
      count: 5,
      assetId: 123
    };
  },
  methods: {
    handleVisibleChange(visible) {
      console.log('下拉框显示状态:', visible);
    }
  }
};
</script>
```

#### 示例2：使用本地数据

```vue
<template>
  <ReferenceSelect
    :isUrl="false"
    :referenceCount="dataList.length"
    :dataList="localData"
    :textName="'name'"
    :valueName="'id'"
    :jumpPath="'/detail?id='"
  />
</template>

<script>
export default {
  components: {
    ReferenceSelect: () => import('@/resources/components/ReferenceSelect/ReferenceSelect.vue')
  },
  data() {
    return {
      dataList: [
        { id: 1, name: '引用项1' },
        { id: 2, name: '引用项2' },
        { id: 3, name: '引用项3' }
      ]
    };
  }
};
</script>
```

#### 示例3：在表格中使用

```vue
<template>
  <TsTable  :theadList="theadList" :tbodyList="tbodyList">
    <template #reference="{ row }">
      <ReferenceSelect
        :isTable="true"
        :referenceCount="row.referenceCount"
        :calleeType="'asset'"
        :uuid="row.uuid"
      />
    </template>
  </TsTable>
</template>

<script>
export default {
  components: {
    TsTable: () => import('@/resources/components/TsTable/TsTable.vue'),
    ReferenceSelect: () => import('@/resources/components/ReferenceSelect/ReferenceSelect.vue')
  },
  data() {
    return {
      columns: [
        { title: '名称', key: 'name' },
        { title: '引用', slot: 'reference' }
      ],
      tableData: [
        { id: 1, name: '资产1', referenceCount: 3 },
        { id: 2, name: '资产2', referenceCount: 5 }
      ]
    };
  }
};
</script>
```

#### 示例4：显示状态信息

```vue
<template>
  <ReferenceSelect
    :referenceCount="count"
    :calleeType="'version'"
    :id="versionId"
    :isShowStatus="true"
    :statusText="'statusText'"
    :statusValue="'statusValue'"
    :jumpPath="'/version/detail?id='"
  />
</template>

<script>
export default {
  components: {
    ReferenceSelect: () => import('@/resources/components/ReferenceSelect/ReferenceSelect.vue')
  },
  data() {
    return {
      count: 8,
      versionId: 456
    };
  }
};
</script>
```

#### 示例5：自定义样式和位置

```vue
<template>
  <ReferenceSelect
    title="我的引用"
    :referenceCount="count"
    :calleeType="'asset'"
    :id="assetId"
    :isIcon="true"
    :isMargin="true"
    :placement="'right-start'"
    :numberClassName="'custom-number'"
    :jumpPath="'/asset/detail?id='"
  />
</template>

<style>
.custom-number {
  color: #ff6600;
  font-weight: bold;
}
</style>
```

### 接口说明

组件会调用 `/api/rest/dependency/list` 接口获取引用列表数据。

**请求参数：**
- `calleeType`: 引用类型（必填）
- `id`: 实体ID（id和uuid至少传一个）
- `uuid`: 实体UUID（id和uuid至少传一个）
- `currentPage`: 当前页码
- `pageSize`: 每页数量

**返回数据：**
```json
{
  "Status": "OK",
  "Return": {
    "list": [
      {
        "text": "引用项文本",
        "value": "引用项ID",
        "config": {
          "statusValue": "状态值",
          "statusText": "状态文本"
        }
      }
    ],
    "pageCount": 3
  }
}
```

### 功能特性

1. **分页加载**：滚动到底部自动加载下一页数据
2. **点击外部关闭**：点击下拉框外部自动关闭
3. **窗口自适应**：窗口大小改变时自动关闭下拉框
4. **状态显示**：支持显示每个引用项的状态信息
5. **跳转功能**：点击引用项可跳转到指定页面

### 注意事项

1. 使用接口模式时，`id` 和 `uuid` 至少需要传递一个
2. `isUrl` 为 `false` 时，必须提供 `dataList` 数据
3. 跳转功能需要配置 `jumpPath` 参数
4. 组件依赖 `CommonStatus` 组件显示状态信息
5. 使用 `v-click-outside` 指令处理点击外部关闭功能

## ReferenceList 组件

### Props 参数

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| id | Number | null | 实体ID |
| uuid | String | null | 实体UUID |
| calleeType | String | null | 引用类型 |
| pageSize | Number | 10 | 每页显示数量 |

### 使用示例

```vue
<template>
  <ReferenceList
    :calleeType="'asset'"
    :id="assetId"
    :pageSize="20"
  />
</template>

<script>
export default {
  components: {
    ReferenceList: () => import('@/resources/components/ReferenceSelect/ReferenceList.vue')
  },
  data() {
    return {
      assetId: 123
    };
  }
};
</script>
```

### 功能特性

1. **分页加载**：点击"查看更多"加载下一页
2. **提示框**：鼠标悬停显示完整路径
3. **自动加载**：组件挂载时自动加载第一页数据

### 注意事项

1. `id` 和 `uuid` 至少需要传递一个
2. 组件会自动调用接口获取数据
3. 返回数据需要包含 `text` 和 `path` 字段

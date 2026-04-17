## 复杂上传对话框组件

### 组件描述

ComplexUploadDialog 是一个支持二次确认的文件上传组件，用于处理复杂的文件导入场景。组件在上传成功后，会根据后端返回的数据智能判断是否需要显示二次选择弹窗或覆盖确认弹窗。

### 功能特性

1. **文件上传**：支持上传指定格式的文件（默认 .pak 格式）
2. **智能二次弹窗**：
   - 当上传的数据已存在时，弹出覆盖确认弹窗
   - 当上传的数据不存在覆盖问题时，显示数据选择弹窗，允许用户选择需要导入的数据项
3. **多级选择**：
   - 支持顶层全选/取消全选
   - 支持二级分类全选/取消全选
   - 支持单个选项的选择
4. **错误提示**：导入失败时显示详细的错误信息列表

### Props

| 参数 | 说明 | 类型 | 默认值 | 必填 |
|------|------|------|--------|------|
| targetType | 上传类型，用于标识上传的业务类型 | String | '' | 否 |
| url | 上传接口地址 | String | '' | 是 |
| uploadParams | 上传时的额外参数对象 | Object | {} | 否 |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| close | 对话框关闭事件 | (needRefresh: Boolean) - 是否需要刷新数据 |

### Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| showDialog | 打开上传对话框 | - |

### 使用流程

1. 调用 `showDialog()` 方法打开上传对话框
2. 用户选择文件并上传
3. 上传成功后，组件根据后端返回的数据判断：
   - **场景一**：如果返回数据中包含 `alreadyExists` 信息，弹出覆盖确认弹窗
     - 用户点击"覆盖"：直接提交数据
     - 用户点击"取消导入"：关闭对话框
   - **场景二**：如果返回数据中包含 `typeList`，显示数据选择弹窗
     - 用户可以选择需要导入的数据项
     - 点击"导入"按钮提交数据
   - **场景三**：如果返回数据为空或不需要选择，直接导入成功
4. 导入成功或失败后，触发 `@close` 事件

### 使用示例

```vue
<template>
  <div>
    <Button @click="openDialog">导入数据</Button>
    <ComplexUploadDialog 
      ref="complexUploadDialog" 
      :targetType="targetType" 
      url="/api/binary/deploy/app/pipeline/import" 
      @close="closeComplexUploadDialog"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      targetType: 'pipeline'
    };
  },
  methods: {
    openDialog() {
      this.$refs.complexUploadDialog.showDialog();
    },
    closeComplexUploadDialog(needRefresh) {
      if (needRefresh) {
        this.searchData();
      }
    },
    searchData() {
      // 刷新数据，重新请求接口
    }
  }
};
</script>
```

### 后端接口返回数据格式

#### 上传成功返回格式

```javascript
{
  "Status": "OK",
  "Return": {
    // 已存在数据信息（可选）
    "alreadyExists": {
      "name": "已存在的名称",
      "type": "类型"
    },
    // 数据类型列表（可选）
    "typeList": [
      {
        "text": "分类名称",
        "value": "分类值",
        "checkedAll": false, // 是否全选
        "optionList": [
          {
            "text": "选项名称",
            "value": "选项值",
            "checked": false // 是否选中
          }
        ]
      }
    ],
    "checkedAll": false // 是否全选
  }
}
```

#### 导入提交数据格式

组件会通过 FormData 提交以下数据：
- `targetType`: 上传类型
- `file`: 上传的文件对象
- `userSelection`: 用户选择的配置（JSON 字符串）

```javascript
{
  "checkedAll": false,
  "typeList": [
    {
      "text": "分类名称",
      "value": "分类值",
      "checkedAll": false,
      "optionList": [
        {
          "text": "选项名称",
          "value": "选项值",
          "checked": true
        }
      ]
    }
  ]
}
```

### 导入失败返回格式

```javascript
{
  "Status": "OK",
  "Return": {
    "messageList": [
      "错误信息1",
      "错误信息2"
    ]
  }
}
```

### 注意事项

1. **上传格式**：默认只支持 `.pak` 格式文件，如需修改格式，请修改组件内部配置
2. **单文件上传**：组件默认只支持单文件上传
3. **URL 必填**：使用时必须传入 `url` 参数，否则会提示错误
4. **国际化**：组件使用了 `$t()` 方法进行国际化处理，确保项目中已配置国际化
5. **依赖组件**：
   - TsDialog：对话框组件
   - UploadDialog：基础上传组件
   - Alert：提示组件
   - CheckboxGroup/Checkbox：复选框组件

### 样式说明

组件使用了 scoped 样式，主要样式类：
- `.common-auth`: 主容器样式
- `.wrapper`: 包装容器
- `.item`: 选项项样式
- `.check-all-text-pr`: 全选文本样式

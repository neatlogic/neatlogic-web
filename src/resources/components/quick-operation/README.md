# QuickOperation 快捷操作组件使用说明

## 组件简介

QuickOperation 用于在数据源选择框旁提供“编辑”和“刷新”操作，支持矩阵数据源、CMDB 模型和 CMDB 自定义视图。

- **编辑**：根据 `config` 在新标签页打开对应页面，悬停提示使用国际化文案 `page.edit`。
- **刷新**：触发 `refresh` 事件，由父组件重新获取数据，悬停提示使用国际化文案 `page.refresh`。
- 组件容器会阻止点击事件冒泡，适合放在表单或列表的操作区域。

## Props 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| config | Object | 跳转配置，字段见下表。使用时应显式传入配置对象。 |

### config 配置

| 字段 | 类型 | 适用场景 | 说明 |
|------|------|----------|------|
| module | String | 所有场景 | `framework` 表示矩阵数据源，`cmdb` 表示配置管理。 |
| uuid | String | `framework` | 矩阵 UUID；为空时打开矩阵概览页并显示新建矩阵弹窗。 |
| name | String | `framework` | 矩阵名称，作为跳转页面的查询参数传递；编辑已有矩阵时应一并传入。 |
| type | String | 所有场景 | 矩阵场景为数据源类型；CMDB 场景为 `ci` 或 `customView`，详见跳转规则。 |
| ciId | String / Number | `cmdb` + `ci` | 模型 ID。 |
| customViewId | String / Number | `cmdb` + `customView` | 自定义视图 ID。 |

## 编辑跳转规则

### 矩阵数据源

当 `module` 为 `framework` 时，调用 `$utils.matrixDataSourceRedirect(config.uuid, config)`。

| 条件 | 跳转地址（相对于 HOME） |
|------|--------------------------------------|
| `uuid` 为空 | `/framework.html#/matrix-overview?matrixFormDialogShow=true` |
| `type` 为 `external` | `/framework.html#/matrix-external-edit` |
| `type` 为 `view`、`cmdbci` 或 `cmdbcustomview` | `/framework.html#/matrix-view-edit` |
| `type` 为 `private` | `/framework.html#/matrix-private` |
| 其他 `type` | `/framework.html#/matrix-edit` |

编辑已有矩阵时，地址还会携带 `uuid`、`name` 和 `type` 查询参数。

### CMDB

| 配置 | 跳转地址（相对于 HOME） |
|------|--------------------------------------|
| `module: 'cmdb'`，`type: 'ci'` | `/cmdb.html#/ci-detail/{ciId}` |
| `module: 'cmdb'`，`type: 'customView'` | `/cmdb.html#/view-data/{customViewId}` |

其他 `module`，或 CMDB 下未支持的 `type`，不会执行跳转。

## Events 事件

| 事件名 | 触发时机 | 回调参数 |
|--------|----------|----------|
| refresh | 点击刷新图标时触发 | 无 |

组件本身不发起刷新请求，也不更新数据或显示刷新成功提示。这些逻辑需要在父组件的 `refresh` 回调中实现。

## 使用示例

### 矩阵数据源

下面示例通过更新 `TsFormSelect` 的请求地址重新加载矩阵列表。

```vue
<template>
  <div>
    <TsFormSelect
      v-model="matrixUuid"
      :dynamicUrl="matrixDynamicUrl"
      rootName="tbodyList"
      textName="name"
      valueName="uuid"
      :selectItemList.sync="selectedMatrix"
    ></TsFormSelect>
    <QuickOperation
      :config="{
        module: 'framework',
        uuid: matrixUuid,
        name: selectedMatrix.name,
        type: selectedMatrix.type
      }"
      @refresh="refreshMatrixList"
    ></QuickOperation>
  </div>
</template>

<script>
export default {
  components: {
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    QuickOperation: () => import('@/resources/components/quick-operation/index.vue')
  },
  data() {
    return {
      matrixUuid: '',
      selectedMatrix: {},
      matrixDynamicUrl: '/api/rest/matrix/search'
    };
  },
  methods: {
    refreshMatrixList() {
      this.matrixDynamicUrl = '/api/rest/matrix/search?refreshuuid=' + this.$utils.setUuid();
    }
  }
};
</script>
```

### CMDB 模型和自定义视图

在父组件中注册 `QuickOperation` 后，根据选择的数据传入对应 ID，并实现各自的刷新方法：

```vue
<!-- 模型：ciId 为当前选中的模型 ID -->
<QuickOperation
  :config="{ module: 'cmdb', type: 'ci', ciId }"
  @refresh="refreshCiList"
></QuickOperation>

<!-- 自定义视图：customViewId 为当前选中的视图 ID -->
<QuickOperation
  :config="{ module: 'cmdb', type: 'customView', customViewId }"
  @refresh="refreshCustomViewList"
></QuickOperation>
```

## 使用注意事项

- 两个图标始终显示，组件没有 `disabled` 属性，也不校验 ID。CMDB 场景应由父组件保证对应 ID 有效，必要时通过 `v-if` 控制组件显示。
- 组件依赖项目提供的 `$t`、`$utils.matrixDataSourceRedirect`、全局 `HOME` 以及图标和间距样式，应在项目环境中使用。
- 组件未提供自定义插槽。

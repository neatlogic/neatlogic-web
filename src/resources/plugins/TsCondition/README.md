# TsCondition

条件分组编辑模板，用于展示“条件字段 + 运算符 + 条件值”，并配置组内条件及条件组之间的连接关系。

## 当前状态

`TsCondition.vue` 目前仅包含模板结构，尚未完成独立组件封装：

- `name` 为空，`components`、`props`、`methods`、`computed`、`watch` 均为空，`data()` 返回空对象。
- 模板引用的 `editRuleConfig`、`ruleConditionList`、`relList` 及相关方法尚未定义。
- 未声明 `model`，未通过 `$emit` 暴露事件，也未提供插槽、校验或提交接口。
- 当前目录没有用于 `Vue.use()` 的插件入口，仓库中未找到直接引用此组件的代码。

因此，当前文件不能直接作为完整的条件编辑组件使用。下文描述的是现有模板的数据依赖和交互约定，不代表已经实现的对外 API；仅在父组件中声明同名数据或传入未声明的属性，无法补齐这些依赖。

## 模板结构与交互

每个条件组遍历 `conditionList`，每行依次展示：

| 区域 | 数据绑定 | 行为 |
| --- | --- | --- |
| 条件字段 | `conItem.name` | 从 `ruleConditionList` 选择，使用 `name` 作为值、`label` 作为显示文本，支持搜索；变化时调用 `changeConItem(conItem)`。 |
| 运算符 | `conItem.expression` | 选项来自 `getExpressionList(conItem.name)`，使用 `expression` 作为值、`expressionName` 作为显示文本；变化时调用 `changeExpression(conItem)`。 |
| 条件值 | `conItem.valueList` | 仅当 `isShowConditionValue == 1` 且该值为真值时显示；通过动态组件编辑。 |
| 添加条件 | 无 | 点击加号调用 `addCondition(item)`，其中 `item` 为当前条件组。 |
| 删除条件 | 无 | 组内条件数大于 1 时显示减号，调用 `delCondition(item, conIdex)`。 |
| 组内连接关系 | `item.conditionRelList[conIdex].joinType` | 在相邻条件之间显示，从 `relList` 选择，不允许清空。 |
| 组间连接关系 | `editRuleConfig.conditionGroupRelList[groupIndex].joinType` | 在相邻条件组之间显示，从 `relList` 选择，不允许清空。 |
| 删除条件组 | 无 | 条件组数大于 1 时显示关闭按钮，调用 `delGroup(groupIndex)`。 |

模板没有新增条件组按钮，也没有保存、取消、只读展示或执行条件判断的逻辑。

## 数据结构

### 条件配置 `editRuleConfig`

以下示例用于说明模板读取的数据结构，需先在组件内部或后续封装中实现数据接入。字段名、运算符和值仅为示意，实际取值由业务配置决定。

```js
const editRuleConfig = {
  conditionGroupList: [
    {
      conditionList: [
        {
          name: 'status',
          expression: 'equal',
          valueList: ['open'],
          isShowConditionValue: 1
        },
        {
          name: 'priority',
          expression: 'equal',
          valueList: ['high'],
          isShowConditionValue: 1
        }
      ],
      conditionRelList: [{ joinType: 'and' }]
    },
    {
      conditionList: [
        {
          name: 'status',
          expression: 'isEmpty',
          valueList: [],
          isShowConditionValue: 0
        }
      ],
      conditionRelList: []
    }
  ],
  conditionGroupRelList: [{ joinType: 'or' }]
};
```

此例表达的组合关系为：`(status equal open AND priority equal high) OR (status isEmpty)`。关系的实际计算和提交格式需由业务实现。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `conditionGroupList` | Array | 条件组列表；模板直接读取该字段，初始化时必须提供。 |
| `conditionGroupList[].conditionList` | Array | 当前组内的条件列表。 |
| `conditionGroupList[].conditionRelList` | Array | 组内相邻条件的关系对象列表，每项至少包含 `joinType`。 |
| `conditionGroupRelList` | Array | 相邻条件组的关系对象列表，每项至少包含 `joinType`。 |
| `conditionList[].name` | String | 条件字段标识，与选项中的 `name` 对应。 |
| `conditionList[].expression` | String | 运算符标识，与选项中的 `expression` 对应。 |
| `conditionList[].valueList` | 由值组件决定 | 动态值组件的 `v-model` 数据，不能仅根据字段名称假定为数组。 |
| `conditionList[].isShowConditionValue` | Number | 通常使用 `1` 显示条件值、`0` 隐藏条件值。 |

模板按数组下标直接访问关系对象，没有空值保护。包含 N 个条件的组应提供 N − 1 个组内关系对象，包含 M 个条件组时应提供 M − 1 个组间关系对象。新增、删除或调整顺序时，需要同步维护关系数组。

### 字段与运算符选项

字段下拉框直接使用以下字段：

```js
const ruleConditionList = [
  { name: 'status', label: '状态' },
  { name: 'priority', label: '优先级' }
];
```

`getExpressionList(name)` 需要返回对应字段的运算符列表，例如：

```js
[
  { expression: 'equal', expressionName: '等于', isShowConditionValue: 1 },
  { expression: 'isEmpty', expressionName: '为空', isShowConditionValue: 0 }
]
```

其中 `isShowConditionValue` 不会由模板自动复制到条件项，需要在 `changeExpression(conItem)` 中完成同步。

连接关系下拉框未指定 `valueName`、`textName`，应采用 `TsFormSelect` 默认的 `value`、`text` 结构，例如：

```js
const relList = [
  { text: '且', value: 'and' },
  { text: '或', value: 'or' }
];
```

## 值组件与方法依赖

条件值通过以下模板动态渲染：

```vue
<div
  :is="handlerType(conItem.name)"
  v-model="conItem.valueList"
  :config="getselectConfig(conItem.name)"
></div>
```

`handlerType(name)` 需返回可解析的组件名称或组件定义；对应组件应支持 `v-model` 并接收 `config` 属性。使用组件名称时，需在当前组件或全局完成注册。

现有模板依赖下列方法，但 `TsCondition.vue` 尚未提供实现：

| 方法 | 需要承担的职责 |
| --- | --- |
| `getExpressionList(name)` | 按字段返回运算符选项数组。 |
| `handlerType(name)` | 按字段返回条件值编辑组件。 |
| `getselectConfig(name)` | 按字段返回传给值组件的配置；方法名中的小写 `select` 与源码保持一致。 |
| `changeConItem(conItem)` | 处理字段变化，重置或同步运算符、条件值等关联数据。 |
| `changeExpression(conItem)` | 处理运算符变化，更新值输入区域的显示状态及条件值。 |
| `addCondition(group)` | 添加条件并维护组内连接关系。 |
| `delCondition(group, index)` | 删除条件并维护组内连接关系。 |
| `delGroup(groupIndex)` | 删除条件组并维护组间连接关系。 |

## 接入说明

后续完成封装时，需要先补齐数据、方法和组件注册，再确定对外的配置传入、变更通知及校验接口。当前没有可直接使用的 `v-model`、`@change` 或 `valid()` API。

模板依赖 `TsRow`、`Col`、`TsFormSelect` 以及按字段选择的动态值组件。`TsCondition.vue` 当前未局部注册这些组件，接入时需根据项目环境注册。样式部分为空，布局使用了 `group-border`、`group-content`、`condition-content`、`condition-joinType`、`delGroup` 等类名，需确认页面中存在相应样式。

可参考仓库中的相关实现，但其数据和 API 不应直接视为本组件已经具备的能力：

- [流程条件节点编辑](../../../views/pages/process/flow/flowedit/components/condition-node.vue)：包含相近的模板及字段、运算符联动、条件增删和关系维护逻辑。
- [通用条件分组组件](../../components/Condition/condition-group.vue)：另一套条件分组实现，接入前需核对其配置格式和适用场景。

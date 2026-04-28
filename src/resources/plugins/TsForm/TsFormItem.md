# TsFormItem 组件说明

`TsFormItem` 是一个表单项容器组件，用于统一管理 `label`、必填标识、布局方式、提示信息以及内容区域的对齐方式。

支持能力：
- 左右 / 上下布局
- `label` 宽度控制
- 必填标识自动识别
- `tooltip` 提示
- 自定义按钮组
- 内容对齐
- `disabled` / `readonly` 状态控制

## 基础用法

```vue
<TsFormItem label="用户名" required>
  <TsFormInput v-model="form.name"></TsFormInput>
</TsFormItem>
```

## Props 参数说明

| 参数 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| label | String | `''` | 否 | 表单项标题 |
| labelWidth | Number | `120` | 否 | `label` 宽度，`labelPosition !== 'top'` 时生效 |
| labelStrong | Boolean | `false` | 否 | 是否加粗 `label` |
| error | String | - | 否 | 兼容保留字段 |
| labelFor | String | - | 否 | 关联输入框 `id` |
| labelPosition | String | `'right'` | 否 | `label` 位置，常用值为 `right` / `left` / `top` |
| labelAlign | String | `'top'` | 否 | 非 `top` 布局下的垂直对齐方式，支持 `top` / `center` |
| contentAlign | String | - | 否 | 内容区水平对齐方式 |
| validateList | Array | `[]` | 否 | 校验规则数组，用于推断必填态 |
| name | String | - | 否 | 字段名 |
| itemWidth | Number / String | `'100%'` | 否 | 表单项整体宽度 |
| required | Boolean | `false` | 否 | 是否必填 |
| tooltip | String | `''` | 否 | `label` 右侧提示内容 |
| tipPlacement | String | `'top'` | 否 | `tooltip` 展示方向 |
| type | String | `''` | 否 | 类型标识 |
| readonly | Boolean | `false` | 否 | 只读状态 |
| disabled | Boolean | `false` | 否 | 禁用状态 |
| buttonList | Array | - | 否 | `label` 右侧按钮配置，仅 `labelPosition === 'top'` 时显示 |
| theme | Object | - | 否 | 主题配置 |

## 入参示例

```javascript
config: {
  label: 'labelname',
  labelWidth: 100,
  labelPosition: 'right',
  required: true,
  itemWidth: '100%'
}
```

## 注意事项

- `labelWidth` 仅在 `labelPosition !== 'top'` 时生效。
- 内容区通过 `margin-left` 与 `label` 对齐。
- 必填态会根据 `validateList` 与 `required` 共同推断。
- `tooltip` 仍支持 HTML 渲染，仅应传入可信内容，避免将未清洗的用户输入直接透传给 `v-html`。
- `buttonList` 中的 `click` 建议传函数；组件已做兜底保护，缺失时不会因点击直接报错。
- 为兼容历史调用，`onFieldBlur()` / `onFieldChange()` 仍保留可调用入口，但默认不会执行额外校验逻辑。

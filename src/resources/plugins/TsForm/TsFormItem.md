# TsFormItem 组件说明

TsFormItem 是一个表单项容器组件，用于统一管理 label、必填标识、布局方式、提示信息以及校验状态等。

支持：
- 左右 / 上下布局
- label 宽度控制
- 必填标识自动识别
- tooltip 提示
- 自定义按钮组
- 内容对齐
- disabled / readonly 状态控制

## 基础用法
```javascript
<TsFormItem label="用户名" required>
  <TsFormInput v-model="form.name"></TsFormInput>
</TsFormItem>
```

## Props 参数说明

| 参数            | 类型              | 默认值    | 必填 | 说明                                |
| ------------- | --------------- | ------ | -- | --------------------------------- |
| label         | String          | ''     | 否  | 表单项标签文本                           |
| labelWidth    | Number          | 120    | 否  | label 宽度（px），非 top 模式生效           |
| labelStrong   | Boolean         | false  | 否  | 是否加粗 label                        |
| labelPosition | String          | right  | 否  | label 位置：`right` / `left` / `top` |
| labelAlign    | String          | top    | 否  | label 垂直对齐方式：`top` / `center`     |
| contentAlign  | String          | -      | 否  | 内容水平对齐方式                          |
| required      | Boolean         | false  | 否  | 是否必填                              |
| validateList  | Array           | []     | 否  | 校验规则数组                            |
| error         | String          | -      | 否  | 错误提示文本                            |
| labelFor      | String          | -      | 否  | 关联 input 的 id                     |
| itemWidth     | Number / String | '100%' | 否  | 整个表单项宽度                           |
| tooltip       | String          | ''     | 否  | label 右侧提示内容                      |
| tipPlacement  | String          | 'top'  | 否  | tooltip 显示方向                      |
| readonly      | Boolean         | false  | 否  | 只读状态                              |
| disabled      | Boolean         | false  | 否  | 禁用状态                              |
| buttonList    | Array           | -      | 否  | label 右侧按钮组                       |
| name          | String          | -      | 否  | 字段名称                              |
| type          | String          | ''     | 否  | 类型标识                              |
| theme         | Object          | -      | 否  | 主题配置                              |


## 入参

```javascript
config:{
  label:"labelname",
  labelWidth:100,
  labelPosition:"right",
  required:true,
  itemWidth:"100%",
}
```
### 注意事项

- labelWidth 仅在 labelPosition !== 'top' 时生效
- contentStyles 使用 margin-left 控制布局
- required 会自动根据 validateList 推断 
- buttonList 仅在 labelPosition = top 时显示

# TsFormDatePicker

TsFormDatePicker 日期时间选择器

基于 iView DatePicker / TimePicker 封装的表单组件，支持：

- 日期 / 时间 / 年 / 月
- 范围选择
- 多选
- 时间戳输出
- confirm 模式
- 手动控制 open
- 不可选时间限制
- 校验集成
- 只读模式展示优化

------------------------------------------------------------------------

# 基础用法

``` vue
<TsFormDatePicker
  v-model="value"
  v-bind="config"
></TsFormDatePicker>
```

------------------------------------------------------------------------

# Props 参数说明

## 基础参数
| 参数          | 类型                    | 默认值    | 必传 | 说明                                                                            |
| -----------   | ----------------------- | ----------| -- | ----------------------------------------------------------------------------- |
| value         | String / Number / Array | -         | 是  | 绑定值（支持时间戳）                                                                    |
| type          | String                  | -         | 是  | date / datetime / daterange / datetimerange / year / month / time / timerange |
| format        | String                  | 自动生成  | 否  | 显示格式，如 yyyy-MM-dd HH:mm:ss                                                    |
| valueType     | String                  | normal    | 否  | normal / timestamp / format                                                   |
| multiple      | Boolean                 | false     | 否  | 是否支持多选                                                                        |
| clearable     | Boolean                 | true      | 否  | 是否可清空                                                                         |
| disabled      | Boolean                 | false     | 否  | 是否禁用                                                                          |
| readonly      | Boolean                 | false     | 否  | 是否只读                                                                          |
| placeholder   | String                  | 自动生成  | 否 | 占位符                                                                           |
| separator     | String                  | -        |否              |    范围分隔符|
| width         | String / Number         | 100%      |否                   | 宽度                      |
| size          | String                  | default   |否               | large / small / default |
| border        | String                  | -         |否            | border / bottom / none  |
| className     | String                  | -         |否               | 外层自定义 class             |
| readonlyClass | String                  | text-grey tsform-readonly  |否 | 只读模式样式                  |
| placement     | String                  | bottom-start               |否  | 弹层位置                    |
| transfer      | Boolean                 | false                      |否 | 是否挂载到 body              |
| splitPanels   | Boolean                 | false                     |否  | range 时是否联动             |
| validateList  | Array                   | -        |否  | 校验规则                             |
| errorMessage  | String                  | -        |否 | 外部控制错误提示                         |
| desc          | String                  | -        |否 | 描述文案                             |
| descType      | String                  | -        |否 | info / success / warning / error |

## 控制
| 参数              | 类型              | 默认值   | 说明              |
| --------------- | --------------- | ----- | --------------- |
| confirm         | Boolean         | false | 是否开启确认模式        |
| open            | Boolean         | null  | 手动控制展开          |
| scrollParent    | Object / String | -     | 滚动监听容器          |
| options         | Object          | -     | DatePicker 扩展配置 |
| selectableRange | Function        | null  | 限制可选时间          |
| timePickerOptions | Object        | null  | 设置时间参数          |
| isChangeWrite   | Boolean         | true  | 赋值时是否触发 on-change 事件 |
| onBlur          | Function        | -     | 失焦回调            |
| onFocus         | Function        | -     | 聚焦回调            |
| onChange        | Function        | -     | 值变化回调           |


------------------------------------------------------------------------
# 事件

| 事件名             | 说明           | 参数    |
| --------------- | ------------ | ----- |
| change          | 值变化          | value |
| update:value    | 同步更新值        | value |
| on-change       | 主动触发         | value |
| on-ok           | confirm 模式确认 | -     |
| on-clear        | 清空时触发        | -     |
| on-clickoutside | 点击外部关闭       | -     |

# 支持的 type 类型
| 类型            | 说明     |
| ------------- | ------ |
| date          | 日期     |
| datetime      | 日期时间   |
| daterange     | 日期范围   |
| datetimerange | 日期时间范围 |
| year          | 年      |
| month         | 月      |
| time          | 时间     |
| timerange     | 时间范围   |


------------------------------------------------------------------------

# valueType 说明

| 类型        | 说明             |
| --------- | -------------- |
| normal    | 按 format 输出字符串 |
| timestamp | 输出时间戳          |
| format    | 强制格式化字符串       |


------------------------------------------------------------------------
# options 示例
```js
options: {
  disabledDate(date) {
    return date && date.valueOf() < Date.now() - 86400000
  },
  shortcuts: [
    {
      text: '今天',
      value: () => new Date(),
      onClick() {}
    }
  ]
}
```
# 插槽
## 默认插槽
```vue
<TsFormDatePicker>
  自定义内容
</TsFormDatePicker>
```
## validMessage（自定义错误提示）
```vue
<TsFormDatePicker>
  <template v-slot:validMessage>
    <span class="custom-error">自定义错误提示</span>
  </template>
</TsFormDatePicker>
```

# confirm 模式说明
当 confirm = true 时：
- 选择日期后不会自动关闭
- 需要点击确定按钮
- 推荐配合 open + slot 使用

# selectableRange 示例

``` js
selectableRange: () => {
  const now = new Date().getTime()
  return [now + 5 * 60 * 1000, 0]
}
```
------------------------------------------------------------------------

# 完整 config 示例
``` js
config: {
  type: "datetime",
  width: "100%",
  format: "yyyy-MM-dd HH:mm:ss",
  multiple: false,
  disabled: false,
  readonly: false,
  placeholder: "",
  validateList: [],
  valueType: "format",
  splitPanels: false,
  transfer: false,
  border: "border",
  size: "default",
  desc: "",
  className: "",
  readonlyClass: "",
  scrollParent: "",
  options: {},
  errorMessage: "",
  confirm: false,
  open: null,
  onBlur() {},
  onFocus() {},
  onChange() {}
}
```

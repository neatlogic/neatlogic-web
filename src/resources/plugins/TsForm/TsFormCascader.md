# TsFormCascader 级联选择器

> 多层级数据选择组件，支持懒加载、字段映射、自定义节点渲染及表单联动。

---

## 组件介绍

# TsFormCascader 级联选择表单组件

基于 Cascader 二次封装，集成表单校验、只读模式、外部点击关闭、label 输出、数据格式转换等能力。

适用于：

- 省市区选择
- 组织架构选择
- 多级菜单选择
- 业务分类选择

---

## 基础用法

```vue
<template>
  <TsFormCascader
    v-model="form.category"
    :dataList="options"
  ></TsFormCascader>
</template>

<script>
export default {
  data() {
    return {
      form: {
        category: []
      },
      options: [
        {
          value: 'zhejiang',
          label: '浙江',
          children: [
            {
              value: 'hangzhou',
              label: '杭州'
            }
          ]
        }
      ]
    }
  }
}
</script>
```

## Props参数

| 名称             | 类型             | 默认值                     | 说明                  |
| -------------- | -------------- | ----------------------- | ------------------- |
| value          | Array / String | null                    | 当前选中值               |
| dataList       | Array          | -                       | 级联数据源               |
| validateList   | Array          | -                       | 校验规则                |
| format         | Function       | -                       | 自定义显示格式函数           |
| disabled       | Boolean        | false                   | 是否禁用组件              |
| changeOnSelect | Boolean        | false                   | 是否每一级选择都触发变更        |
| trigger        | String         | click                   | 触发方式（click / hover） |
| border         | String         | border/ none/ bottom    | 边框样式                |
| clearable      | Boolean        | true                    | 是否显示清空按钮            |
| placeholder    | String         | $t('page.pleaseselect') | 占位文本                |
| filterable     | Boolean        | false                   | 是否可搜索               |
| transfer       | Boolean        | false                   | 是否使用 transfer 模式    |
| isChangeWrite  | Boolean        | true                    | 赋值时是否触发 on-change   |
| onChange       | Function       | -                       | 外部变更回调函数            |


------------------------------------------------------------------------

## Events参数

| 事件名          | 参数                    | 说明            |
| ------------ | --------------------- | ------------- |
| change       | (value, selectedData) | 值变化时触发        |
| update:value | value                 | 同步更新 value    |
| on-change    | (value, selectedData) | 手动变更触发        |
| change-label | labels[]              | 返回选中 label 列表 |

------------------------------------------------------------------------

## 注意事项

- value 支持 Array 或 String，内部统一转为 Array 处理。

- dataList 必须为树形结构。

- 如果 value 与 currentValue 相同，不会重复触发校验。

- transfer 为 true 时，需要注意 DOM 挂载位置。

- change-label 事件返回的是 label 数组。


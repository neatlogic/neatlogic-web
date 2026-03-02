# TsForm 组件说明文档

> 组件名称：TsForm\
> 类型：动态表单式表格容器

------------------------------------------------------------------------

# 组件简介

TsForm 是一个基于配置驱动的表单式表格容器组件，
用于构建后台管理系统中的动态表单区域、筛选区域及复杂配置页面。

特点：

-   动态渲染表单项
-   支持插槽扩展
-   支持全局只读/禁用控制
-   支持校验机制
-   支持栅格布局
-   支持统一数据收集（dataConfig）

------------------------------------------------------------------------

# 模板使用示例

``` vue
<TsForm :itemList="itemList" width="80%">

  <!-- 标题 Slot -->
  <template v-slot:name1-label>
    <div>
      我是标题 <span>提示</span>
    </div>
  </template>

  <!-- 控件 Slot -->
  <template v-slot:name2>
    <TsFormSelect
      v-model="itemList.name2.value"
      v-bind="itemList.name2"
      :selectItemList.sync="dataSourceJson"
      @on-change="changeFn()"
    >
      <template v-slot:first-ul>
        <li class="tsfont-plus text-href first-slot" @click="addList()">
          数据源
        </li>
      </template>
    </TsFormSelect>
  </template>

</TsForm>
```

------------------------------------------------------------------------

# Props 参数说明

| 参数名        | 类型               | 默认值       | 必填 | 说明                                     |
| ------------- | ------------------ | ----------- | --   | ------------------------------------- |
| labelPosition | `String`           | `right`     | 否  | label 显示位置：`right` / `left` / `top`   
| itemList      | `Array \| Object`  | -           | 是  | 表单项配置集合                               
| dataConfig    | `Object \| String \| Boolean` | -           | 否  | 控制所有控件 value 的数据集合（支持 `v-model` 双向绑定） 
| border        | `String`           | `border`    | 否  | 边框样式：`border` / `bottom` / `none`     
| labelWidth    | `Number`           | `120`       | 否  | label 宽度（仅在 `right` / `left` 布局时生效）   
| itemWidth     | `Number \| String` | `100%`      | 否  | 每项整体宽度（包含 label），用于栅格布局               
| width         | `String \| Number` | `100%`      | 否  | 控件区域宽度（不包含 label）                      
| labelAlign    | `String`           | `top`       | 否  | 左右布局时 label 垂直对齐方式：`top` / `center`   
| tooltip       | `String`           | -           | 否  | label 右侧提示文本                           
| tipPlacement  | `String`           | `top-start` | 否  | tooltip 显示方向                           
| filterEmpty   | `Boolean`          | `false`     | 否  | 是否自动过滤空值字段（常用于组合搜索组件）                 
| readonly      | `Boolean`          | `false`     | 否  | 全局只读控制（子项可单独覆盖）                        
| disabled      | `Boolean`          | `false`     | 否  | 全局禁用控制（子项可单独覆盖）                        
| isHidden      | `Boolean`          | `false`     | 否  | 是否隐藏整个表单                              
| theme         | `Object`           | -           | 否  | 自定义主题样式配置                             


# 组件方法（通过 ref 调用）

``` vue
<TsForm ref="tsForm" />
```
| 方法名          | 返回值       | 说明               |
| ------------ | --------- | ---------------- |
| valid        | `Boolean` | 校验表单是否通过         |
| clearForm    | `void`    | 清空表单值            |
| resetForm    | `void`    | 重置为初始化值（不建议频繁使用） |
| getFormValue | `Object`  | 获取当前表单值集合        |


示例：

``` js
this.$refs.tsForm.valid()
this.$refs.tsForm.getFormValue()
```

------------------------------------------------------------------------

# itemList 配置说明

## Object 格式（推荐）

``` js
itemList: {
  name1: {
    type: "text",
    label: "文本标题",
    hideLabel: false,
    isHidden: false,
    validateList: [
      "required",
      { name: "number", message: "必须为数字" },
      {
        name: "regex",
        pattern: "^[a-z]+$",
        message: "仅支持小写字母"
      },
      {
        name: "custom",
        message: "自定义错误",
        validator(rule, value) {
          return value ? true : false
        }
      }
    ],
    onChange(val) {}
  },
  name2: {
    type: "slot",
    label: "插槽标题",
    value: ""
  }
}
```

## Array 格式

``` js
itemList: [
  {
    name: "name1",
    type: "text",
    label: "名称"
  }
]
```

要求：

-   type 必须存在
-   name 必须存在且唯一

------------------------------------------------------------------------

# 支持的控件类型

text\
textarea\
number\
url\
email\
tel\
password\
select\
radio\
checkbox\
date\
datetime\
datetimerange\
year\
month\
time\
timerange\
tree\
quartz\
switch\
textspan\
slot\
ckeditor\
userselect\
teamselect\
roleselect\
codemirror\
timeselect\
cascader

------------------------------------------------------------------------

# Slot 说明

## 标题 Slot

``` vue
<template v-slot:name-label>
  自定义标题
</template>
```

## 控件 Slot

``` vue
<template v-slot:name>
  自定义控件
</template>
```

------------------------------------------------------------------------

# 数据结构说明

dataConfig 示例：

``` js
{
  name1: "value1",
  name2: "value2"
}
```


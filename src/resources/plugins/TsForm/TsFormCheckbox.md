# TsFormCheckbox

表单复选框组件。

基于 CheckboxGroup 封装，支持：

-   v-model 双向绑定
-   接口动态获取数据
-   只读模式
-   纵向/横向布局
-   表单校验
-   change-label 输出
-   自定义字段映射
-   自定义选项插槽

------------------------------------------------------------------------

# 基础用法

``` vue
<TsFormCheckbox
  v-model="value"
  :dataList="options"
></TsFormCheckbox>
```

------------------------------------------------------------------------

# v-model 机制

``` js
model: {
  prop: 'value',
  event: 'change'
}
```

------------------------------------------------------------------------

# Props 参数说明

| 参数名           | 类型       | 默认值       | 必填 | 说明                                     |
| ------------- | -------- | ---------- | -- | -------------------------------------- |
| value         | Array    | []         | 是  | 选中值数组（支持 v-model）                      |
| readonly      | Boolean  | false      | 否  | 是否只读                                   |
| disabled      | Boolean  | false      | 否  | 是否禁用                                   |
| vertical      | Boolean  | false      | 否  | 是否竖向排列                                 |
| validateList  | Array    | -          | 否  | 校验规则                                   |
| errorMessage  | String   | -          | 否  | 外层控制校验提示                               |
| desc          | String   | -          | 否  | 描述信息                                   |
| descType      | String   | -          | 否  | 描述类型（info / success / warning / error） |
| dataList      | Array    | -          | 否  | 选项数据（优先于 url）                          |
| dealDataByUrl | Function | -          | 否  | 接口数据处理函数                               |
| ajaxType      | String   | post       | 否  | 接口请求类型（post / get）                     |
| url           | String   | -          | 否  | 数据接口地址                                 |
| rootName      | String   | -          | 否  | 接口数据路径（支持 root1.root2）                 |
| valueName     | String   | value      | 否  | 选项值字段名                                 |
| textName      | String   | text       | 否  | 显示文本字段名                                |
| params        | Object   | -          | 否  | 接口请求参数                                 |
| className     | String   | -          | 否  | 自定义样式类名                                |
| sperateText   | String   | \|         | 否  | 只读模式下分隔符                               |
| isChangeWrite | Boolean  | true       | 否  | 赋值时是否触发 on-change 事件                    |
| onChange      | Function | -          | 否  | 值变化回调函数                                |

> 说明：
> - dataList 与 url 同时存在时，优先使用 url 数据
> - value 支持 Array 或 String，内部统一处理为数组
------------------------------------------------------------------------

# Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| change | (value, selectedItem) | 值变化 |
| update:value | value | 同步更新 |
| on-change | (value, selectedItem) | 主动变更触发 |
| change-label | labels[] | 返回选中项文本数组 |
------------------------------------------------------------------------

# 插槽(slot)
名称|slot-scope|用途|说明
:---:|:---:|:---:|:---
validMessage|无|普通的校验和属性errorMessage不能满足需求是，可以使用插槽|-
label|{node, index}|自定义选项显示内容|用于自定义每个复选框的显示内容

## validMessage

``` vue
<TsFormCheckbox v-model="value">
  <template v-slot:validMessage>
    <span class="custom-error">自定义错误提示</span>
  </template>
</TsFormCheckbox>
```

## label

``` vue
<TsFormCheckbox v-model="value" :dataList="options">
  <template v-slot:label="{node, index}">
    {{ node.text }} - {{ node.value }}
  </template>
</TsFormCheckbox>
```

------------------------------------------------------------------------
#  数据结构说明

## dataList 格式

```js
[
  {
    text: '名称',
    value: '值',
    disabled: false
  }
]
```

如果字段不同，可通过：

```js
valueName="id"
textName="name"
```

---

# 接口模式说明

当传入 url 时：

- 组件初始化时自动请求数据

- 使用 ajaxType 指定请求方式

- 使用 params 作为请求参数

- 使用 rootName 解析返回数据路径

- 使用 dealDataByUrl 处理数据

```js
{
  url: "/api/xxx",
  ajaxType: "post",
  params: {},
  rootName: "data.list"
}
```
```vue
dealDataByUrl(list) {
  return list.map(item => ({
    ...item,
    text: item.name,
    value: item.id
  }))
}
```
### 注意

- 返回格式要求：
  
  ```js
  {
    Status: 'OK',
    Return: [...]
  }
  ```

- 最大限制 500 条数据

---

# 完整配置

```vue
config: {
  dataList: [],
  readonly: true,
  disabled: false,
  rootName: "",
  valueName: "id",
  textName: "name",
  value: [],
  validateList: [],
  url: "/api/rest/matrix/column/data/search/forselect",
  params: {},
  className: "",
  onChange: function(){},
  vertical: false,
  errorMessage: "",
  desc: "",
  sperateText: "|",
  dealDataByUrl: function(list){ return list },
  ajaxType: "post"
}
```

# 校验逻辑

- 通过 formMixins 支持 valid()
- 值变更时自动触发校验
- 校验失败展示 validMesage
- 支持 validMessage 插槽覆盖

---


# 版本

适用于 Vue2 项目。

## 兼容说明

- URL 与本地 `dataList` 的选项都会先在组件内部复制后再处理，避免禁用态和历史值回填时污染父级传入的数据。
- 快速切换 `url` 或 `params` 时，组件只应用最后一次请求结果，避免旧请求回写覆盖新选项。
- 组件销毁时会同时取消请求并清理 `change-label` 的延迟定时器。

# TsFormRadio 组件说明
组件简介

TsFormRadio 是基于 RadioGroup / Radio 封装的单选框组件，支持：

- 本地数据 / URL 动态获取数据
- 表单校验
- 只读模式  
- 可取消选中（toggle）
- 描述提示（Tooltip）
- 选中值 & 选中文本双向同步
- 自定义 slot

## 基础用法
```javascript
<TsFormRadio v-model="value" v-bind="config"></TsFormRadio>
```

## Props 参数说明

| 参数            | 类型                                         | 默认值         | 必填 | 说明                     | 备注                                                   |
| ------------- | ------------------------------------------ | ----------- | -- | ---------------------- | ---------------------------------------------------- |
| value         | String / Number / Boolean / Object / Array | ''          | 是  | 控件绑定值（支持 v-model 双向绑定） | -                                                    |
| dataList      | Array                                      | -           | 否  | 本地下拉选项数据               | 格式：`{ text:'名称', value:'值', disabled:true }`         |
| url           | String                                     | ''          | 否  | 通过接口获取数据               | 组件初始化时调用                                             |
| params        | Object                                     | -           | 否  | 接口请求参数                 | 通过 url 获取数据时作为请求参数                                   |
| rootName      | String                                     | ''          | 否  | 接口返回数据的路径 key          | 支持层级：`root1.root2`                                   |
| ajaxType      | String                                     | post        | 否  | 接口请求类型                 | `post` / `get`                                       |
| valueName     | String                                     | value       | 否  | 选项中 value 对应字段名        | -                                                    |
| textName      | String                                     | text        | 否  | 选项中显示文本字段名             | -                                                    |
| descName      | String                                     | description | 否  | 每个选项描述字段名              | 用于 Tooltip 展示                                        |
| radioType     | String                                     | -           | 否  | Radio 显示样式             | `button` / `default`                                 |
| vertical      | Boolean                                    | false       | 否  | 是否纵向排列                 | true：竖向 / false：横向                                   |
| disabled      | Boolean                                    | false       | 否  | 是否禁用                   | 灰色背景 + 边框样式                                          |
| readonly      | Boolean                                    | false       | 否  | 是否只读                   | 显示只读文本，不渲染 Radio                                     |
| allowToggle   | Boolean                                    | false       | 否  | 是否支持反选                 | 点击已选中项可取消                                            |
| validateList  | Array                                      | -           | 否  | 校验规则集合                 | 与 tsform 联动                                          |
| errorMessage  | String                                     | ''          | 否  | 外层控制校验提示               | 优先显示外部传入                                             |
| desc          | String                                     | ''          | 否  | 组件底部描述信息               | -                                                    |
| descType      | String                                     | ''          | 否  | 描述显示类型                 | `info` / `success` / `warning` / `error` 时为 Alert 模式 |
| className     | String                                     | ''          | 否  | 自定义 class 名称           | 作用于 RadioGroup                                       |
| onChange      | Function                                   | -           | 否  | 值改变时调用                 | 主要与 tsform 配合                                        |
| isChangeWrite | Boolean                                    | true        | 否  | 赋值时是否触发 on-change      | 控制 emit 行为                                           |
| dealDataByUrl | Function                                   | -           | 否  | 接口数据二次处理函数             | 对接口返回数据进行加工                                          |

-------------------------------------------------------------------

## 事件说明
| 事件名          | 说明                        | 参数                    |
| ------------ | ------------------------- | --------------------- |
| change       | 值改变时触发                    | (value, selectedItem) |
| on-change    | 改变时触发（受 isChangeWrite 控制） | (value, selectedItem) |
| update:value | v-model 同步                | value                 |
| change-label | 返回选中文本                    | selectedLabel         |

-----------------------------------------------------------------------------------

## URL 获取数据示例
```vue
<TsFormRadio
  v-model="formData.type"
  url="/api/getTypeList"
  :params="{ category: 1 }"
  rootName="list"
></TsFormRadio>
```
接口返回格式示例：
```json
{
  "Status": "OK",
  "Return": {
    "list": [
      { "text": "A", "value": 1 },
      { "text": "B", "value": 2 }
    ]
  }
}
```
-----------------------------------------------------------------------------------

## Slot 插槽说明
### label
```vue
<TsFormRadio v-model="value" :dataList="radioList">
  <template v-slot:label="{ node, index }">
    <span>{{ index + 1 }} - {{ node.text }}</span>
  </template>
</TsFormRadio>
```
### 自定义校验提示
```vue
<TsFormRadio v-model="value" :dataList="radioList">
  <template v-slot:validMessage>
    <span class="custom-error">自定义错误信息</span>
  </template>
</TsFormRadio>
```

## 入参

```javascript
config:{
  dataList:[],
  radioType:"",
  readonly:true,
  disabled:false,
  rootName:"",
  valueName:"id",
  textName:"name",
  value:"",
  validateList:[],
  url:"/api/rest/matrix/column/data/search/forselect",
  params:{},
  className:"",
  onChange:function(){},
  vertical:false,
  errorMessage:"",
  desc:"",
  dealDataByUrl:function(list){return list},,
  ajaxType:"post",
}
```
dataList 数据格式：
```javascript
[
  {
    text: '显示文本',
    value: '实际值',
    description: '描述信息',
    disabled: false,
    isSelect: false
  }
]
```
| 字段          | 说明               |
| ----------- | ---------------- |
| text        | 显示文本             |
| value       | 实际值              |
| description | 描述信息（显示 Tooltip） |
| disabled    | 是否禁用             |
| isSelect    | 默认选中             |

### 注意事项
- 当 url 存在时，优先使用接口数据
- 接口数据默认最多保留 500 条
- allowToggle 必须手动开启
- 组件销毁时会取消 axios 请求并清理内部 label 同步定时器
- 当快速切换 `url` 或 `params` 时，组件只会应用最后一次请求返回的数据
- `change-label` 会优先根据当前内部值计算，避免外部值尚未同步时短暂返回旧文本


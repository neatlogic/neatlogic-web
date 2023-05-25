### 单选（TsFormRadio）  


#### 模版使用
```javascript
<TsFormRadio v-model="value" v-bind="config"></TsFormRadio>
```

#### 参数、方法说明


>> 参数


参数名|数据类型|默认值|必传|用途|说明
:---:|:---:|:---:|:---:|:---:|:---|
value|String, Number, Boolean|-|是|控件值，可以通过v-model进行双向绑定|-
readonly|Boolean|false|否|是否只读|显示只读文案
disabled|Boolean|false|否|是否不可编辑|灰色背景，带边框样式
vertical|Boolean|false|否|true：竖向布局  false 横向布局
validateList|Array|-|否|-|-
errorMessage|String|-|否|外层控制插件校验提示|-
desc|String|-|否|描述|-
descType|String|-|否|描述显示的类型普通模式和Alert组件模式|值为info、success、warning、error时为Alert模式，如果值为空则为普通模式
dealDataByUrl|Function|-|否|从新处理下拉数据|主要用于通过接口获取的数据如果需要从新处理一层时调用
ajaxType|String|post|否|通过url拿去数据的时调用接口的类型|post get
dataList|Array|-|否|下拉选项数据|在url数据为空时有效 数据格式为：{text:'名称',value:'值',disabled: true} 如果 disabled 为false，可直接不加这个字段
radioType|String|-|否|radio显示样式|button default
url|String|-|否|通过url来一次性获取下拉数据|接口在组件初始化时调用
rootName|String|-|否|通过接口获取数据的路径key值|支持层级嵌套如果 root1.root2
valueName|String|value|否|选中下拉选项中，最终获取值的key|-
textName|String|text|否|选中下拉选项中，显示值的key|-
params|Object|-|否|接口参数|在通过接口获取数据时，把它作为参数带入后台
className|String|-|否|-|-
onChange|Function|-|否|改变值调用的方法|主要与tsform一起使用
descName|String|description|否|每一个选项帮助信息取的key值|使用场景：需要Tooltip 来显示帮助信息
allowToggle|Boolean|false|否|反选

>>  方法(通过@调用方法)
 方法名|用途|说明
:---:|:---:|:---
on-change|数据改变时触发| 入参 value：选中值


>>  插槽(slot)
 名称|slot-scope|用途|说明
:---:|:---:|:---:|:---
validMessage|无|普通的校验和属性errorMessage不能满足需求是，可以使用插槽|-

#### 入参

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
  url:"/api/rest/matrix/column/data/search/forselect/new",
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

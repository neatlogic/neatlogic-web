### 下拉选择（TsFormSelect）  


#### 模版使用
```javascript
 <UserSelect  :value="value" v-bind="config" ></UserSelect>
```

#### 参数、方法说明


>> 参数


参数名|数据类型|默认值|必传|用途|说明
:---:|:---:|:---:|:---:|:---:|:---|
value|Array, String, Object|-|是|控件值，可以通过v-model进行双向绑定|-
width|String, Number|100%|否|-|-
readonly|Boolean|false|否|是否只读|显示只读文案
disabled|Boolean|false|否|是否不可编辑|灰色背景，带边框样式
multiple|Boolean|false|否|是否多选|-
groupList|oolean, Array|['processUserType', 'user', 'team', 'role', 'common']|否|分组条件|processUserType:工单相关, user:用户,team：用户组, role：角色, common：公共数据；主要用在接口里面
validateList|Array|-|否|校验|-
transfer|Boolean|false|否|是否放到body下面|有些场景外层使用了overflow，导致显示不全时使用
defaultDataList|Array, Object|-|否|渲染选中数据的text|有时通过接口渲染选中值比较慢时，可以直接把渲染的数据传递过来[{value :"",text:""}],单选是object，多选是array
excludeList|Boolean, Array|false|否|接口需要过滤掉的数据|主要用在接口里面
includeList|Boolean, Array|false|否|接口需要包含的数据|主要用在接口里面
isIcon|Boolean|true|否|不同类型有选择之后会有图标|如果不需要显示图标，可以设置为false
clearable|Boolean|true|否|是否有清除按钮|-
placeholder|String|'请选择'|否|-|-
readonlyClass|String|text-grey tsform-readonly|否|在只读的情况下面添加class|-
desc|String|-|否否|描述|-
descType|String|-|否|描述显示的类型普通模式和Alert组件模式|值为info、success、warning、error时为Alert模式，如果值为空则为普通模式
onChange|Function|-|否|改变值调用的方法|主要与tsform一起使用
scrollParent|Object, String|-|否|组件外层对应的滚动容器|当控件滚出可视区域时，下拉框而然显示，需要通过监听滚动容器隐
errorMessage|String|-|否|外层控制插件校验提示|-
border|String|-|否|边框样式|border none bottom
total|Number|18|否|搜索时接口一次性放回的数据量|-
sperateText|String|-|否|多选只读分割线|用在readonly的模式下面
rangeList|Boolean, Array|-|否|指派范围|主要用在接口里面
theme|Object|-|否|自定义主题样式





>>  方法(通过@调用方法)


 方法名|用途|说明
:---:|:---:|:---
on-change|数据改变时触发| 入参 1、value：文本框值  2、valueObject：text和label组成数数据  3、selectItem：选中对象组成的数据

***


>>  方法(通过.sync调用方法更新值)


 属性名称|用途|说明
:---:|:---:|:---
selectItemList|获取选中数据的对象列表| -
***

>>  插槽(slot)
 名称|slot-scope|用途|说明
:---:|:---:|:---:|:---
validMessage|无|普通的校验和属性errorMessage不能满足需求是，可以使用插槽|-


#### 入参

```javascript
config:{
  value:[],
  width:"100%",
  readonly:true,
  disabled:false,
  multiple:true,
  groupList:['user','team'],
  validateList:[],
  transfer:true,
  defaultDataList:[{text:"tewat",value:"asdf"}],
  excludeList:["role#41b7a85b5500479998795ed431f64014"],
  includeList:["common#all"],
  isIcon:true,
  clearable:true,
  placeholder:"",
  readonlyClass:"",
  desc:"",
  onChange:function(value){},
  scrollParent:"",
  errorMessage:"",
  border:"border",
  total:20,
}
```

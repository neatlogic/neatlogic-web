### 下拉树（TsFormTree）  


#### 模版使用
```javascript
<TsFormTree v-model="value" v-bind="config" @on-change="changeFn"></TsFormTree>
```
#### 参数、方法说明


>> 参数


参数名|数据类型|默认值|必传|用途|说明
:---:|:---:|:---:|:---:|:---:|:---|
value|String, Array, Number|-|是|控件值，可以通过v-model进行双向绑定|-
transfer|Boolean|false|否|是否放到body下面|有些场景外层使用了overflow，导致显示不全时使用
multiple|Boolean|false|否|是否多选|-
url|String|-|否|通过url来一次性获取下拉数据|接口在组件初始化时调用
params|Object|-|否|接口参数|在通过接口获取数据时，把它作为参数带入后台
search|Boolean|false|否|是否搜索|只能够通过接口进行搜索
rootName|String|-|否|通过接口获取数据的路径key值|支持层级嵌套如果 root1.root2
valueName|String|value|否|选中下拉选项中，最终获取值的key|-
textName|String|text|否|选中下拉选项中，显示值的key|-
keyword|String|keyword|否|通过接口搜索时对应的关键字名称|数据通过url获取时有效
dataList|Array|-|否|下拉选项数据|在url数据为空时有效
readonly|Boolean|false|否|是否只读|显示只读文案
disabled|Boolean|false|否|是否不可编辑|灰色背景，带边框样式
childrenKey|String|children|否|子节点的key值|在获取子节点时需要自定key
className|String|-|否|最外层添加class|-
readonlyClass|String|text-grey tsform-readonly|否|在只读的情况下面添加class|-
validateList|Array|-|否|校验|-
width|String, Number|100%|否|控件的宽度|-
desc|String|-|否|描述|-
descType|String|-|否|描述显示的类型普通模式和Alert组件模式|值为info、success、warning、error时为Alert模式，如果值为空则为普通模式
placeholder|String|'请选择'|否|-|-
clearable|Boolean|true|否|是否有清除按钮|在必填的情况下面，按钮是不存在的
selectLastLevel|Boolean|false|否|是否只有最后一层可以选择|-
showPath|Boolean|false|否|是否展示路径|在单选时才生效
sperateText|String|/|否|路径的分割符|-
forbidContent|String,Array||否|禁止输入的字符串，主要是为了防止xss攻击 一般情况下面值为 ['<', '>', '"', "'", '&']|在search时生效
onChange|Function|-|否|改变值调用的方法|主要与tsform一起使用





>>  方法(通过@调用方法)


 方法名|用途|说明
:---:|:---:|:---
on-change|数据改变时触发| 入参 1、value：文本框值  

#### 入参

```javascript
config:{
  value:"",
  transfer:false,
  multiple:false,
  url:"/api/rest/matrix/column/data/search/forselect/new",
  params:{},
  search:false,
  rootName:"children",
  valueName:"value",
  textName:"name",
  keyword:"keyword",
  dataList:[],
  readonly:false,
  disabled:false,
  childrenKey:"chidldren",
  className:"",
  readonlyClass:"",
  validateList:['requried'],
  width:"100%",
  placeholder:"",
  clearable:true,
  selectLastLevel:true,
  showPath:true,
  sperateText:">",
  onChange:function(val){},
}
```

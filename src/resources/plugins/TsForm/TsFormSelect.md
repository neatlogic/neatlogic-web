### 下拉选择（TsFormSelect）  


#### 模版使用
```javascript
<TsFormSelect v-model="value" v-bind="config" @on-change="changeFn" :selectItemList.sync="selectItemList" :needCallback.sync="needCallback" @searchCallback="refreshSuccess()">
  //下拉列表在顶部添加额外一行
  <template v-slot:first-ul>
        <li class="tsfont-plus text-href first-slot" @click="addList()">数据源</li>
  </template>
  //重写下拉列表显示
  <template v-slot:option="{item,index}">
        <div>{{item.text}} {{index}}</div>
  </template>
</TsFormSelect>


data(){
  return {
    selectItemList:false
  }
}
methods:{
  refresh(){
    //指定操作需要重新调用接口更新
    this.selectItemList =true;
  },
  refreshSuccess(){
    this.$Message.success('刷新成功');
  }
}
```

#### 参数、方法说明


>> 参数


参数名|数据类型|默认值|必传|用途|说明
:---:|:---:|:---:|:---:|:---:|:---|
value|String, Number, Array, Boolean|-|是|控件值，可以通过v-model进行双向绑定|如果值是number类型，但是下拉选项对应的值是字符串会匹配不上
size|String|default|否|控件大小|large  small  default
width|String, Number|100%|否|控件的宽度|-
placeholder|String|请选择|否|-|-
search|Boolean|false|否|是否搜索|下拉数据个数大于20是搜索，数据通过dynamicUrl获取时进行搜索
readonly|Boolean|false|否|是否只读|显示只读文案
disabled|Boolean|false|否|是否不可编辑|灰色背景，带边框样式
multiple|Boolean|false|否|是否多选|-
validateList|Array|-|否|校验|- 
transfer|Boolean|false|否|是否放到body下面|有些场景外层使用了overflow，导致显示不全时使用
dataList|Array|-|否|下拉选项数据|在url和dynamicUrl数据为空时有效 数据为：{text:'名称',value:'值',_disabled: true} 如果 _disabled 为false，可直接不加这个字段
dynamicUrl|String|-|否|实时搜索下拉数据|每次下拉选项打开时都会调用接口，而且接口这个接口必须得有精确匹配参数，方便回显值
url|String|-|否|通过url来一次性获取下拉数据|接口在组件初始化时调用
rootName|String|-|否|通过接口获取数据的路径key值|支持层级嵌套如果 root1.root2
valueName|String|value|否|选中下拉选项中，最终获取值的key|-
textName|String|text|否|选中下拉选项中，显示值的key|-
showName|String|-|否|下拉显示的key|如果没有默认与textName相同
mode|String|normal|否|控制下拉是正常模式还是分组模式|只有normal和group两种选项
parentValueName|String|value|否|分组模式中，父节点的值key值（不能选中）|-
parentTextName|String|text|否|分组模式中，父节点的显示key值（不能选中）|-
params|Object|-|否|接口参数|在通过接口获取数据时，把它作为参数带入后台
filterName|String, Array|-|否|前端搜索属性列表|如果值为空默认为[textName,valueName],如果值不为空则以filterName为准,keyword query匹配到item[filterName]时，该选项会在搜索时显示
allowCreate|Boolean|false|否|是否允许通过enter键创建新的选项|在search为true的条件下生效
idListName|String|defaultValue|否|通过接口回显显示数据key值|精确比配，数据通过dynamicUrl获取时有效
keyword|String|keyword|否|通过接口搜索时对应的关键字名称|数据通过dynamicUrl获取时有效
defaultValueIsFirst|Boolean|false|否|是否默认选中第一个|在通过url获取数据时，需要选中第一个数据，同时出发change事件
className|String|-|否|最外层添加class|-
readonlyClass|String|text-grey tsform-readonly|否|在只读的情况下面添加class|-
clearable|Boolean|true|否|是否有清除按钮|在必填的情况下面，按钮是不存在的
border|String|-|否|边框样式|border none bottom
onBlur|Function|-|否|失去焦点调用的方法|主要与tsform一起使用
onFocus|Function|-|否|获取焦点调用的方法|主要与tsform一起使用
onChange|Function|-|否|改变值调用的方法|主要与tsform一起使用
desc|String|-|否|描述|-
descType|String|-|否|描述显示的类型普通模式和Alert组件模式|值为info、success、warning、error时为Alert模式，如果值为空则为普通模式
errorMessage|String|-|否|外层控制插件校验提示|-
onChangelabel|Function|-|否|当值改变时调用的方法|主要会把值对应的显示文案传过去(不建议使用)
scrollParent|Object, String|-|否|组件外层对应的滚动容器|当控件滚出可视区域时，下拉框而然显示，需要通过监听滚动容器隐藏下拉框，在transfer为true时使用，如果组件比较多时可以直接指令v-scrollHidden 
sperateText|String|-|否|多选只读分割线|-
dealDataByUrl|Function|-|否|从新处理下拉数据|主要用于通过接口获取的数据时，如果接口返回的数据不能直接使用需要转换一次时，可以用这个方法
preIcon|String|-|否|-|-
ajaxType|String|post|否|通过url拿去数据的时调用接口的类型|post get
urlConfig|Object,Boolean|false|否|通过url拿去数据的时需要额外的参数，例如{headers: {'X-Requested-With': 'XMLHttpRequest'}}
placement|String|bottom-start|否|可选值top top-start top-end bottom bottom-start bottom-end left left-start left-end right right-start right-end | 默认情况下面不需要修改此项，但是在有些极限情况下面导致最外层出现滚动条，需要根据具体情况调整这个参数
needCallback|Boolean|false|否|是否搜索需要回调，主要用于实时搜索时对外提供搜索完成的时间，需配合searchCallback和:needCallback.sync使用|一般用于实时搜索外部刷新时需要一个成功提示的回调，见上示例
forbidContent|String,Array||否|禁止输入的字符串，主要用于通过allowCreate来创建选项时，主要是为了防止xss攻击 一般情况下面值为 ['<', '>', '"', "'", '&'] 或者 '<>&'|生效条件 search 时
firstSelect|Boolean|true|否|必填且下拉列表只有一个时，是否选中下拉列表的唯一项|-
nowrapHead|Boolean|false|否|当出现多选的时候，不换行显示，如果数据过多时则显示不全,通过滚动条来查看数据|-
dropdownMenuMaxWidth|String,Boolean|false|下拉列表最大宽度


2021-11-09 新加方法
参数名|数据类型|默认值|必传|用途|说明
firstText|Boolean|false|否|第一个li是显示文字|-
firstLi|Boolean|true|否|第一个li是否显示|-
firstIcon|String|默认不传，主要是图标，如果换成其它图标就传字符串
theme|Object|-|否|自定义主题样式

>>  方法(通过@调用方法)


 方法名|用途|说明
:---:|:---:|:---
on-change|数据改变时触发| 入参 1、value：文本框值  2、valueObject：text和label组成数数据  3、selectItem：选中对象组成的数据。2021-11-09 新加方法 如果val 返回的是 addLi 那就是点击第一个li的方法
on-blur|失去焦点时触发|-
on-focus|获取焦点时触发|-
change-label|改变数据时触发|入参 值对应的text值
enter-search|enter键之后触发事件|在单选，allowCreate为false 时触发，主要用于利用输入的值，在外面做操作 入参 value
on-create|创建下拉选项时触发|入参 value 创建的值
on-open-change|下拉框隐藏或者出现时触发|- 入参 isVisible 是否显示

2021-11-09  更新
 方法名|用途|说明
:---:|:---:|:---
first|获取第一个li的方法|-


>>  方法(通过.sync调用方法更新值)


 属性名称|用途|说明
:---:|:---:|:---
selectItemList|获取选中数据的对象列表| -


>>  插槽(slot)


 名称|slot-scope|用途|说明
:---:|:---:|:---:|:---
first-ul|无|在下拉组件中添加额外的交互内容,一般用在下拉中出现添加数据按钮|卡槽内容会一直显示在下拉列表中
option|{node,index}|一般下拉列表显示的textName对应的值，卡槽的作用主要用在比较复杂的场景|-
validMessage|无|普通的校验和属性errorMessage不能满足需求是，可以使用插槽|-




#### 入参

```javascript
config:{
  value:"",
  disabled:false,
  size:"default",
  width:"100%",
  search:false,
  preIcon:"tsfont-edit",
  keyword:"keyword",
  idListName:"valueList",
  placeholder:"请输入",
  multiple:true,
  allowCreate:false,
  readonly:false,
  url:"/api/rest/matrix/column/data/search/forselect",
  params:{test:"test"},
  defaultValueIsFirst:false,
  dynamicUrl:"/api/rest/matrix/column/data/search/forselect",
  rootName:"tbodyList",
  dataList:[{text:"text",value:"value"}],
  valueName:"id",
  textName:"name",
  showName:"html",
  validateList:[],
  transfer:true,
  className:"",
  clearable:false,
  border:"border",
  onBlur:function(){},
  onFocus:function(){},
  onChange:function(value,objectValue,selectList){},
  desc:"adfa",
  errorMessage:"",
  onChangelabel:function(labelobject){},
  scrollParent:this.$el,
  sperateText:"|",
  dealDataByUrl:function(list){return list},,
  readonlyClass:"",
  ajaxType:"post",
}
```

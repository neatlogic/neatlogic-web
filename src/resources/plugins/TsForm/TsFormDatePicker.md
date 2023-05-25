### 输入框（TsFormDatePicker）  


#### 模版使用
```javascript
<TsFormDatePicker v-model="value" v-bind="config"></TsFormDatePicker>
```

#### 参数、方法说明


>> 参数


参数名|数据类型|默认值|必传|用途|说明
:---:|:---:|:---:|:---:|:---:|:---|
value|String,Number|-|是|-
type|String|-|否|日期类型|date  datetime  daterange   datetimerange  year   month  time  timerange 
width|String, Number|100%|否|控件的宽度|-
format|String|-|否|日期显示格式|yyyy-MM-dd HH:mm:ss
multiple|Boolean|-|否|多选|-
disabled|Boolean|false|否|是否可以使用|-
readonly|Boolean|false|否|是否只读|-
placeholder|String|-|否|-|-
validateList|Array|-|否|校验|-
valueType|String|normal或format|否|最终获取的值的类型|normal timestamp  format
splitPanels|Boolean|false|否|左右两边是否联动|单类型为range时使用
transfer|Boolean|false|否|是否放到body下面|有些场景外层使用了overflow，导致显示不全时使用
border|String|-|否|边框样式|border none bottom
size|String|default|否|控件大小|large  small  default
desc|String|-|否|描述|-
descType|String|-|否|描述显示的类型普通模式和Alert组件模式|值为info、success、warning、error时为Alert模式，如果值为空则为普通模式
className|String|-|否|最外层添加class|-
readonlyClass|String|text-grey tsform-readonly|否|在只读的情况下面添加class|-
scrollParent|Object, String|-|否|-|-
options|Object|-|否|选择器额外配置|比如不可选日期与快捷选
errorMessage|String|-|否|外层控制插件校验提示|-
confirm|Boolean|false|否|选择日期后，选择器不会主动关闭，需用户确认后才可关闭|-
open|Boolean|-|否|手动控制日期选择器的显示状态，true 为显示，false 为收起|使用该属性后，选择器不会主动关闭。建议配合 slot 及 confirm 和相关事件一起使用
placement|String|bottom-start|否|可选值top top-start top-end bottom bottom-start bottom-end left left-start left-end right right-start right-end | 默认情况下面不需要修改此项，但是在有些极限情况下面导致最外层出现滚动条，需要根据具体情况调整这个参数
onBlur|Function|-|否|失去焦点调用的方法|主要与tsform一起使用
onFocus|Function|-|否|获取焦点调用的方法|主要与tsform一起使用
onChange|Function|-|否|改变值调用的方法|主要与tsform一起使用

>>  方法(通过@调用方法)
 方法名|用途|说明
:---:|:---:|:---
on-change|数据改变时触发| 入参 value：文本框值
on-ok|在 confirm 模式下有效，点击确定按钮时触发|-
on-clear|在 confirm 模式或 clearable = true 时有效，在清空日期时触发|-
on-clickoutside|点击外部关闭下拉菜单时触发|-



>> 特殊参数说明 option

```javascript
  options: {
    disabledDate (date) {
         return date && date.valueOf() < Date.now() - 86400000;
    },
    shortcuts :[
      {
        text:string, //label文案
        value:function(){return value}，// 返回对应的value值
        onClick :function(){}//点击回调函数
      }
    ]   

  }
```


>>  插槽(slot)
 名称|slot-scope|用途|说明
:---:|:---:|:---:|:---
validMessage|无|普通的校验和属性errorMessage不能满足需求是，可以使用插槽|-

#### 入参

```javascript
config:{
type:"datetime",
width:"100%",
format:"yyyy-MM-dd HH:mm:ss",
multiple:false,
disabled:false,
readonly:false,
placeholder:"",
validateList:[],
valueType:"format",
splitPanels:false,
transfer:false,
border:"border",
size:"default",
onBlur:function(){},
onFocus:function(){},
onChange:function(){},
desc:"",
className:"",
readonlyClass:"",
scrollParent:"",
options:{},
errorMessage:"",
confirm:"",
open|:"",
}
```

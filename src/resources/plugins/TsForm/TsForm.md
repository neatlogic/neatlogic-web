### 表格（TsTable）  


#### 模版使用
```javascript
<TsForm :itemList="itemList" width="80%">
  <!-- 标题slot -->
  <template v-slot:name1-label>
    <div>我是标题<span>提示</span></div>
  </template>
  <!-- 控件slot -->
  <template v-slot:name2>
    <TsFormSelect v-model="itemList.name2.value" v-bind="itemList.name2" :selectItemList.sync="dataSourceJson" @on-change="changeFn()">
      <template v-slot:first-ul>
        <li class="ts-plus text-href first-slot" @click="addList()">数据源</li>
      </template>
    </TsFormSelect>
  </template>
</TsForm>
```

#### 参数、方法说明


>> 参数


参数名|数据类型|默认值|必传|用途|说明
:---:|:---:|:---:|:---:|:---:|:---|
labelPosition|String|right|否|控制label相对于控件显示的位置| right、left、top
itemList|Array Object|无|否|每项控件配置|如果类型为Array则每一项中的属性 type（必须存在）  name（必须存在、不能重复）；如果是object类型属性type（必须存在）
dataConfig|Object|无|是|控制表单控控件所有value值的集合，方便获取值,可以通过v-model进行绑定|如：{name1:value1,name2:value2} 
border|String|border|否|表单里面的控件边框对应的样式| border bottom none
labelWidth|Number|120|否|label显示的宽度|当labelPosition值为right 和 left 有效
itemWidth|Number, String|100%|否|每一个每项控件整体占用的宽度，实现栅格布局| 包含label  
width|String, Number|75%|否|控件显示的宽度 |不包含label
labelAlign|String|top|否|label和控件左右布局时，当控件的高度大于32时，label上下的对齐的方位 | top, center
tooltip|String|-|否|label右侧的tooltip提示文本|
tipPlacement|String|top-start|否|label右侧的tooltip提示文本方向|-
filterEmpty|Boolean|false|否|当属性对应的值胃口时是否需要把属性从dataConfig中移除|主要用在CombineSearch组件中
readonly|Boolean|false|否|默认设置表单里面所有的组件的readonly|如果控件自己设置readonly值，则会被覆盖
disabled|Boolean|false|否|默认设置表单里面所有的组件的disabled|如果控件自己设置disabled值，则会被覆盖
theme|Object|-|否|自定义主题样式

>>  方法(通过ref调用方法)


 方法名|返回数据|用途|说明
:---:|:---:|:---:|:---
valid|Boolean|校验表单是否通过|-
clearForm|-|清空表单值|-
resetForm|-|重置表单值|控件会保留表单初始化值，然后中间用户通过浏览器修改了值，重置会把值设置为初始化的值，建议不使用
getFormValue|Object|获取表单值|-

***

>>>特殊数据说明

1. itemList,与tbody的数据对应键名保持一致，title为显示文案），例子：

```javascript
itemList:{
  name1:{
    type:"text",//控件类型 text | textarea | number | url | email | tel | password  | select | radio |checkbox |date  |datetime |datetimerange | year | month | time  | timerange  | tree | quartz | switch  |  textspan | slot| ckeditor|userselect | codemirror
    label:"textlabel",//控件标题
    hideLabel:true,//是否隐藏label让其不占位置
    isHidden:true,//是否隐藏这个配置项对应的控件
    validateList:[//校验
      "required",//通用校验，如果想知道全部校验可以参考 tsValidtor.js文件
      {name:"number",message:"错误提示"},//在现有的基础上面，更改校验提示
      {name: "regex", pattern: "^[a-z]+$", message: "错误提示" }//正则表达式校验
      {name:"custom", message: '错误提示', validator: function(rule, value) { return value?true:false;}},//自定义方法校验
   ],
   onChange:function(val){}//控件对应的值发生改变时，调用的方法
   ...//每个控件自身对应的属性，请参考相对应控件的具体属性
  },
  name2:{
    type:"slot",
    label:"slotlable",
    value:"",
  }
}
```

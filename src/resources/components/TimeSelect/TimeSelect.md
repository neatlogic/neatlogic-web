### TimeSelect  


#### 模版使用
```javascript
<TimeSelect v-model="time" valueType="format" type="datetimerange" format="yyyy-MM-dd HH:mm:ss" :placement="placement" :timerWidth="width" @on-ok="changeTimer"> </TimeSelect>
```

#### 参数、方法说明


>> 参数


参数名|数据类型|默认值|必传|用途|说明
:---:|:---:|:---:|:---:|:---:|:---|
value|Object|无|否|插件的值，可用v-model进行双向绑定数据| 值为当为起始时间时：{ "startTime": 开始时间, "endTime": 结束时间}或者为固定的下拉选项时：{timeRange:对应的value值，timeUnit:对应的单位} 

placeholder|String|'请选择时间段'|否|提示|-
placement|String|‘bottom-start’|否|如果开启了自定义模式时间选择器的位置|`[toptop-start,top-end,bottom,bottom-start,bottom-end,left,left-start,left-end,right,right-start,right-end]`
labelWidth|Number|120|否|label显示的宽度|当labelPosition值为right 和 left 有效
itemWidth|Number, String|100%|否|每一个每项控件整体占用的宽度，实现栅格布局| 包含label  
width|String, Number|75%|否|控件显示的宽度 |不包含label
border|String|无|否|控件边框|border bottom none
transfer|Boolean|false|否|是否开启transfer|-
clearable|Boolean|true|否|是否可以清空|-
isMore|Boolean|true|否|是否支持自定义时间|  
validateList|Array|无|否|校验规则，同表单|
disabled|Boolean|false|否|是否不可以操作|
readonly|Boolean|false|否|是否只读|
dataList|Array|有|是|固定的下拉选项的下拉枚举
format|String|'yyyy-MM-dd'|否|自定义显示的日期的格式|-
valueType|String|'timestamp'|否|自定义获取的日期的格式|timestamp  format
separator|String|'-'|否|连接2个日期的连接符号|


>>  方法(通过ref调用方法)


 方法名|返回数据|用途|说明
:---:|:---:|:---:|:---
valid|Boolean|校验表单是否通过|-
clearForm|-|清空表单值|-
resetForm|-|重置表单值|-
getFormValue|Object|获取表单值|-

***

>>>特殊数据说明


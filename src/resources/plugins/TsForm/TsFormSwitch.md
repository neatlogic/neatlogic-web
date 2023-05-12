### 单选（TsFormRadio）  


#### 模版使用
```javascript
<TsFormSwitch v-model="value" v-bind="config"></TsFormSwitch>
```

#### 参数、方法说明


>> 参数


参数名|数据类型|默认值|必传|用途|说明
:---:|:---:|:---:|:---:|:---:|:---|
value|String, Number, Boolean|-|是|-|-
falseValue|String, Number, Boolean|0|否|关闭时value的值|关闭
trueValue|String, Number, Boolean|1|否|打开时value的值|打开
disabled|Boolean|false|否|是否不可编辑|禁用开关
showStatus|Boolean|false|否|是否在切换开关右侧显示开关状态的文本|默认是打开时显示“已激活”，关闭时显示“已禁用”
trueText|String|已激活|否|开启的文案提示|-
falseText|String|已禁用|否|关闭的文案提示|-
desc|String|-|否|描述|-
descType|String|-|否|描述显示的类型普通模式和Alert组件模式|值为info、success、warning、error时为Alert模式，如果值为空则为普通模式
onChange|Function|-|否|值改变时触发|传人参数 value 当前的value值
beforeChange|Function|-|否|改变前触发，主要用来阻止状态的改变|return 如果返回true则切换，返回false则不切换


>>  方法(通过@调用方法)
 方法名|用途|说明
:---:|:---:|:---
on-change|数据改变时触发| 入参 value：选中值


#### 入参

```javascript
config:{
  value:0,
  falseValue:0,
  trueValue:1,
  disabled:false,
  showStatus:false,
  trueText:"已激活",
  falseText:"已禁用",
  desc:"",
  descType:[],
  onChange:()=>{ },
  beforeChange:()=>{ },
}
```

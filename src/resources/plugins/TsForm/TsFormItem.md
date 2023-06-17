### 表单控件布局（TsFormItem）  


#### 模版使用
```javascript
<TsFormItem label="config" :isRequired="true">
  <TsFormInput v-model="item.value" v-bind="config" @on-change="changeFn"></TsFormInput>
</TsFormItem>
```

#### 参数、方法说明


>> 参数


参数名|数据类型|默认值|必传|用途|说明
:---:|:---:|:---:|:---:|:---:|:---|
label|String|-|否|标题名称|表单控件对应的标题
tooltip|String|-|否|标题说明|标题说明
labelWidth|String,Number|120|否|标题的宽度|-
labelPosition|String|right|否|标题显示地方| right  left   top
labelStrong|Boolean|false|否|标题是否加粗| 
contentAlign|String|left|否|内容水平对齐| left  center  right
required|Boolean|false|否|是否必填|主要用于样式显示 *
itemWidth|String,Number|100%|否|布局控件暂用的宽度|-
theme|Object|-|否|自定义主题样式
#### 入参

```javascript
config:{
  label:"labelname",
  labelWidth:100,
  labelPosition:"right",
  required:true,
  itemWidth:"100%",
}
```

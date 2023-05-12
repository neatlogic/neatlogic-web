##### 参数说明

title: 'others',   
label: '主题色',
param: '--primary-color',
type: 'common',
input: 'color',
example: "switch"
inputConfig: {
  value: '#1670F0'
},


##### 方法

名称|用途|说明|其他
:---:|:---:|:---:|:---|
title|大标题名称
label|标题名称
param|唯一值，不可重复
type|common或其它组件名称|为 common 则为通用组件，param里面的属性会作为全局变量存到浏览器里面
input|控件类型，color，colorList,input等，inputConfig 里面的就作为传参的值写到组件里面 |-|
example|示例类型
inputConfig|里面主要放组件的属性，如，type: input ,inputConfig: { type: 'number', lenght:30 } 等等
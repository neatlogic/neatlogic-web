### 输入搜索组件 

#### 模版使用
```js
<InputSearcher v-model="formInputSetting.value"></InputSearcher>

data() {
    return {
      formInputSetting:{
        placeholder: '名称',
        value: ''
      }
    }
}
methods: {
  onChange(){
    // 回车搜索/点击搜索图标搜索/点击删除清空搜索
  }
}
```

#### 参数、方法说明

>> 参数

参数名|数据类型|默认值|必传|用途|说明
:---:|:---:|:---:|:---:|:---:|:---|
value|String/Number|无|是|搜索的组合结果 |一般用v-model进行双向绑定 
placeholder|String|'请输入关键字'|否|如果有关键字搜索，输入框提示文案 |
border|String|'border'|否|搜索框的边框 |默认时有边框


>>  方法说明

方法|用途|说明
:---:|:---:|:---
change|回车搜索/点击搜索图标搜索/点击删除清空搜索 都是使用该方法 | 

### 组合列表（GroupList） 
 
 <font size=1.5>组件主要是用于，当数组的数据过多时，需要显示前几个，然后出现... 查看更多的场景</font>


#### 模版使用
```javascript
  <GroupList :dataList="row.tagList" type="tag"></GroupList>

  import GroupList from '@/resources/components/GroupList/GroupList.vue';
```

#### 参数、方法说明


> 参数


参数名|数据类型|默认值|必传|用途|说明
:---:|:---:|:---:|:---:|:---:|:---|
dataList|Array||否|数组列表| 
showNum|Number|3|否|显示个数，当大于这个值之后会出现... 点击显示更多|
type|String|usercard|否|数据显示的方式；usercard，tag，slot|1、usercard:UserCard 组件   2、tag：标签  3、slot: 卡槽（自定义显示数据）
textName|String||否|类型为tag时，显示的属性名| 如果为空这直接显示数据 
hideAvatar|Boolean|false|否|是否隐藏头像


### 表格（TsTable）  


#### 模版使用
```javascript
<TsTable v-model="selectedList" v-bind="tableData" @changeCurrent="changeCurrent" @changePageSize="changePageSize" @getSelected="getSelected">
  <template slot="action" slot-scope="{ row }">
    <div class="tstable-action">
      <ul class="tstable-action-ul">
        <li class="tsfont-list" @click="viewIssue(row.uuid)">详情</li>
      </ul>
    </div>
  </template>
</TsTable>
```


#### 参数说明


>> 参数(即tableData的数据结构)


参数名|数据类型|默认值|必传|用途|说明
:---:|:---:|:---:|:---:|:---:|:---|
rowNum|Number|无|是|总条数|-
currentPage|Number|无|是|当前第几页|-
pageSize|Number|无|是|当前第几页|-
pageSizeOpts|Array|[10, 20, 30, 40]|否|分页器的数组|-
theadList|Array|无|是|表头列表|见特殊数据说明
tbodyList|Array|无|是|表格正文数据|见特殊数据说明 
columnList|Array|无|否|纵列表头数据|- 
value|Array|无|否|当有选中功能时获取选中哪些数据|可以用v-model进行双向绑定，需配合keyName使用，返回选中的行的某一个key的值集合（不然会返回索引值） 主要传下标[1,2,3]
keyName|String|id|否|行数据的唯一标志位键名|如果需要勾选\拖拽的为必传 
classKey|String|无|否|每一行额外加的class后缀|给每个`<tr>`标签设置值为`row[classKey]`的class，其中row为tbodyList数组的元素 
value|Array|无|否|默认选中的list|只有每一行选中的标志位的数据集合（可以用v-model） 
noDataText|String|'暂无数据'|否|自定义无数据的文案|- 
showTotal|Boolean|true|否|是否显示总条数|不管是否展示，接口必须返回（使用场景：部分接口返回总条数有误差但是分页数量没问题） 
showSizer|Boolean|true|否|是否显示分页，用来改变page-size|- 
showPager|Boolean|true|否|是否显示分页器，为false则整个分页器都不显示|- 
sortList|Array|false|否|支持排序的表头keylist|默认无，如有需传递一个['a','b'],或者[{a:'ASC'},{b:'DESC'}] 
sortMapping|Object|true|否|排序对应的字段映射|默认down: 'ASC',up: 'DESC',none: '' 
sortOrder|Object、Array|true|否|已有的排序顺序|- 
loading|Boolean|false|否|是否显示加载中|用于外部判断table组件是否显示table数据还是laoding状态
multiple|Boolean|false|否|当需要选中行时是否为多选|-
disabled|Boolean|false|否|是否禁用掉选中功能|-
size|String|normal|否|表格间隙大小|支持 'normal'、'small'
type|Boolean、String|false|否|样式布局|支持 false、'card'(card为202009新增的一行一块显示，中间有空白的布局)
border|Boolean、String|true|否|表格边框|不推荐使用，早期字段。支持 true（最多场景的无外层边框有里层列边框）、false（完全无内外边框）、’all’（内外都有列、行边框）
styleType|String|border|否|table样式类型,支持多个类型空格隔开的字符串|跟type的区别是type针对排版块状还是列表，styleType针对普通的table常用的样式比如线条还是斑马支持多个字符串 border stripe
height|Boolean、String|false|否|是否指定高度|支持 false、指定高度（字符串格式）  (不指定时，外层容器必须有高度)
pageType|String|pagination|否|分页的显示模式|支持'pagination'（页码模式）,'carousel'（上下翻页类似走马灯）
--|--|--|--|--|--
hideAction|Boolean|true|否|是否提供收起操作栏功能|设为true后操作栏最后跟上一个箭头提供操作栏展开收起，鼠标移出当前行还原展开状态
selectedRemain|Boolean|false|否|是否分页保留每一页选中状态|如果为true，需要传keyName回显唯一标志
disabledHover|Boolean|false|否|是否禁用tr移上去背景颜色效果|-
canEdit|Boolean|false|否|是否可编辑表头|包括显示隐藏行、拖拽排序
canDrag|Boolean|false|否|是否可拖拽列排序|-
~~canResize~~|Boolean|false|否|是否可调整行宽|该功能还没开发完成
sortMulti|Boolean|true|否|是否支持表头多个字段排序|-
canExpand|Boolean|false|否|是否有展开行查看更多（tr的下一个tr里显示）的功能|需配合expand的插槽使用，每一条数据通过改变_expand属性显示或者收起更多折叠信息
mode|String|window|否|显示模式|如果是window模式，会使用100vh来计算高度，如果是弹窗中使用，则需要使用dialog模式，则高度变成100%，避免弹窗下有大量留白
fixedHeader|Boolean|true|否|表格头部是否固定，如果不需要固定，则不回计算表格的高度，高度自适应|移上去action还是会显示
isBigDataPage|Boolean|true|否|是否是大数据分页，默认不是
theme|Object|-|否|自定义主题样式

>>>特殊数据说明

1. theadList （每一个th的列必须包含key,与tbody的数据对应键名保持一致，title为显示文案），例子：

```javascript
[ {//这个是第一行选中框
key: "selection",
multiple:true,//这个可以不写通过table的参数控制单选多选
width:20//对应列的宽度，文本字数超出时自动换行
},{//这个是是否有收起展开更多的folder
key: "expand",
},{//其他普通tr，title为显示文案
title: "标题5",
key: "title5",
},{//这个是最后一行操作栏,一般需要根据实际写操作按钮
key:"action"
}]
``` 

2. tbodyList（每一列的键名与theadList对应，只有对应上表头的数据才会显示，对应提供键名插槽自定义td内容），例子：

```javascript
[{//每一行数据，如果theadList设置了selection和action，数据里不需要传这两列
'key1': '12344',
'key2': '标题2',
'isDisabled': true,//如果有选中框的当行不可选，设为true
'isSelected': true//如果有选中框的当行选中，设为true
}]
``` 
>>> 如果设置了某一行数据默认选中isSelected，最后的tbodyList里有_selected字段标志该条数据是否最后被选中，即数据会变成
```javascript
[{//每一行数据，如果theadList设置了selection和action，数据里不需要传这两列
'key1': '12344',
'key2': '标题2',
'isDisabled': true,//如果有选中框的当行不可选，设为true
'isSelected': true,//如果有选中框的当行选中，设为true
'_selected':true
}]
```
#### 方法说明（方法前面加@）
新加方法，兼容以前的方法
theadList: [
  { key: 'name', title: '模块', type: 'linktext', textStyle: ''},
  { key: 'appSystemName', title: '应用'},
  { key: 'isActive', title: '是否激活', type: 'states', stateArr: [{name: '是', value: 1, textStyle: 'text-success'}, {name: '否', value: 2, textStyle: 'text-grey'}]},
  { key: 'action', title: '', type: 'action', operations: 
  [{icon: 'tsfont-trash-s', name: '删除', action: 'del', type: 'text|switch', style: '', key: 'del', value: 'referenceCount', disabled: true|false, readonly:true|false|function,isShow:true|false|function}, 
  {icon: '', name: '复制', type: 'copy', key: 'name', type: 'switch', style: ''}]},
  {key: 'status', title: '状态', headerIcon: 'tsfont-refresh'}
]



传参说明：
 说明|参数|用途
:---:|:---:|:---:
type|不传的话，显示默认值,如果传 maxLength:20 的话,就会显示文字最多的个数,点击显示所有Poptip的方式|-
type|text|默认文字|-
type|linktext|点击事件，方法为operation(view,row)|-
type|TextLinkList|多个点击事件,方法为operation(view,row)|-
type|textList|数组遍历，要加一个valueKey参数，用来判断，数组需要显示的字段|-
type|time|时间|-
type|html|html格式|-
type|company|单位,两个字段连接起来,key + value 展示
type|startEndTime 即开始时间和结束时间，要再多传一个参数 keyend 为结束时间
type|statusList|筛选参数要添加stateArr 数组参数，里面是用来判断状态的数据name，value，textStyle 三个参数， textStyle可不传或为空 |- 
type|action|操作方法|-
type|status 状态 之前的status组件
type|user|为用户组件 UserCard,默认是v-bind 绑定，如果传uuid:'uuid'的话，就会绑定uuid和initType
type|tag|为标签组件 还需要多传一个参数 valueKey ，显示的是哪个字段,如果 valueKey 传空或没有这个字段的时候，就直接显示单数组 
type|usercards 为多用户组件 原用的组件为 GroupList
type|switch 仅开关,不显示文字 , 多传一个单数组 stateArr[1,0] 第一个为开，第二个为关
type|file|附件列表展示


textStyle:样式名称
textValue:点击事件参数

操作方法说明 (type:action,operationArr 参数说明)：
 说明|参数|用途
:---:|:---:|:---:
type|text|显示默认的文字|- readonly：true/false  如果传true的时候，要传一个value值，即对应的字段，是判断条件; 默认是小于等于0不可删除，如果是需要传递大于0不可删除，需要传递参数 isGreaterThanZero: true;禁用之后，鼠标上移的文字需传递：hoverTitle 需要传递一个值，值是字符串，表示上移的时候，提示不可以删除文案信息
type|switch|开关方法|- disabled：true/false（传true的时候，需要传 value值，对应的字段，即判断条件）。key 是 v-model 绑定的字段

action 事件返回的名称
icon 为图标名称
style 样式，可不传
name 显示名称

注意：新加属性，表头加图标方法
```js
// 表头新加属性
theadList: [
  {key: 'status', title: '状态', headerIcon: 'tsfont-refresh'}
]
headerIcon 是图标类名

// 点击图标和文字的方法
<TsTable @headerTitleOperation="headerTitleOperation">
</TsTable>

headerTitleOperation 就是点击表头方法
```


#### 方法说明（方法前面加@）


 方法名|返回数据|用途（触发条件）|说明
:---:|:---:|:---:|:---
changeCurrent|当前第几页|分页改变时|-
changePageSize|每页数据条数|每页数量变化时|-
changeCurrent|当前第几页|分页改变时|-
getSelected|返回2个参数，一个是选中、行的主键集合，一个是选中行的所有数据集合|选中改变时|-
cancelSelected|取消的那一行的数据|取消选中某一行|-
selectedItem|选中的那一行的数据|选中某一行|-
clickTr|选中行的时间|点击某一行执行的事件，返回点击行的所有数据|如果td有自定义点击事件需阻止冒泡
updateSort|当设置了sortList哪些表头字段可以进行升序降序排列后，返回改变顺序时的排序|-
updateRowSort|当设置了canDrag允许改变行的顺序时，返回改变顺序时的event对象|可通过该对象的newIndex和oldIndex判断是哪些顺序发生改变
headerTitleOperation | 点击表头文字 | 表头文字和刷新按钮点击事件


#### slot卡槽说明


 卡槽名|用途|说明
:---:|:---:|:---
****|名称为theadlist里的key|通过slot可以处理每一列的数据展示（比如日期格式化等）
folder|每一行显示更多的内容|可以通过改变改行数据的showFolder属性触发此slot是否显示，demo可以参考/views/pages/cmdb/batch-import/batch-import-audit.vue
noDataTip|空数据提示|可以覆盖原来默认的无数据提示


>>>特殊slot说明
action 为固定的最后一行操作栏，一般页面需要根据具体场景完整写操作栏逻辑



#### 入参说明（数据对接用）
```javascript
{
rowNum:Number, //总条数
currentPage:Number, //当前第几页
pageSize:Number, //当前第几页
theadList:Array //表头列表
tbodyList:Array //表格正文数据
}
```

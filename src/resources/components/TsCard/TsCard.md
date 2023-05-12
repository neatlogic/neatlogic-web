### 卡片插件（TsCard）  


#### 模版使用

```javascript

```

#### 参数、方法说明

1. 可以通过设置rightWidth、leftWidth改变左中右布局默认的左右两侧宽度
2. isSiderHide参数控制侧边栏是否展开（需要siderPosition设置哪边为活动侧边栏默认是左侧）
3. isDrag参数控制侧边栏是否可以通过拖拽改变宽度（需要siderPosition设置哪边为活动侧边栏默认是左侧）

>> 参数


参数名|数据类型|默认值|必传|用途|说明
:---:|:---:|:---:|:---:|:---:|:---|
classname|String|-|否|每一个卡片的外层classname |-|
rowNum|Number|无|是|总条数|-|
currentPage|Number|无|是|当前第几页|-|
pageSize|Number|无|是|当前第几页|-|
cardList|Array|无|是|正文数据|见特殊数据说明|
tbodyList|Array|无|是|正文数据|见特殊数据说明|
nodataText|String|'暂无数据'|否|无数据的提示文案| |
headerPosition|String|无|否|header的插槽的位置，该属性可设置为right\left|该属性设置后会将header的插槽的位置设为绝对定位为方位0（例如设置为right,会是right:0），如需更多其他设置可以用headerStyle|
headerStyle|Object|无|否|header的插槽的自定义样式，为{}对象|尽量少用|
alwaysShowHeader|Boolean|false|否|header的插槽是否总是显示|设置为false后提供移上去才显示header的交互|
sm|Number|12|否|小屏幕（>800px）的栅格布局，每一行二等分|宽度平均分为24等份的占比份数|
md|Number|8|否|中屏幕（>1024px）的栅格布局，每一行三等分|宽度平均分为24等份的占比份数|
lg|Number|8|否|正常屏幕（>1200px）的栅格布局，每一行三等分|宽度平均分为24等份的占比份数|
xl|Number|6|否|大屏幕（>1400px）的栅格布局，每一行四等分|宽度平均分为24等份的占比份数|
xxl|Number|4|否|最大屏幕（>19200px）的栅格布局，每一行六等分|宽度平均分为24等份的占比份数|
span|Number|24|否|通用的的栅格布局，每一行都是100%通栏|宽度平均分为24等份的占比份数|
pageType|String|'icon'|否|卡片的分页类型，icon为默认的圆点的图标类型的分页，number为分页器类型的分页，scroll为下拉加载更多的分页|scroll类型的可以参考通知策略：src/views/pages/framework/notifytactics/tacticsedit/setting/setting-template.vue|
keyName|String|无|否|||
fixBtn|Boolean|false|否|操作按钮|移上去显示操作按钮，固定在底部
boxShadow|Boolean|true|是|卡片阴影|默认有阴影
border|Boolean|false|否|边框|默认无边框
btnList|Array|否|否|底部| [{name: '关联服务', value: 'referenceCount', icon: '', type: 'referenceCount', key: 'referenceCount'},{name: '删除', value: 'del', type: 'del', icon: 'tsfont-trash-o', disable: true, text: '流程被引用不可删除', key: 'referenceCount'}, {name: '多个', value: 'dropdown', icon: '', type: 'dropdown', menuArr: [{name: '复制', value: 'copy', type: 'text'}, {name: '导出', value: 'export', type: 'download'}]}];
btnList|Array|否|否|底部| 用到的页面flow-overview, event-solution-manage , tool-manage ，说明 name，显示名称, value 调用页面判断的字段名称，icon，显示的图标，type 类型， disable 是否可删除，有判断逻辑，type 为 dropdown的时候，是显示下拉菜单 需要多加一个字段，menuArr 传数组
padding | Boolean | true | 否 | 是否需要外边距，6像素



>>>特殊数据说明
1. cardList和tbodyList2个是每个卡片的数据，考虑到兼容table的数据新增的tbodyList，在2个参数都有的情况下会取tbodyList的数据

2. 



>>  slot卡槽说明


 卡槽名|用途|说明
:---:|:---:|:---
top|头部自定布局| 尽量少用，除非头部只有左侧一个文案或者右侧是一堆按钮需要左右浮动的（特别是列表的标准排版为topLeft左侧内容+topRight右侧搜索框）




#### 入参数据参考

```javascript

```

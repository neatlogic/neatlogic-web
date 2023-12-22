### 容器布局插件（TsContain）  


#### 模版使用

```javascript
<TsContain>
       //头部布局，完全自定义，不推荐使用
      <template v-slot:top>
        <span class="tsfont-plus text-action" @click="edit({})">系统公告</span>
      </template>
       //头部左边布局
      <template v-slot:topLeft>
        <span class="tsfont-plus text-action" @click="edit({})">系统公告</span>
      </template>
      //头部中间的布局
       <template v-slot:topCenter>
        <span class="tsfont-plus text-action" @click="edit({})">系统公告</span>
      </template>
       //头部右侧布局，一般为搜索框
      <template v-slot:topRight>
        <Input />
      </template>
      <template v-slot:left>
        左侧sider内容，可能没有
      </template>
      <template v-slot:content>
        content内容
      </template>
      <template v-slot:right>
        右侧sider内容，可能没有
      </template>
<TsContain>
```

#### 参数、方法说明

1. 可以通过设置rightWidth、leftWidth改变左中右布局默认的左右两侧宽度
2. isSiderHide参数控制侧边栏是否展开（需要siderPosition设置哪边为活动侧边栏默认是左侧）
3. isDrag参数控制侧边栏是否可以通过拖拽改变宽度（需要siderPosition设置哪边为活动侧边栏默认是左侧）

>> 参数


参数名|数据类型|默认值|必传|用途|说明
:---:|:---:|:---:|:---:|:---:|:---|
sessionName|String|-|否|唯一标识用来在localStorage里面记录sider是否展开 |如果值存在则会记录页面的sider展开状态，下次同一个sessionName时，通过拿去localStorage里面的数据来改变sider展开状态
isSiderHide|Boolean|false|否|是否隐藏sider内容|外部操控组件的sider是否展开
gutter|Number|16|否|头部栅格布局之间的距离|-
border|String|border|否|头部form表单是边框类型|-
navHeaderBottom|String|none|否|头部布局下面是否有底部边框分割|-
hideHeader|Boolean|false|否|是否需要头部|-
clearStyle|Boolean|false|否|是否需要清除侧边栏的样式（背景色、圆角，不包含右侧固定高度）|-
siderWidth|Number|200|否|sider的宽度|如果可以拖动，则拖动的范围为 siderWidth ~ siderWidth*2
siderPosition|String|left|否|sider在布局的位置,主要是针对可拖动块是的插槽|left  right
isDrag|Boolean|false|否|sider是否可以拖动|拖动产生的宽度会存在localStorage 下次进来时通过存储的值来渲染
rightWidth|Number|200|否|如果是左中右布局的右侧宽度|需配合slot使用；在isDrag为true的前提下,如果siderWidth 和 rightWidth 同时存在，则优先使用siderWidth
mode|String|window|否|显示模式|如果是window模式，会使用100vh来计算高度，如果是弹窗中使用，则需要使用dialog模式，则高度变成100%，避免弹窗下有大量留白
>>  slot卡槽说明


 卡槽名|用途|说明
:---:|:---:|:---
top|头部自定布局| 尽量少用，除非头部只有左侧一个文案或者右侧是一堆按钮需要左右浮动的（特别是列表的标准排版为topLeft左侧内容+topRight右侧搜索框）
topLeft|头部固定格式，左侧布局内容| -
topCenter|头部固定模式，中间布局内容| 尽量少用
topRight|头部固定模式，右侧布局内容| 主要是用来统一右侧搜索的宽度
content|下部正文内容| -
sider|左边侧边栏|;
right|右边侧边栏| - 



#### 入参数据参考

```javascript
config:{
    sessionName: 'notice-manage', //localStorage 记录siderHide转态，下次进来时使用存储的转态来判断是否展开sider
    isSiderHide: false, //是否隐藏sider内容
    gutter: 16, //栅格之间的距离
    border: 'border', //左右布局之间是否有边框分割
    hideHeader: false, //是否隐藏头部
    siderWidth: 200, //slider的宽度
    siderPosition: 'left' , // left, right
    isDrag: false, //slider是否可以拖动
    rightWidth:280,//左边侧边栏宽度
}
```

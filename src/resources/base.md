# 全局基础样式、方法
## 全局通用样式  

>>> 页面栅格布局说明:(sm:800px,md:1024px,lg:1280px,xl:1400px,xxl:1920px)
#### 通用类样式class

class名|用途|说明
:---:|:---:|:---|
h1|特大标题(登录页系统)|字号28行高36|
h2|弹窗对话框标题文字|字号18行高26|
h3|大屏展示统计图标题、大标题|字号16行高24|
h4|一二级菜单|字号14行高22|
fz10|提示类文字|字号10（待调整）|
fz16 | 无 | 字号16
fz18 | 无 | 字号18
fz20 | 无 | 字号20
text|正文、基本字号|字号13行高21|
tips|表格头部、错误提示|字号12行高20|

#### 通用类颜色样式class

class名|用途|说明
:---:|:---:|:---|
text-title|标题字体|颜色为标题色，比正文字体颜色深|
text-action|可操作类文字|默认正文颜色，移上去变可点击的蓝色+pointer|
text-href |跳转类文字|字体颜色可点击颜色+移上去pointer|
text-white|白色文字|不会随主题色发生改变的白色，目前是#fff|
text-op|相反色|适用于需要根据主题色改变的反色|
text-disabled|不可操作文字|移上去鼠标显示不可操作+0.6透明度|
text-info|info颜色字体|-|
text-primary|主题色字体|-|
text-success|绿色成功色字体|-|
text-danger|红色告警色字体|-|
text-warning|橙色告警色字体|-|
border-error|红色边框|-|
border-primary|主题色边框|-|
text-tip|提示类文字，颜色浅色|跟着主题走|
text-grey|提示类文字|此class尽量少用，早期class，用text-tip|
text-tip-active|提示类文字，颜色浅色，移上去后显示主题色移上去交互，提供提示类问题可激活样式|跟着主题走|
require-label|必填的文字（会在左边带一个*必填的提示），后期调整ui把提示的红色字体去掉|跟着主题走|
bg-grey|背景色灰色|-|
bg-tip-grey|提示灰色背景（弱化）|-|
bg-hover-grey|移上去背景色为灰色|-|
bg-op|背景色与字体颜色相反（浅色主题为白色，深色主题为墨蓝色）|-|
bg-block|主体区域的块状元素的背景色（目前是浅灰色）|-|
bg-info|蓝色背景|-|
bg-info-grey|浅蓝色背景|用于蓝色背景（弱化）|
bg-success|绿色背景|-|
bg-success-grey|浅绿色背景|用于绿色背景（弱化）|
bg-warning|橙色色背景|-|
bg-warning-grey|浅橙色背景|用于橙色背景（弱化）|
bg-error|红色背景|-|
bg-error-grey|浅红色背景|用于红色背景（弱化）|
bg-code|代码片段的背景色|-|
bg-selected|选中的带浅色主题色背景色的样式|适用于部分场景选中只需要背景色|
item-selected|选中的主题色字体颜色带浅色背景色的样式|适用于部分场景选中需要背景色+字体颜色|
bg-modal|模态窗背景色|非白的，浅浅灰|
bg-footer-btn|卡片式的底部操作栏背景色|前期为白色后期调整为浅灰色|
lh-2|行高2倍字号|用于有时候需要文字行高比一般的高一些（比如空数据提示等）|
input-border |输入框需要带边框|不推荐使用（早期风格为整体底框时专门处理需要四边框的输入框用）

#### 场景类样式class

##### 页面排版涉及到圆角弧度,边框，阴影

class名|用途|说明
:---:|:---:|:---|
radius-lg|圆角10px,用于大块的元素|
radius-md|圆角8px,一般用于table，卡片等等|
radius-sm|圆角6px,一般用于条状元素，比如操作栏、输入框等等|
radius-mi|圆角4px,一般用于按钮|
block-border|块状元素边框|-|
shadow|块状元素阴影|-|


##### 超过内容区域显示处理

class名|用途|说明
:---:|:---:|:---|
overflow|超过宽度显示省略号|-|
line-2|超过2行显示省略号|以2倍行高为标准|
line-3|超过3行显示省略号|以3倍行高为标准|
block-add|添加按钮块状样式|需要独占一行的|
tsscroll-container|如果溢出则出现滚动条|该样式处理了滚动条样式|

##### 对齐方式

class名|用途|说明
:---:|:---:|:---|
clearfix|清除子级浮动造成的样式问题|-|
float-left|元素左浮动|父级元素需加上清除浮动的样式，比如加上clearfix的classname|
float-right|元素右浮动|父级元素需加上清除浮动的样式，比如加上clearfix的classname|
text-center|元素水平方向（横轴）居中对齐|-|
text-left|元素水平方向（横轴）左对齐|-|
text-right|元素水平方向（横轴）右对齐|-|
flex-start|flex布局下水平方向（横轴）元素开始方向对齐|-|
flex-end|flex布局下水平方向（横轴）元素结束方向对齐|-|
flex-center|flex布局下水平方向（横轴）元素中心对齐|-|
flex-between|flex布局下水平方向（横轴）项目位于各行之间留有空白的容器内|-|
flex-around|flex布局下水平方向（横轴）项目位于各行之前、之间、之后都留有空白的容器内|-|
align-start|flex布局下垂直方向（竖轴）顶对齐（开始方向对齐）|-|


##### 间隙

> (margin_外间隙，padding_内间隙，md_medium_普通尺寸（一般间隙12px）)

class名|用途|说明
:---:|:---:|:---|
margin-md|右外间隙普通尺寸|普通间隙12px,不推荐使用|
mr-md|右外间隙普通尺寸|-|
ml-md|左外间隙普通尺寸|-|
mt-md|右外间隙普通尺寸|-|
mb-md|下外间隙普通尺寸|-|
padding-lg|内间隙最大尺寸|最大间隙24px|
padding|内间距尺寸|16px
padding-md|内间隙普通尺寸|12px|
padding-sm|内间隙小尺寸|10px，一般用于文字间隙|
padding-xs|内间隙较小|比如分页的页数之间的间隙|
pr-md|右内间隙普通尺寸|-|
pl-md|左内间隙普通尺寸|-|
pt-md|右内间隙普通尺寸|-|
pb-md|左内间隙普通尺寸|-|
pt-nm|上内间隙16px|
pb-nm|下内间隙16px|
pl-nm|左内间隙16px|
pr-nm|右内间隙16px|
pt-sm|上内间隙10px|
pb-sm|下内间隙10px|
pl-sm|左内间隙10px|
pr-sm|右内间隙10px|
pt-xs|上内间隙6px|
pb-xs|下内间隙6px|
pl-xs|左内间隙6px|
pr-xs|右内间隙6px|

##### 图标文字间隙

class名|用途|说明
:---:|:---:|:---|
icon-right | 字体图标到右侧文案的间隙 | 间隙大小为4像素


##### 操作栏

class名|用途|说明
:---:|:---:|:---|
.action-group>.action-item*n(.disable)|操作分类组，常用于各种多个操作并列|禁用时action-item添加disable类名|

##### 动画

>调用：直接动画里加上动画名字，其他参数按照实际（比如：animation: water-wave linear infinite;）

动画名|用途|说明
:---:|:---:|:---|
fade|渐明减暗效果|透明度从0.6到1的轮播，一般css这么写:animation: fade linear infinite;|
rocking|晃铃效果|一般css这么写:animation: rocking 2s;|
water-wave|水波纹效果|一般css这么写:animation: fade linear infinite;|
rubberBand|animatecss的rubberBand弹橡皮筋动画|一般css这么写:animation: rubberBand 1s;|

##### 兼容老的样式的表单布局

class名|用途|说明
:---:|:---:|:---|
.form-block>(.block-left+.block-right)|左侧label（宽度120px）右侧表单或者文字的布局|不推荐使用|

## 全局方法  


#### 全局变量
名称|用途|说明|其他
:---:|:---:|:---:|:---|
TENANT|获取当前租户|通过当前浏览器的TENANT变量可以获取|-|
HOME|获取当前访问地址的前缀|目前是‘/租户’，主要用于写地址跳转时拼接路径前缀|-|
BASEURLPREFIX|获取默认接口前缀|目前是‘/租户’，api调用路径只需要从租户后的路径开始|例如：调用‘/租户/api/rest/auth/module/get’时，api入口的路径为：‘/api/rest/auth/module/get’|
BASELANGUAGES|获取当前页面的语言|目前支持中英文，zh/en|
MODULEID|获取当前模块的id|需要跟rest/auth/module/get的接口返回的对应当前模块的数据的group的值对应上|模块的英文键名|
MENUTYPE|获取当前的菜单的分类类型映射|为{key:分类名字,...}对象数据，需要跟左侧菜单的分类类型对应上，对应体现在路由的meta.type|





#### utils
>>>模版调用方法：
```javascript
this.$utils.***
```

##### 方法

名称|用途|说明|其他
:---:|:---:|:---:|:---|
getCookie|获取cookie为name的值|this.$utils.getCookie(name)|-|
setCookie|设置cookie为name的值为value，期限是time(如果是数字，单位为天；如果是字符串，直接赋值结束时间)|this.$utils.setCookie(name, value, time) |-|
removeCookie|清除cookie为name的值|this.$utils.removeCookie(name) |-|
deepClone|深拷贝，复制数据（不改动原数据）|this.$utils.deepClone(data) |-|
setUuid|生成32位随机uuid|this.$utils.setUuid() |-|
getCurrenttime|根据指定格式格式化当前时间输出格式|this.$utils.getCurrenttime(format)|参数默认格式：年月日 时:分:秒，其他选项：["HH:mm:ss","yyyy-MM-dd","HH:mm")]|
getDateByFormat|通过时间戳获取指定格式的日期|this.$utils.getDateByFormat(value, format, styleType)|format同上，styleType为链接付，默认'-'|
validForm|校验$el的表单控件，如有错误的触发$scroll的滚动到错误位置|this.$utils.validForm($el,$scroll) |可以传dom对象，也可以传选择器字符串|
toggleClass|修改classname|this.$utils.toggleClass(el, classname, type)  |1、el:目标元素  2、cls:需要操作的class  3、type:"add"代表添加对应的class  "remove"代码删除对应的class 如果不传则有则删除，没有则添加|
checkType|检查value类型是否为type类型，如果type为空则返回值的类型|this.$utils.checkType(value, type)  |type可以是类型的字符串和多个类型的array|
checkStringNotEmpty|检查value类是否为空|this.$utils.checkStringNotEmpty(value) |包含null和undefined和空三种|
isSame|检查2个数组是否一样（类型和值）|this.$utils.isSame(str1, str2) |-|
translateNumber|将阿拉伯数字转为对应需要的格式（中文一二三或者英文ABCD）|this.$utils.translateNumber(values, codeType) |values为1、2、3这种数字（一般是下标），codeType：不填或者'en'|
getLightColor|获取十六进度hex色值转化为按指定百分比减淡的颜色|this.$utils.getLightColor('#333333', 0.2) |getLightColor(colors, level, noOpacity),color:十六进制hex,level:减淡到的百分比，用小数点形式,noOpacity:是否用透明度，默认否，如需要去掉透明度则会转为十六进制hex（部分浏览器如果对某些色值透明度处理有问题需要转为十六进制hex）|
gotoHref|全局的通过链接跳转时，需要做路由拦截等操作|this.$utils.gotoHref(href, this) |href为对应跳转地址，this为当前模版的this变量|
jumpDialog|返回提示统一操作，目的统一文案，和统一按钮交互方式，需要在每个路由的beforeRouteLeave里处理 | 如下示例|-|
```javascript
this.$utils.jumpDialog.call(this, {
  save: {
    fn: async(vnode) => {
      return await _this.saveAction();
    }
  }
}, to, from, next, url);
```


## 全局指令  

> download（点击从指定地址下载文件）

```javascript
<i v-download=”downurl”  v-download:success="downloadok" v-download:error="downloaderror"></i>
```

参数|用途|使用|其他
:---:|:---:|:---:|:---|
downurl|设置下载的参数和地址|单纯url和{url:地址，method:'post',params:{参数},changeStatus(status)=>{//do something with status}}|url为必传，method、changeStatus、params均为非必传|
downloadok|下载接口回调成功回调事件|-|-|
downloaderror|下载接口回调失败回调事件|-|-|



> clipboard（点击复制指定内容到剪切板供其他地方粘贴复制用）

```javascript
<i v-clipboard="value"  v-clipboard:success="ok" v-clipboard:error="error"></i>
```

参数|用途|使用|其他
:---:|:---:|:---:|:---|
value|粘贴的内容|-|-|
ok|粘贴成功的回调事件|-|-|
error|粘贴失败的回调事件|-|-|



> img-viewer（图片预览，指令使用在需要预览图片的容器上，监听点击事件）

```javascript
<div v-imgViewer ></div>
```

参数|用途|使用|其他
:---:|:---:|:---:|:---|


> scroll-hidden（容器滚动时隐藏drop的内容，指令使用在滚动的容器里面，监听滚动事件）

```javascript
<div v-scrollHidden  ></div>
```

参数|用途|使用|其他
:---:|:---:|:---:|:---|


> v-auth 指令 （控制用户权限，指令使用在需要控制当前用户是否需要显示某个元素或者按钮）

```js
// 可传递单个权限字符串
<Button v-auth="'INSPECT_EXECUTE'"></Button>

// 可传递数组，数组中有一个满足，都会显示Button按钮
<Button v-auth="['INSPECT_EXECUTE', 'INSPECT_SCHEDULE_EXECUTE']"></Button>
```



## 全局过滤器  

参数|用途|使用|其他
:---:|:---:|:---:|:---|
formatDate|时间格式处理|{{ 时间戳 \| formatDate(指定格式) }}|指定格式可不传,默认yyyy-mm-dd hh:mm:ss|
formatTimeCost|处理耗时|{{ timeCost\|formatTimeCost({textUnit:’second’,valueUnit:’second’,unitType:’en’}) }}|通用场景：timecost为精确到毫秒的时间戳转化为标准时间格式，后面参数为非必填（默认显示文案单位textUnit为秒second、值的单位valueUnit为毫秒millisecond,单位语言类型默认为中文zh）更多设置：textUnit和valueUnit可供设置的有：{'day': '天','hour': '小时','minute': '分钟','second': '秒','millisecond': '毫秒'},unitType目前只支持中文zh和英文en|
unescapeHtml|转义特殊字符为html|{{ 字符串 \| unescapeHtml}}|-|

## 全局状态管理  

用途|state.\*|示例|
:---:|:---:|:---|
获取当前用户权限列表|userAuthList|this.$store.getters.userAuthList|

## 全局通用组件
### 布局类


#### 基础组件

名称|用途|说明|其他
:---:|:---:|:---:|:---|
TsContain|基本排版（页面最外层）|见TsContain组件api|全局组件，直接调用即可|
Button|按钮|iview的组件|全局组件，直接调用即可|
Tabs|标签页|iview的组件|全局组件，直接调用即可|
Dropdown|下拉菜单|iview的组件|全局组件，直接调用即可|
Badge|徽标数|iview的组件|全局组件，直接调用即可|
Loading|加载中组件|封装过的组件|全局组件，直接调用即可|
NoData|无数据提示组件|封装过的组件|全局组件，直接调用即可|


#### 拓展定制组件
名称|用途|说明|其他
:---:|:---:|:---:|:---|
TsForm|表单组件|见TsForm组件api|需要注册组件|




#### 表单搜索、选择类组件

名称|用途|说明|其他
:---:|:---:|:---:|:---|
CombineSearcher|组合下拉搜索|见CombineSearcher组件api|需要注册组件|
PoptipSelect|下拉选择器|见PoptipSelect组件api|一般用于固定选项下拉展开后有描述等内容，需要注册组件|
TimeSelect|时间下拉选择器|见TimeSelect组件api|一般用于选择固定时间范围和具体时间范围，需要注册组件|
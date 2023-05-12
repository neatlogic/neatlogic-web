### 对话框（TsDialog）  


#### 模版使用
```javascript
    <TsDialog
      :isShow.sync="isDialogShow"
      :title=""
      @on-cancel="cancel"
      @on-close="close"
      @on-ok="ok"
    >
      <Tsform ></Tsform>
    </TsDialog>
```

#### js使用
```javascript
   this.$createDialog({
        title: '删除',
        content: '确定要删除对应的数据？',
        btnType:'error',//error  primary
        btnList:[   
          {
            text: '不保存',
            type: 'primary',//具体的值可以参考 iview里面button的属性
            ghost: true,//按钮背景透明
            fn: vnode => {
              vnode.isShow = false;
              url ? _this.$utils.gotoHref(url) : next();
            }
          }
       ],
        'on-ok': function(vnode) {//确定按钮
            vnode.isShow = false; //需要自己来写关闭逻辑
        },
        'on-cancel':function(){//取消按钮  

        },
        'on-close': function() {//关闭模态框 只要模态框关闭则会调用
           
        }
    });
```

#### 参数、方法说明


> 参数


参数名|数据类型|默认值|必传|用途|说明
:---:|:---:|:---:|:---:|:---:|:---|
type|String|modal|否|模态框的类型| modal、slider
fullscreen|Boolean|无|否|是否可以全屏|控制全屏按钮是否显示
top|String|无|-|距离窗口顶部的距离|如：12px
hasHeader|Boolean|true|否|是否需要有头部| 
hasFooter|Boolean|true|否|是否需要有底部操作栏|
position|String|right|否|摸态框显示的地方| 在type为slider时生效  
hasMask|Boolean|true|否|是否有遮罩层 |
width|String|small|否|摸态框的宽度 | mini、small、medium、large 、10px、 80% 、 100
height|String|-|否|摸态框内容的宽度|10px、 80%
maskClose|Boolean|false|否|是否允许点击关闭空白处关闭遮罩层|一般用于模态框内容为只读模式
className|String|-|否|给模态框添加class|主要用在scope样式不生效时使用
isShow|Boolean|false|否|是否关闭弹窗|通过:isShow.sync 进行使用
okText|String|确定|否|确定按钮的文案|
okBtnDisable|Boolean|false|否|禁用确定按钮|一般用于调用接口时使用，防止多次点击
cancelText|Boolean|取消|否|取消按钮的文案|
title|String|-|否|header显示文案|通过v-html进行绑定
content|String|-|否|内容显示文案|通过v-html进行绑定，一般用于简单内容
showCloseIcon|Boolean|false|否|是否显示关闭按钮|头部操作区域的"x"按钮
btnType|String|primary|否|确定按钮的颜色|error  primary
bgOp|Boolean|false|否|弹出框的背景颜色是否是白底|正常情况下面颜色为灰色，特殊情况需要白色背景
defaultFull|Boolean|false|否|是否满屏设置|在type为modal的情况下面生效
btnList|Array|-|否|底部操作区域的按钮数组|[{ text: '取消',  ghost: true, type: 'primary', fn: vnode => { vnode.isShow = false; }}]
transfer|Boolean|true|否|弹窗是代码是否在body下面|
theme|Object|-|否|自定义主题样式

2021-11-10 添加新方法
loading|Boolean|false|否|是否有加载中状态|


>  方法(通过@调用方法)


 方法名|用途|说明
:---:|:---:|:---
on-ok|确定按钮,点击触发| -
on-cancel|取消按钮,点击触发|-
on-close|关闭按钮，或者弹窗关闭触发|-


> 方法(通过.sync调用方法更新值)


 属性名称|用途|说明
:---:|:---:|:---
isShow|模态框是否显示| 一般在外面还的使用v-if，主要是为了初始化数据，不用写多余js


> 插槽(slot)


 名称|slot-scope|用途|说明
:---:|:---:|:---:|:---
header|无|头部title文案内容|当属性title不能满足的场景
footer|无|底部操作区域|当一般场景，取消 和 确定 按钮不能满足的场景

>特殊数据说明

1. itemList,与tbody的数据对应键名保持一致，title为显示文案），例子：

```javascript
config:{
    type: 'modal',  //弹窗类型，默认modal中间弹窗；slider侧滑窗
    fullscreen: false, //modal 是否可以全屏
    top: '200px',
    hasHeader: true, //是否有顶部栏
    hasFooter: true,//是否有底部栏
    position: right, //弹窗位置
    hasMask: true, //是否有遮罩层
    width:'small', //宽度设置
    height: '500px',
    maskClose: false, //是否允许点击关闭空白处关闭遮罩层
    className: 'test', //额外添加class
    isShow: false,//是否关闭弹窗
    okText:'确定',//确定按钮的文案
    okBtnDisable: false,//禁用确定按钮，一般用于调用接口时使用
    cancelText: '取消', //取消按钮的文案
    title: '标题', //header显示文案
    content: '内容' //内容显示文案
    showCloseIcon:true,  //是否显示关闭按钮
    btnType: 'primary', //确定按钮的颜色  error  primary
    bgOp: false,//弹出框的背景颜色是否是白底
    defaultFull: false,//modal情况下面是否满屏设置
    btnList: [//底部操作区域的按钮数组
      { 
        text: '取消',  
        ghost: true, 
        type: 'primary', 
        fn: vnode => { vnode.isShow = false; }
      }
    ],
    transfer: true
}
```

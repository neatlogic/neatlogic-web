# 全局基础样式、方法

## 样式传透

rsbuild 升级到 v1 版本之后，内置的 less 从 v3 升级到 v4，导致`/deep/`样式的传透失效，所以后续需要使用`::v-deep`来实现样式的传透。

## 常用 js 工具方法

|     文件      |      说明      |
| :-----------: | :------------: |
|  authUtil.js  |   权限方法库   |
| localStore.js | 本地缓存方法库 |
|   state.js    | 状态管理工具库 |
|    util.js    | 常用工具方法库 |

## 全局通用样式

> > > 页面栅格布局说明:(sm:800px,md:1024px,lg:1280px,xl:1400px,xxl:1920px)

#### 通用类样式 class

|    class 名    |            用途            | 说明               |
| :------------: | :------------------------: | :----------------- |
|       h1       |    特大标题(登录页系统)    | 字号 28 行高 36    |
|       h2       |     弹窗对话框标题文字     | 字号 18 行高 26    |
|       h3       | 大屏展示统计图标题、大标题 | 字号 16 行高 24    |
|       h4       |         一二级菜单         | 字号 14 行高 22    |
|      fz10      |         提示类文字         | 字号 10（待调整）  |
|      fz16      |             无             | 字号 16            |
|      fz18      |             无             | 字号 18            |
|      fz20      |             无             | 字号 20            |
|      text      |       正文、基本字号       | 字号 13 行高 21    |
|      tips      |     表格头部、错误提示     | 字号 12 行高 20    |
| cursor-pointer |  鼠标上移显示可点击的手型  | 悬浮于连接上时，手 |

#### 通用类颜色样式 class

|    class 名     |           用途           | 说明                                                           |
| :-------------: | :----------------------: | :------------------------------------------------------------- |
|   text-title    |         标题字体         | 颜色为标题色，比正文字体颜色深                                 |
|   text-action   |       可操作类文字       | 默认正文颜色，移上去变可点击的蓝色+pointer                     |
|    text-href    |        跳转类文字        | 字体颜色可点击颜色+移上去 pointer                              |
|   text-white    |         白色文字         | 不会随主题色发生改变的白色，目前是#fff                         |
|     text-op     |          相反色          | 适用于需要根据主题色改变的反色                                 |
|  text-disabled  |       不可操作文字       | 移上去鼠标显示不可操作+0.6 透明度                              |
|    text-info    |      info 颜色字体       | -                                                              |
|  text-primary   |        主题色字体        | -                                                              |
|  text-success   |      绿色成功色字体      | -                                                              |
|   text-danger   |      红色告警色字体      | -                                                              |
|  text-warning   |      橙色告警色字体      | -                                                              |
|   text-error    |      红色错误色字体      | -                                                              |
|  border-error   |         红色边框         | -                                                              |
| border-primary  |        主题色边框        | -                                                              |
|    text-tip     |   提示类文字，颜色浅色   | 跟着主题走                                                     |
|    text-grey    |        提示类文字        | 此 class 尽量少用，早期 class，用 text-tip                     |
| text-tip-active |   提示类文字，颜色浅色   | 鼠标上移提示类颜色变色                                         |
|  require-label  |        必填的文字        | \*号必填样式红色                                               |
|     bg-grey     |        背景色灰色        | -                                                              |
|   bg-tip-grey   |   提示灰色背景（弱化）   | -                                                              |
|  bg-hover-grey  |    移上去背景色为灰色    | -                                                              |
|      bg-op      |   背景色与字体颜色相反   | （浅色主题为白色，深色主题为墨蓝色）                           |
|    bg-block     |      块状元素背景色      | （目前是浅灰色）                                               |
|     bg-info     |         蓝色背景         | -                                                              |
|  bg-info-grey   |        浅蓝色背景        | 用于蓝色背景（弱化）                                           |
|   bg-success    |         绿色背景         | -                                                              |
| bg-success-grey |        浅绿色背景        | 用于绿色背景（弱化）                                           |
|   bg-warning    |        橙色色背景        | -                                                              |
| bg-warning-grey |        浅橙色背景        | 用于橙色背景（弱化）                                           |
|    bg-error     |         红色背景         | -                                                              |
|  bg-error-grey  |        浅红色背景        | 用于红色背景（弱化）                                           |
|     bg-code     |     代码片段的背景色     | -                                                              |
|   bg-selected   |        选中背景色        | 选中的带浅色主题色背景色的样式                                 |
|  item-selected  |       选中的主题色       | 字体颜色带浅色背景色的样式                                     |
|    bg-modal     |       模态窗背景色       | 非白的，浅浅灰                                                 |
|  bg-footer-btn  | 卡片式的底部操作栏背景色 | 前期为白色后期调整为浅灰色                                     |
|    bg-stripe    |        条纹背景色        | 用户折叠展开<Collapse>组件的 header                            |
|      lh-2       |      行高 2 倍字号       | 用于有时候需要文字行高比一般的高一些（比如空数据提示等）       |
|  input-border   |     输入框需要带边框     | 不推荐使用（早期风格为整体底框时专门处理需要四边框的输入框用） |

#### 场景类样式 class

##### 页面排版涉及到圆角弧度,边框，阴影

|   class 名   |     用途     | 说明                                     |
| :----------: | :----------: | :--------------------------------------- |
|  radius-lg   |  圆角 10px   | 用于大块的元素                           |
|  radius-md   |   圆角 8px   | 一般用于 table，卡片等等                 |
|  radius-sm   |   圆角 6px   | 一般用于条状元素，比如操作栏、输入框等等 |
|  radius-mi   |   圆角 4px   | 一般用于按钮                             |
| block-border | 块状元素边框 | -                                        |
|    shadow    | 块状元素阴影 | -                                        |

##### 超过内容区域显示处理

|      class 名      |         用途         | 说明                   |
| :----------------: | :------------------: | :--------------------- |
|      overflow      |  超过宽度显示省略号  | -                      |
|       line-2       | 超过 2 行显示省略号  | 以 2 倍行高为标准      |
|       line-3       | 超过 3 行显示省略号  | 以 3 倍行高为标准      |
|     block-add      |   添加按钮块状样式   | 需要独占一行的         |
| tsscroll-container | 如果溢出则出现滚动条 | 该样式处理了滚动条样式 |

##### 对齐方式

|   class 名   |     用途     | 说明                                                         |
| :----------: | :----------: | :----------------------------------------------------------- |
|   clearfix   |   清除浮动   | 子级浮动造成的样式问题-                                      |
|  float-left  |  元素左浮动  | 父级元素需加上清除浮动的样式，比如加上 clearfix 的 classname |
| float-right  |  元素右浮动  | 父级元素需加上清除浮动的样式，比如加上 clearfix 的 classname |
| text-center  |   居中对齐   | 元素水平方向（横轴）                                         |
|  text-left   |    左对齐    | 元素水平方向（横轴）                                         |
|  text-right  |    右对齐    | 元素水平方向（横轴）                                         |
|  flex-start  |    左对齐    | flex 布局横轴元素开始方向对齐                                |
|   flex-end   |    右对齐    | flex 布局横轴元素结束方向对齐                                |
| flex-center  |   中心对齐   | flex 布局横轴元素                                            |
| flex-between |   两端对齐   | flex 布局横轴项目位于各行之间留有空白的容器内                |
| flex-around  | 项目两侧等距 | flex 布局横轴项目位于各行之前、之间、之后都留有空白的容器内  |
| align-start  |  交叉轴对齐  | flex 布局竖轴顶对齐（开始方向对齐）                          |

##### 间隙

> p 前缀的表示 padding，t/r/b/l 分别表示 top/right/bottom/left (上右下左) 四个方向的边距

> m 前缀的表示 margin，t/r/b/l 分别表示 top/right/bottom/left (上右下左) 四个方向的边距

> 其中 lg 表示 24 像素，nm 表示 16 像素，md 表示 12 像素，sm 表示 10 像素， xs 表示 6 像素

| 内边距类名 |       用途       | 说明                                   |
| :--------: | :--------------: | :------------------------------------- |
| padding-lg |  内间隙最大尺寸  | padding: 24px                          |
|  padding   |    内间距尺寸    | padding: 16px                          |
| padding-md |  内间隙普通尺寸  | padding: 12px                          |
| padding-sm |   内间隙小尺寸   | padding: 10px，一般用于文字间隙        |
| padding-xs |    内间隙较小    | padding: 6px; 比如分页的页数之间的间隙 |
|   pt-nm    |  上内间隙 16px   | padding-top: 16px;                     |
|   pb-nm    |  下内间隙 16px   | padding-bottom: 16px;                  |
|   pl-nm    |  左内间隙 16px   | padding-left: 16px;                    |
|   pr-nm    |  右内间隙 16px   | padding-right: 16px;                   |
|   pr-md    | 右内间隙普通尺寸 | padding-right: 12px;                   |
|   pl-md    | 左内间隙普通尺寸 | padding-left: 12px;                    |
|   pt-md    | 右内间隙普通尺寸 | padding-top: 12px;                     |
|   pb-md    | 左内间隙普通尺寸 | padding-bottom: 12px;                  |
|   pt-sm    |  上内间隙 10px   | padding-top: 10px;                     |
|   pb-sm    |  下内间隙 10px   | padding-bottom: 10px;                  |
|   pl-sm    |  左内间隙 10px   | padding-left: 10px;                    |
|   pr-sm    |  右内间隙 10px   | padding-right: 10px;                   |
|   pt-xs    |   上内间隙 6px   | padding-top: 6px;                      |
|   pb-xs    |   下内间隙 6px   | padding-bottom: 6px;                   |
|   pl-xs    |   左内间隙 6px   | padding-left: 6px;                     |
|   pr-xs    |   右内间隙 6px   | padding-right: 6px;                    |

| 外边距类名 | 说明                |
| :--------: | :------------------ |
| margin-lg  | margin: 24px;       |
| margin-md  | margin: 12px;       |
| margin-sm  | margin: 10px        |
|   mr-nm    | margin-right: 16px; |
|   ml-nm    | margin-left: 16px   |
|   mt-nm    | margin-top: 16px    |
|   mb-nm    | margin-bottom: 16px |
|   mr-md    | margin-right: 12px; |
|   ml-md    | margin-left: 12px   |
|   mt-md    | margin-top: 12px    |
|   mb-md    | margin-bottom: 12px |
|   mr-sm    | margin-right: 10px; |
|   ml-sm    | margin-left: 10px   |
|   mt-sm    | margin-top: 10px    |
|   mb-sm    | margin-bottom: 10px |
|   mr-xs    | margin-right: 6px;  |
|   ml-xs    | margin-left: 6px    |
|   mt-xs    | margin-top: 6px     |
|   mb-xs    | margin-bottom: 6px  |

##### 图标文字间隙

|  class 名  |           用途           | 说明              |
| :--------: | :----------------------: | :---------------- |
| icon-right | 字体图标到右侧文案的间隙 | 间隙大小为 4 像素 |

##### 操作栏

|                class 名                 |                用途                | 说明                                 |
| :-------------------------------------: | :--------------------------------: | :----------------------------------- |
| .action-group>.action-item\*n(.disable) | 操作分类组，常用于各种多个操作并列 | 禁用时 action-item 添加 disable 类名 |

##### 动画

> 调用：直接动画里加上动画名字，其他参数按照实际（比如：animation: water-wave linear infinite;）

|   动画名   |                 用途                  | 说明                                                             |
| :--------: | :-----------------------------------: | :--------------------------------------------------------------- |
|    fade    |             渐明减暗效果              | 透明度从 0.6 到 1 的轮播，用法：animation: fade linear infinite; |
|  rocking   |               晃铃效果                | 用法：animation: rocking 2s;                                     |
| water-wave |              水波纹效果               | 用法：animation: fade linear infinite;                           |
| rubberBand | animatecss 的 rubberBand 弹橡皮筋动画 | 用法：animation: rubberBand 1s;                                  |

##### 兼容老的样式的表单布局

|                class 名                |                      用途                      | 说明       |
| :------------------------------------: | :--------------------------------------------: | :--------- |
| .form-block>(.block-left+.block-right) | 左侧 label（宽度 120px）右侧表单或者文字的布局 | 不推荐使用 |

## 全局方法

#### 全局变量

|     名称      |          用途          |                        说明                         |
| :-----------: | :--------------------: | :-------------------------------------------------: |
|    TENANT     |      获取当前租户      |             通过获取地址栏上的租户名称              |
|     HOME      | 获取当前访问地址的前缀 |    目前是"/租户"，用户打开新标签页时拼接路径前缀    |
| BASEURLPREFIX |    获取默认接口前缀    | 目前是"/租户"，api 调用路径只需要从租户后的路径开始 |
| BASELANGUAGES |   获取当前页面的语言   |                目前支持中英文，zh/en                |
|   MODULEID    |      获取模块名称      |                     模块的名称                      |
|   MENUTYPE    |    获取菜单分类名称    |                 左侧菜单大分类名称                  |

#### utils

> > > 模版调用方法：

````javascript
// 查看所有方法的地址：/src/resources/assets/js/util.js
this.$utils.***
```                                                                                                                                                                                                                          |

```javascript
this.$utils.jumpDialog.call(
  this,
  {
    save: {
      fn: async vnode => {
        return await _this.saveAction();
      }
    }
  },
  to,
  from,
  next,
  url
);
````

## 全局指令

> download（点击从指定地址下载文件）

```vue
<template>
  <i v-download="downLoadUrl(id)" v-download:success="downloadok" v-download:error="downloaderror"></i>
</template>
<script>
export default {
  computed: {
    downLoadUrl() {
      return id => {
        // 例如这样
        let params = {
          id: id
        };
        return {
          url: '/api/binary/file/download',
          params: params,
          changeStatus: status => {
            if (status == 'start') {
              // 下载开始的处理逻辑，可以根据自己的业务需求进行处理
            } else if (status == 'success' || status == 'error') {
              // 下载完成的处理逻辑，可以根据自己的业务需求进行处理
            }
          }
        };
      };
    }
  }
};
</script>
```

|     参数      |           用途           |
| :-----------: | :----------------------: |
|    downurl    |   设置下载的参数和地址   |
|  downloadok   | 下载接口回调成功回调事件 |
| downloaderror | 下载接口回调失败回调事件 |

> clipboard（点击复制指定内容到剪切板供其他地方粘贴复制用）

```javascript
<i v-clipboard="value" v-clipboard:success="ok" v-clipboard:error="error"></i>
```

| 参数  |        用途        | 使用 | 其他 |
| :---: | :----------------: | :--: | :--- |
| value |     粘贴的内容     |  -   | -    |
|  ok   | 粘贴成功的回调事件 |  -   | -    |
| error | 粘贴失败的回调事件 |  -   | -    |

> img-viewer（图片预览，指令使用在需要预览图片的容器上，监听点击事件）

```javascript
<div v-imgViewer></div>
```

| 参数 | 用途 | 使用 | 其他 |
| :--: | :--: | :--: | :--- |

> scroll-hidden（容器滚动时隐藏 drop 的内容，指令使用在滚动的容器里面，监听滚动事件）

```javascript
<div v-scrollHidden></div>
```

| 参数 | 用途 | 使用 | 其他 |
| :--: | :--: | :--: | :--- |

> v-auth 指令 （控制用户权限，指令使用在需要控制当前用户是否需要显示某个元素或者按钮）

```js
// 可传递单个权限字符串
<Button v-auth="'INSPECT_EXECUTE'"></Button>

// 可传递数组，数组中有一个满足，都会显示Button按钮
<Button v-auth="['INSPECT_EXECUTE', 'INSPECT_SCHEDULE_EXECUTE']"></Button>
```

## 全局过滤器

|      参数      |        用途         |   使用    | 其他                    |
| :------------: | :-----------------: | :-------: | :---------------------- | --------------------------------------- |
|   formatDate   |    时间格式处理     | {{ 时间戳 | formatDate(指定格式) }} | 指定格式可不传,默认 yyyy-mm-dd hh:mm:ss |
| formatTimeCost |      处理耗时       |           |                         |
|  unescapeHtml  | 转义特殊字符为 html | {{ 字符串 | unescapeHtml}}          | -                                       |

## 全局状态管理

|         用途         |   state.\*   | 示例                             |
| :------------------: | :----------: | :------------------------------- |
| 获取当前用户权限列表 | userAuthList | this.$store.getters.userAuthList |

## 全局通用组件

### 布局类

#### 基础组件

|   名称    |          用途          |         说明          | 其他                   |
| :-------: | :--------------------: | :-------------------: | :--------------------- |
| TsContain | 基本排版（页面最外层） | 见 TsContain 组件 api | 全局组件，直接调用即可 |
|  Button   |          按钮          |     iview 的组件      | 全局组件，直接调用即可 |
|   Tabs    |         标签页         |     iview 的组件      | 全局组件，直接调用即可 |
| Dropdown  |        下拉菜单        |     iview 的组件      | 全局组件，直接调用即可 |
|   Badge   |         徽标数         |     iview 的组件      | 全局组件，直接调用即可 |
|  Loading  |       加载中组件       |     封装过的组件      | 全局组件，直接调用即可 |
|  NoData   |     无数据提示组件     |     封装过的组件      | 全局组件，直接调用即可 |

#### 拓展定制组件

|  名称  |   用途   |        说明        | 其他         |
| :----: | :------: | :----------------: | :----------- |
| TsForm | 表单组件 | 见 TsForm 组件 api | 需要注册组件 |

#### 表单搜索、选择类组件

|      名称       |      用途      |            说明             | 其他                                                 |
| :-------------: | :------------: | :-------------------------: | :--------------------------------------------------- |
| CombineSearcher |  组合下拉搜索  | 见 CombineSearcher 组件 api | 需要注册组件                                         |
|  PoptipSelect   |   下拉选择器   |  见 PoptipSelect 组件 api   | 一般用于固定选项下拉展开后有描述等内容，需要注册组件 |
|   TimeSelect    | 时间下拉选择器 |   见 TimeSelect 组件 api    | 一般用于选择固定时间范围和具体时间范围，需要注册组件 |

#### 表格的类

`tstable-container border bg-grey radius-lg` 然后 `table标签上` 添加类名`tstable-body`，最后记得在`tbody`标签上添加`tbody-main`类名

```vue
 <div class="tstable-container border bg-grey radius-lg">
        <div>
          <table class="tstable-body">
            <thead>
              <tr>
                <th>
                </th>
                <th style="width:40px"></th>
              </tr>
            </thead>
            <tbody class="tbody-main">
              <tr>
                <td>
                </td>
                <td>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
```
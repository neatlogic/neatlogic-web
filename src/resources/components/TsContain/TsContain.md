### 容器布局组件（TsContain）

`TsContain` 是项目里的通用页面容器组件，用来组织页面头部、正文、左侧栏、右侧栏等区域。
适合管理页、详情页、弹窗内容区等需要统一布局的场景。

#### 基本能力

- 支持头部区域的 `navigation`、`topLeft`、`topCenter`、`topRight` 分区布局
- 支持正文区域 `content`
- 支持左侧 `sider` 和右侧 `right` 侧栏
- 支持左侧栏折叠/展开
- 支持右侧栏按钮切换展开/收起
- 支持 `window` / `dialog` 两种高度计算模式
- 支持头部隐藏、内容区内边距控制、顶部三列宽度控制

#### 使用示例

```vue
<TsContain
  :enableCollapse="true"
  :siderWidth="240"
  :rightWidth="320"
  @toggleSiderHide="handleToggleSider"
  @rightSiderToggle="handleRightToggle"
  @scroll="handleScroll"
>
  <template v-slot:navigation>
    <span class="text-grey">监控中心</span>
  </template>

  <template v-slot:topLeft>
    <div class="action-group">
      <span class="action-item tsfont-plus">新增</span>
    </div>
  </template>

  <template v-slot:topRight>
    <InputSearcher v-model="keyword"></InputSearcher>
  </template>

  <template v-slot:sider>
    左侧栏内容
  </template>

  <template v-slot:content>
    主体内容
  </template>

  <template v-slot:right>
    右侧栏内容
  </template>
</TsContain>
```

#### Props

参数 | 类型 | 默认值 | 说明
---|---|---|---
`hasContentPadding` | `Boolean` | `true` | 正文区域是否保留左右内边距
`enableCollapse` | `Boolean` | `false` | 是否显示左侧栏收起/展开按钮，仅在存在 `sider` 插槽时生效
`enableDivider` | `Boolean` | `false` | 头部 `navigation` 后是否额外显示分隔线
`sessionName` | `String` | `-` | 预留的侧栏状态标识，当前源码中卸载时会清理对应 localStorage
`isSiderHide` | `Boolean` | `false` | 外部控制左侧栏是否隐藏
`isRightSiderHide` | `Boolean` | `false` | 外部控制右侧栏是否隐藏
`gutter` | `Number` | `16` | 内容区间距控制，`0` 时正文会使用无 padding 高度类
`border` | `String` | `'none'` | 头部/侧栏边框风格，常用值 `none`、`border`
`navHeaderBottom` | `String` | `'none'` | 头部底部分隔样式控制
`hideHeader` | `Boolean` | `false` | 是否隐藏整个头部区域
`siderWidth` | `Number` | `200` | 左侧栏宽度
`siderPosition` | `String` | `'left'` | 侧栏位置，支持 `left`、`right`
`isBackgroung` | `Boolean` | `true` | 是否使用默认灰色头部背景
`clearStyle` | `Boolean` | `false` | 是否清除侧栏默认背景/圆角等样式
`rightWidth` | `Number` | `200` | 右侧栏宽度
`mode` | `String` | `'window'` | 高度模式，支持 `window`、`dialog`
`rightBtn` | `Boolean` | `false` | 右侧栏是否显示切换按钮
`topLeftWidth` | `String` | `''` | 头部左侧区域宽度
`topCenterWidth` | `String` | `''` | 头部中间区域宽度
`topRightWidth` | `String` | `''` | 头部右侧区域宽度

#### Slots

插槽名 | 说明
---|---
`navigation` | 头部最左侧导航区域
`top` | 自定义整个头部内容；使用后可覆盖默认的 `topLeft/topCenter/topRight` 结构
`topLeft` | 头部左侧区域，通常放操作区
`topCenter` | 头部中间区域
`topRight` | 头部右侧区域，通常放搜索或筛选区
`content` | 正文内容区域
`sider` | 左侧栏内容
`right` | 右侧栏内容

#### Events

事件名 | 参数 | 说明
---|---|---
`toggleSiderHide` | `(siderHide)` | 点击左侧栏折叠按钮时触发
`on-collapse` | `($event)` | 左侧 `Sider` 折叠状态变化时透传
`rightSiderToggle` | `-` | 点击右侧栏切换按钮时触发
`scroll` | `(scrollTop, event)` | 正文滚动时触发
`verticals` | `-` | 调用实例方法 `verticals()` 时触发

#### 实例方法

方法名 | 参数 | 说明
---|---|---
`scrollTop` | `(top)` | 将正文区域滚动到指定高度
`rightSiderToggle` | `-` | 切换右侧栏展开/收起
`handleContainHeight` | `-` | 重新计算容器高度
`verticals` | `-` | 向外触发 `verticals` 事件

#### 头部布局规则

- 如果同时提供 `topLeft`、`topCenter`、`topRight`，组件会按三列 grid 布局渲染
- 如果只提供左右两侧，会使用左右对齐布局
- 如果传入 `topLeftWidth`、`topCenterWidth`、`topRightWidth`，会覆盖默认宽度
- 如果传入 `top` 插槽，会使用自定义头部内容，不再使用默认三段式布局

#### 高度规则

- `mode="window"`：组件会基于当前容器到视口顶部的位置，自动计算剩余高度
- `mode="dialog"`：容器高度固定为 `100%`，适用于弹窗内部
- `hideHeader=true` 时，正文高度不再减去头部高度

#### 说明

#### 兼容性说明

- 当前版本保留了 `sessionName` 相关的历史缓存清理语义，组件销毁时仍会移除对应的 `localStorage` 记录，没有改成自动记忆侧栏状态。
- `initConfig` 的延时重试改为使用组件实例作用域清理 timer，避免定时器状态残留，但不会改变原有重试时机。
- 新增实例方法 `refreshContainHeight()`，内部仍复用 `handleContainHeight()`，默认不会额外绑定全局 `resize` 监听。


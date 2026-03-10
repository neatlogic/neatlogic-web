### 对话框（TsDialog）

TsDialog 是一个功能丰富的对话框组件，支持模态框、侧滑窗两种类型，提供了灵活的配置选项和多种使用方式。


#### 安装与注册

由于项目已经在全局 `base.js` 中引用了 TsDialog 组件，因此开发者可以直接在项目中使用，无需单独引入和注册。

如果需要在其他项目中使用，可以通过以下方式引入：

```javascript
import Vue from 'vue';
import TsDialog from '@/resources/plugins/TsDialog/TsDialog';

Vue.use(TsDialog);
```


#### 模板使用

```javascript
<template>
  <div>
    <Button @click="showDialog">打开对话框</Button>
    <TsDialog
      :isShow.sync="isDialogShow"
      :title="'对话框标题'"
      :width="'medium'"
      :height="'400px'"
      :hasHeader="true"
      :hasFooter="true"
      :showCloseIcon="true"
      :okBtnDisable="isLoading"
      :loading="isLoading"
      @on-ok="handleOk"
      @on-cancel="handleCancel"
      @on-close="handleClose"
    >
      <!-- 对话框内容 -->
      <div class="dialog-content">
        <p>这是对话框的内容区域</p>
        <TsForm :model="formData" :rules="rules">
          <!-- 表单内容 -->
        </TsForm>
      </div>
    </TsDialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isDialogShow: false,
      isLoading: false,
      formData: {},
      rules: {}
    };
  },
  methods: {
    showDialog() {
      this.isDialogShow = true;
    },
    handleOk() {
      this.isLoading = true;
      // 模拟接口请求
      setTimeout(() => {
        this.isLoading = false;
        this.isDialogShow = false;
      }, 1000);
    },
    handleCancel() {
      console.log('取消');
    },
    handleClose() {
      console.log('关闭');
    }
  }
};
</script>
```


#### JavaScript 使用

```javascript
// 基本用法
this.$createDialog({
  title: '删除确认',
  content: '确定要删除对应的数据？',
  btnType: 'error',
  'on-ok': function(vnode) {
    vnode.isShow = false;
    // 执行删除操作
  },
  'on-cancel': function() {
    console.log('取消删除');
  }
});

// 自定义按钮
this.$createDialog({
  title: '操作确认',
  content: '请选择要执行的操作',
  btnList: [
    {
      text: '取消',
      ghost: true,
      type: 'default',
      fn: vnode => {
        vnode.isShow = false;
      }
    },
    {
      text: '保存',
      type: 'primary',
      fn: vnode => {
        // 执行保存操作
        vnode.isShow = false;
      }
    },
    {
      text: '删除',
      type: 'error',
      fn: vnode => {
        // 执行删除操作
        vnode.isShow = false;
      }
    }
  ]
});
```


#### 参数说明

| 参数名 | 数据类型 | 默认值 | 必传 | 用途 | 说明 |
| :---: | :---: | :---: | :---: | :---: | :--- |
| zindex | Number | - | 否 | 弹窗层级 | 控制弹窗的z-index值 |
| type | String | modal | 否 | 弹窗类型 | modal（模态框）、slider（侧滑窗） |
| fullscreen | Boolean | false | 否 | 是否支持全屏 | 控制全屏按钮是否显示，仅在type为modal时生效 |
| top | String | - | 否 | 距离窗口顶部的距离 | 如：12px |
| hasHeader | Boolean | true | 否 | 是否显示头部 | 控制是否显示头部区域 |
| hasFooter | Boolean | true | 否 | 是否显示底部操作栏 | 控制是否显示底部按钮区域 |
| position | String | right | 否 | 弹窗位置 | 在type为slider时生效，可选值：left、right |
| hasMask | Boolean | true | 否 | 是否显示遮罩层 | 控制是否显示背景遮罩 |
| loading | Boolean | false | 否 | 是否显示加载状态 | 控制确定按钮是否显示加载动画 |
| width | String | small | 否 | 弹窗宽度 | 可选值：mini(500px)、small(600px)、medium(800px)、large(1000px)、huge(80%)，也可以直接输入具体数值如：10px、80% |
| height | String | - | 否 | 弹窗内容高度 | 如：10px、80% |
| maskClose | Boolean | false | 否 | 是否允许点击遮罩关闭 | 点击空白处是否关闭弹窗，一般用于模态框内容为只读模式 |
| className | String | - | 否 | 自定义类名 | 为弹窗添加额外的CSS类，主要用在scope样式不生效时使用 |
| isShow | Boolean | false | 否 | 弹窗显示状态 | 通过:isShow.sync 进行双向绑定 |
| okText | String | 确定 | 否 | 确定按钮文案 | 默认值会根据语言配置自动翻译 |
| okBtnDisable | Boolean | false | 否 | 禁用确定按钮 | 一般用于调用接口时使用，防止多次点击 |
| cancelText | String | 取消 | 否 | 取消按钮文案 | 默认值会根据语言配置自动翻译 |
| title | String | - | 否 | 头部标题 | 通过v-html进行绑定 |
| titleDes | String | - | 否 | 标题详情 | 显示在标题下方的描述文字 |
| content | String | - | 否 | 内容文案 | 通过v-html进行绑定，一般用于简单内容 |
| showCloseIcon | Boolean | true | 否 | 是否显示关闭按钮 | 头部操作区域的"x"按钮 |
| btnType | String | primary | 否 | 确定按钮颜色 | 可选值：error、primary |
| bgOp | Boolean | false | 否 | 是否显示白底背景 | 正常情况下背景为灰色，特殊情况需要白色背景时使用 |
| defaultFull | Boolean | false | 否 | 是否默认全屏 | 在type为modal时生效 |
| btnList | Array | - | 否 | 底部操作按钮数组 | 自定义底部按钮，格式：[{ text: '按钮文本', type: '按钮类型', ghost: true, disabled: false, fn: vnode => {} }] |
| transfer | Boolean | true | 否 | 是否转移到body下 | 弹窗代码是否在body下面渲染 |
| theme | Object | - | 否 | 自定义主题样式 | 可自定义弹窗的主题样式 |
| isScrollbar | Boolean | false | 否 | 是否显示滚动条 | 在type为slider时生效 |
| hasContentPadding | Boolean | true | 否 | 是否有内容内边距 | 控制内容区域是否有内边距 |


#### 事件说明

| 事件名 | 用途 | 说明 |
| :---: | :---: | :--- |
| on-ok | 确定按钮点击触发 | 点击确定按钮时调用 |
| on-cancel | 取消按钮点击触发 | 点击取消按钮时调用 |
| on-close | 弹窗关闭触发 | 弹窗关闭时调用，包括点击关闭按钮、取消按钮或遮罩层 |
| onFull | 全屏切换触发 | 点击全屏按钮时调用 |


#### 方法说明

| 方法名 | 用途 | 说明 |
| :---: | :---: | :--- |
| isShow.sync | 控制弹窗显示/隐藏 | 通过双向绑定控制弹窗的显示状态 |


#### 插槽说明

| 插槽名 | slot-scope | 用途 | 说明 |
| :---: | :---: | :---: | :--- |
| default | 无 | 内容区域 | 对话框的主要内容区域 |
| header | 无 | 头部区域 | 自定义头部内容，当title属性不能满足需求时使用 |
| footer | 无 | 底部操作区域 | 自定义底部按钮，当默认的取消和确定按钮不能满足需求时使用 |


#### 完整配置示例

```javascript
// 完整配置示例
const dialogConfig = {
  // 基础配置
  type: 'modal',  // 弹窗类型：modal、slider
  width: 'medium', // 宽度设置
  height: '500px', // 高度设置
  top: '100px', // 距离顶部距离
  hasHeader: true, // 是否显示头部
  hasFooter: true, // 是否显示底部
  hasMask: true, // 是否显示遮罩层
  maskClose: false, // 是否允许点击遮罩关闭
  showCloseIcon: true, // 是否显示关闭按钮
  
  // 内容配置
  title: '对话框标题', // 标题
  titleDes: '这是标题的详细描述', // 标题描述
  content: '这是对话框的内容', // 简单内容
  
  // 按钮配置
  okText: '确定', // 确定按钮文本
  cancelText: '取消', // 取消按钮文本
  btnType: 'primary', // 确定按钮类型
  okBtnDisable: false, // 是否禁用确定按钮
  loading: false, // 是否显示加载状态
  
  // 自定义按钮
  btnList: [
    {
      text: '取消',
      ghost: true,
      type: 'default',
      fn: vnode => {
        vnode.isShow = false;
      }
    },
    {
      text: '确定',
      type: 'primary',
      fn: vnode => {
        // 执行操作
        vnode.isShow = false;
      }
    }
  ],
  
  // 其他配置
  className: 'custom-dialog', // 自定义类名
  transfer: true, // 是否转移到body下
  theme: { // 自定义主题
    TsDialog: {
      backgroundColor: '#f5f7fa'
    }
  },
  
  // 事件处理
  'on-ok': function(vnode) {
    console.log('点击确定');
    vnode.isShow = false;
  },
  'on-cancel': function() {
    console.log('点击取消');
  },
  'on-close': function() {
    console.log('弹窗关闭');
  },
  'onFull': function() {
    console.log('全屏切换');
  }
};

// 使用配置创建对话框
this.$createDialog(dialogConfig);
```


#### 常见使用场景

1. **确认对话框**
   - 用于删除、提交等需要用户确认的操作
   - 通常使用默认的确定和取消按钮

2. **表单对话框**
   - 用于创建、编辑数据的表单
   - 可自定义内容区域为表单组件
   - 可根据表单验证状态控制确定按钮的禁用状态

3. **信息展示对话框**
   - 用于展示详细信息
   - 可设置为只读模式，允许点击遮罩关闭

4. **侧滑对话框**
   - 用于空间有限的场景
   - 从左侧或右侧滑出，节省屏幕空间

5. **自定义按钮对话框**
   - 当默认的确定和取消按钮不能满足需求时
   - 可通过btnList配置多个自定义按钮


#### 注意事项

1. 使用 `:isShow.sync` 双向绑定控制弹窗显示/隐藏时，建议配合 `v-if` 使用，以便在弹窗关闭时销毁组件，释放资源。

2. 当使用 `btnList` 自定义按钮时，需要在按钮的 `fn` 回调中手动关闭弹窗：`vnode.isShow = false`。

3. 当需要在对话框中使用表单时，建议将表单逻辑封装在组件中，通过事件与父组件通信。

4. 对于复杂的对话框内容，建议使用插槽自定义内容，以获得更大的灵活性。

5. 当对话框内容高度不确定时，建议不设置 `height` 属性，让对话框自动适应内容高度。


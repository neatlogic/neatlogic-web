# TsFormInput 输入框组件说明文档

## 组件简介

TsFormInput 是一个基于 Input / InputNumber 封装的表单输入组件，支持：

-   普通输入框
-   密码框
-   文本域 textarea
-   数字输入框
-   搜索输入框
-   校验规则
-   主题定制
-   只读模式
-   字数统计
-   自定义前后缀
-   主题颜色配置

支持 v-model 双向绑定。

------------------------------------------------------------------------

## 基础使用

``` vue
<TsFormInput
  v-model="value"
  :type="'text'"
  :maxlength="100"
  placeholder="请输入内容"
>
</TsFormInput>
```

------------------------------------------------------------------------
## 支持的 type 值
| type 值   | 说明           |
| -------- | ------------ |
| text     | 普通输入框        |
| password | 密码输入框        |
| textarea | 多行文本         |
| number   | 数字输入框        |
| 其他       | 透传给 Input 组件 |

------------------------------------------------------------------------

## Props 参数说明
| 参数            | 类型                        | 默认值             | 必填 | 说明                | 可选值 / 生效条件                                  |
| ------------- | ------------------------- | --------------- | -- | ----------------- | ------------------------------------------- |
| type          | String                    | text            | 否  | 输入框类型             | text、textarea、number、url、email、tel、password |
| value         | String / Number / Object  | ''              | 是  | 绑定值，支持 v-model    | -                                           |
| name          | String                    | -               | 否  | 字段名               | -                                           |
| disabled      | Boolean                   | false           | 否  | 是否禁用              | -                                           |
| readonly      | Boolean                   | false           | 否  | 是否只读              | 仅展示文本，不显示边框                                 |
| placeholder   | String                    | 国际化默认           | 否  | 占位提示              | -                                           |
| size          | String                    | default         | 否  | 控件尺寸              | large、small、default                         |
| width         | String / Number           | 100%            | 否  | 控件宽度              | 支持 px / %                                   |
| maxlength     | Number / String           | -               | 否  | 最大输入长度            | -                                           |
| showWordLimit | Boolean                   | true            | 否  | 是否显示字数统计          | password 类型不生效                              |
| showRemain    | Boolean                   | true            | 否  | 仅显示剩余字数           | 需开启 showWordLimit                           |
| validateList  | Array                     | -               | 否  | 校验规则列表            | 配合 TsForm 使用                                |
| errorMessage  | String                    | -               | 否  | 外部控制校验提示          | 不为空则校验失败                                    |
| clearable     | Boolean                   | 自动判断            | 否  | 是否显示清除按钮          | 必填字段默认不显示                                   |
| showPassword  | Boolean                   | true            | 否  | 密码明文切换            | 仅 type=password 生效                          |
| search        | Boolean                   | false           | 否  | 搜索模式              | 显示搜索图标                                      |
| prefix        | String                    | -               | 否  | 输入框前缀             | 仅 text 类型                                   |
| suffix        | String                    | -               | 否  | 输入框后缀             | -                                           |
| icon          | String                    | -               | 否  | 右侧图标              | 点击触发 clickIcon                              |
| prepend       | String                    | -               | 否  | 前置插槽内容            | 仅 text 类型                                   |
| append        | String                    | -               | 否  | 后置插槽内容            | 仅 text 类型                                   |
| autosize      | Boolean / Object          | -               | 否  | textarea 高度自适应    | 仅 type=textarea 生效                          |
| rows          | Number                    | 5               | 否  | textarea 行数       | 仅 type=textarea 生效                          |
| height        | String / Number / Boolean | false           | 否  | textarea 固定高度     | 仅 type=textarea 生效                          |
| monospace     | Boolean                   | false           | 否  | textarea 等宽字体     | 仅 type=textarea 生效                          |
| border        | String                    | -               | 否  | 边框样式              | border、bottom、none                          |
| className     | String                    | -               | 否  | 外层自定义 class       | -                                           |
| readonlyClass | String                    | tsform-readonly | 否  | 只读状态 class        | 可覆盖只读样式                                     |
| desc          | String                    | -               | 否  | 底部描述文案            | 显示在控件下方                                     |
| descType      | String                    | -               | 否  | 描述显示类型            | info、success、warning、error（Alert 模式）        |
| min           | Number                    | -               | 否  | 最小值               | 仅 type=number 生效                            |
| max           | Number                    | -               | 否  | 最大值               | 仅 type=number 生效                            |
| onChange      | Function                  | -               | 否  | 值变化回调             | 常与 TsForm 配合                                |
| onBlur        | Function                  | -               | 否  | 失焦回调              | -                                           |
| onFocus       | Function                  | -               | 否  | 聚焦回调              | -                                           |
| isChangeWrite | Boolean                   | true            | 否  | 赋值时是否触发 on-change | -                                           |
| theme         | Object                    | -               | 否  | 自定义主题样式           | 合并 common + TsFormInput                     |
| forbidContent | String / Array            | -               | 否  | 禁止输入内容            | 默认建议：['<','>','"',"'",'&'] 或 '<>&'          |

------------------------------------------------------------------------


## 事件说明

| 事件名          | 参数                     | 触发时机      | 说明           |
| ------------ | ---------------------- | --------- | ------------ |
| change       | value                  | 值变化时      | v-model 绑定事件 |
| update:value | value                  | 值变化时      | 同步更新 value   |
| on-change    | value                  | 值变化后      | 兼容旧版本事件      |
| on-focus     | value                  | 获取焦点      | 聚焦时触发        |
| on-blur      | value                  | 失去焦点      | 失焦时触发        |
| on-enter     | value                  | 按下回车      | 输入框回车        |
| on-search    | value                  | 点击搜索      | search 模式触发  |
| on-clear     | -                      | 点击清除按钮    | 清空输入框        |
| on-keyup     | (event, value)         | 键盘抬起      | 原生键盘事件       |
| on-keydown   | (event, value)         | 键盘按下      | 原生键盘事件       |
| clickIcon    | -                      | 点击右侧图标    | icon 被点击     |
| change-label | (value, {text, value}) | value 变化时 | 用于 TsForm 同步 |

### 组件实例方法（ref 调用）

通过 this.$refs.xxx.xxx() 调用
| 方法名                        | 参数    | 说明      |
| -------------------------- | ----- | ------- |
| focus()                    | -     | 手动聚焦输入框 |
| handleToggleShowPassword() | -     | 切换密码显示  |
| valid(value?)              | value | 手动触发校验  |

#### 示例
```vue
<TsFormInput ref="inputRef" v-model="value" />
```

```js
this.$refs.inputRef.focus()
this.$refs.inputRef.valid()
```
### 事件总结
- change = v-model 核心事件，值变化时触发，可用于双向绑定
- on-change = 业务监听事件，值变化时触发，可用于自定义业务逻辑
- props.onChange = 兼容写法，与 on-change 功能相同
- valid() 可手动触发校验，返回校验结果
- 所有值默认自动 trim（字符串）

>  插槽(slot)

 名称|slot-scope|用途|说明
:---:|:---:|:---:|:---
validMessage|无|普通的校验和属性errorMessage不能满足需求是，可以使用插槽|-

#### 入参

```javascript
config:{
  type:'text,
  disabled:false,
  value:'',
  size:'default',   
  maxlength:50,
  placeholder:'请输入',
  onChange:function(vale){},
  onBlur:function(vale){},
  width:'75%',
  readonly:true,
  showPassword:true,
  validateList:[],
  autosize:true,
  border:'bottom',
  className:'',
  desc:'文本框描述',
  clearable:false,
  readonlyClass:'',
  errorMessage:'请输入正确数据',
  prepend:'http',
  append:'$',
  suffix:'tsfont-search'
}
```
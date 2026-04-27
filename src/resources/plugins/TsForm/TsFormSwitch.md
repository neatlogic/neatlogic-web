# TsFormSwitch 组件说明文档

## 组件简介

`TsFormSwitch` 是一个基于 `i-switch` 封装的开关组件，支持：

- 双向绑定（v-model）
- 自定义 true / false 对应值
- 切换前校验（支持 Promise）
- 自定义切换文案
- 只读模式
- 状态文本展示
- 描述信息提示

适用于表单中布尔值或状态类字段控制场景。

---

## 基础用法

```javascript
<TsFormSwitch v-model="value" v-bind="config"></TsFormSwitch>
```

## Props 参数说明
| 参数           | 类型                        | 默认值   | 必填 | 说明                  |
| ------------ | ------------------------- | ----- | -- | ------------------- |
| name         | String                    | -     | 否  | 表单字段名称              |
| value        | String / Number / Boolean | false | 否  | 当前值（支持 v-model）     |
| trueValue    | String / Number / Boolean | 1     | 否  | 开启时对应的值             |
| falseValue   | String / Number / Boolean | 0     | 否  | 关闭时对应的值             |
| disabled     | Boolean                   | false | 否  | 是否禁用                |
| readonly     | Boolean                   | false | 否  | 是否只读模式              |
| showStatus   | Boolean                   | false | 否  | 是否显示状态文本            |
| trueText     | String                    | 启用    | 否  | 开启状态显示文本            |
| falseText    | String                    | 禁用    | 否  | 关闭状态显示文本            |
| desc         | String                    | -     | 否  | 描述信息                |
| descType     | String                    | -     | 否  | 值为info、success、warning、error时为Alert模式，如果值为空则为普通模式      |
| onChange     | Function                  | -     | 否  | 状态改变时触发             |
| beforeChange | Function                  | -     | 否  | 切换前触发，返回 false 阻止切换 |

## 事件说明
| 事件名          | 说明           | 回调参数 |
| ------------ | ------------ | ---- |
| change       | 值变化时触发       | 当前值  |
| on-change    | 值变化时触发       | 当前值  |
| update:value | v-model 更新事件 | 当前值  |


## 入参

```javascript
config:{
  value:0,
  falseValue:0,
  trueValue:1,
  disabled:false,
  showStatus:false,
  trueText:"已激活",
  falseText:"已禁用",
  desc:"",
  descType:[],
  onChange:()=>{ },
  beforeChange:()=>{ },
}
```

### 注意事项
- trueValue 与 falseValue 类型必须与 value 类型一致，否则可能匹配失败。
- beforeChange 若为异步逻辑，请确保返回 Promise。
- readonly 模式下不会渲染开关组件，只显示状态文本。

### 兼容性说明
- `beforeChange` 现在同时兼容同步布尔值和异步 Promise；返回 `false` 或 Promise reject 时都会阻止切换。
- 组件内部方法已统一为 `toggle()`，同时保留 `toogle()` 作为兼容别名，不影响旧调用方。
- 状态文本点击时增加了 `ref` 安全访问，开关节点尚未就绪时不会再抛错。

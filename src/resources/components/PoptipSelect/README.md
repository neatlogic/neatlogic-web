# PoptipSelect 组件使用说明

## 组件简介

PoptipSelect 是一个基于 Poptip 的下拉选择组件，支持图标显示、描述信息、清除功能、必填验证等特性，适用于需要展示详细信息的场景。

## 基础用法

```vue
<template>
  <PoptipSelect
    v-model="selectedValue"
    :list="optionList"
    valueName="value"
    textName="text"
    placeholder="请选择"
  />
</template>

<script>
export default {
  data() {
    return {
      selectedValue: '',
      optionList: [
        { value: 'option1', text: '选项一', description: '这是选项一的描述信息' },
        { value: 'option2', text: '选项二', description: '这是选项二的描述信息' },
        { value: 'option3', text: '选项三', description: '这是选项三的描述信息' }
      ]
    }
  }
}
</script>
```

## Props 参数

| 参数 | 说明 | 类型 | 默认值 | 可选值 |
|------|------|------|--------|--------|
| list | 选项列表数据 | Array | [] | - |
| value | 绑定值（v-model） | String | '' | - |
| disabled | 是否禁用 | Boolean | false | - |
| trigger | 触发方式 | String | 'click' | 'click', 'hover', 'focus' |
| width | 组件宽度 | String/Number | '100%' | 数值或百分比字符串 |
| popLable | 弹出框标签最小宽度 | Number | 90 | - |
| valueName | 选项对象中作为值的字段名 | String | 'value' | - |
| textName | 选项对象中作为显示文本的字段名 | String | 'text' | - |
| descriptionName | 选项对象中作为描述信息的字段名 | String | 'description' | - |
| isIcon | 是否显示图标 | Boolean | false | - |
| isRequired | 是否必填 | Boolean | false | - |
| clearable | 是否可清除 | Boolean | false | - |
| placeholder | 占位文本 | String | '请选择' | - |
| errorMessage | 验证失败时的错误提示 | String | '请选择' | - |
| placement | 弹出框位置 | String | 'bottom-start' | 'top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end', 'right', 'right-start', 'right-end' |
| popWidth | 弹出框宽度 | Number | 400 | - |

## Events 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 值改变时触发 | 当前选中的值 |
| on-keydown | 键盘事件触发 | (event, value) |

## 兼容说明

- `on-keydown` 事件名称沿用历史实现，当前版本继续保留，不做删除。
- 清空时仍只触发 `change`；本次仅清除非必填场景下的残留错误提示，不改变必填即时校验时机。
- `list` 非数组和 `.type-select` DOM 未就绪时已补充保护，避免直接报错。

## Methods 方法

| 方法名 | 说明 | 参数 |
|--------|------|------|
| valid | 验证组件值是否有效 | - |
| clearValue | 清除选中值 | - |

## Slots 插槽

| 插槽名 | 说明 |
|--------|------|
| validMessage | 自定义验证错误信息 |

## 使用示例

### 示例1：基础用法

```vue
<template>
  <PoptipSelect
    v-model="value1"
    :list="basicList"
    placeholder="请选择类型"
  />
</template>

<script>
export default {
  data() {
    return {
      value1: '',
      basicList: [
        { value: 'type1', text: '类型一', description: '类型一的详细说明' },
        { value: 'type2', text: '类型二', description: '类型二的详细说明' }
      ]
    }
  }
}
</script>
```

### 示例2：带图标显示

```vue
<template>
  <PoptipSelect
    v-model="value2"
    :list="iconList"
    :is-icon="true"
    placeholder="请选择字段类型"
  />
</template>

<script>
export default {
  data() {
    return {
      value2: '',
      iconList: [
        { value: 'text', text: '文本', description: '单行文本输入框' },
        { value: 'password', text: '密码', description: '密码输入框' },
        { value: 'date', text: '日期', description: '日期选择器' },
        { value: 'select', text: '下拉单选', description: '单选下拉框' }
      ]
    }
  }
}
</script>
```

### 示例3：可清除和必填验证

```vue
<template>
  <div>
    <PoptipSelect
      v-model="value3"
      :list="requiredList"
      :clearable="true"
      :is-required="true"
      error-message="此项为必填项"
      placeholder="请选择（必填）"
    />
    <button @click="validateForm">验证</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      value3: '',
      requiredList: [
        { value: 'opt1', text: '选项一', description: '描述信息' },
        { value: 'opt2', text: '选项二', description: '描述信息' }
      ]
    }
  },
  methods: {
    validateForm() {
      const isValid = this.$refs.poptipSelect.valid();
      if (!isValid) {
        console.log('验证失败');
      }
    }
  }
}
</script>
```

### 示例4：自定义宽度和位置

```vue
<template>
  <PoptipSelect
    v-model="value4"
    :list="customList"
    width="300px"
    :pop-width="500"
    placement="top-start"
    placeholder="请选择"
  />
</template>

<script>
export default {
  data() {
    return {
      value4: '',
      customList: [
        { value: 'a', text: '选项A', description: '长描述信息测试' },
        { value: 'b', text: '选项B', description: '长描述信息测试' }
      ]
    }
  }
}
</script>
```

### 示例5：禁用状态

```vue
<template>
  <PoptipSelect
    v-model="value5"
    :list="disabledList"
    :disabled="true"
    placeholder="禁用状态"
  />
</template>

<script>
export default {
  data() {
    return {
      value5: 'opt1',
      disabledList: [
        { value: 'opt1', text: '选项一', description: '描述信息' },
        { value: 'opt2', text: '选项二', description: '描述信息' }
      ]
    }
  }
}
</script>
```

### 示例6：自定义字段名

```vue
<template>
  <PoptipSelect
    v-model="value6"
    :list="customFieldList"
    value-name="id"
    text-name="name"
    placeholder="请选择"
  />
</template>

<script>
export default {
  data() {
    return {
      value6: '',
      customFieldList: [
        { id: 1, name: '项目一', description: '项目一的描述' },
        { id: 2, name: '项目二', description: '项目二的描述' }
      ]
    }
  }
}
</script>
```

## 图标类型配置

当 `isIcon` 为 `true` 时，组件支持以下图标类型：

| 值 | 图标 | 说明 |
|----|------|------|
| text | tsfont-forminput | 文本输入 |
| password | tsfont-lock | 密码 |
| file | tsfont-wenjian | 文件 |
| date | tsfont-calendar | 日期 |
| datetime | tsfont-riqishijian | 日期时间 |
| json | tsfont-json | JSON |
| select | tsfont-formselect | 下拉单选 |
| multiselect | tsfont-formselectcascader | 下拉多选 |
| time | tsfont-formtime | 时间 |
| radio | tsfont-circle-o | 单选 |
| checkbox | tsfont-check-square | 复选 |
| node | tsfont-blocks | 节点 |
| account | tsfont-userinfo | 账号 |
| textarea | tsfont-formtextarea | 文本域 |
| phase | tsfont-stage | 阶段 |
| switch | tsfont-canvas | 开关 |
| userselect | tsfont-group | 用户选择 |

## 注意事项

1. 组件使用 `v-model` 进行双向绑定
2. 选项列表必须包含 `value` 和 `text` 字段（或通过 `valueName` 和 `textName` 自定义）
3. 当 `isIcon` 为 `true` 时，选项的 `value` 值需要在图标配置中才能正确显示图标
4. 验证方法 `valid()` 需要在父组件中手动调用
5. 弹出框最大高度为 330px，超出部分可滚动

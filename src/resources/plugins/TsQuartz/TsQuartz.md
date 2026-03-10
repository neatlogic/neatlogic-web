# TsQuartz 组件使用说明

## 1. 组件介绍

TsQuartz 是一个基于 Vue 的 Cron 表达式生成器组件，用于可视化配置定时任务的执行时间。该组件提供了友好的用户界面，支持多种时间维度的配置，包括秒、分钟、小时、日、月、星期和年。

## 2. 目录结构

```
TsQuartz/
├── TsQuartz.vue      # 主组件文件
├── quartz-setting.js # 配置文件
└── quartz.less       # 样式文件
```

## 3. 组件参数

| 参数名 | 类型 | 默认值 | 说明 |
|-------|------|-------|------|
| value | String | - | Cron 表达式字符串，支持双向绑定 |
| showType | String | 'edit' | 显示类型，可选值：'edit'（编辑模式）或 'read'（只读模式） |
| transfer | Boolean | true | 是否使用 transfer 属性，控制弹出层是否跟随元素滚动 |
| config | Object | - | 配置对象 |
| desc | String | - | 描述文本，显示在组件下方 |
| descType | String | - | 描述文本类型，可选值：'info'（信息）或 'warning'（警告）、'error'（错误） |
| onChange | Function | - | 改变时触发的回调函数 |

## 4. 组件使用方法

### 4.1 导入组件

```javascript

export default {
  components: {
    TsQuartz: () => import('@/resources/plugins/TsQuartz/TsQuartz.vue')
  }
}
```

### 4.2 基本使用

```vue
<template>
  <div>
    <TsQuartz v-model="cronExpression"></TsQuartz>
  </div>
</template>

<script>

export default {
  components: {
    TsQuartz: () => import('@/resources/plugins/TsQuartz/TsQuartz.vue')
  },
  data() {
    return {
      cronExpression: '0 0 12 * * ?' // 每天中午12点执行
    };
  }
}
</script>
```

### 4.3 带描述的使用

```vue
<template>
  <div>
    <TsQuartz 
      v-model="cronExpression" 
      desc="请设置定时任务执行时间"
    ></TsQuartz>
  </div>
</template>
```

### 4.4 只读模式

```vue
<template>
  <div>
    <TsQuartz 
      v-model="cronExpression" 
      showType="read"
    ></TsQuartz>
  </div>
</template>
```

### 4.5 带回调函数

```vue
<template>
  <div>
    <TsQuartz 
      v-model="cronExpression" 
      :onChange="handleCronChange"
    ></TsQuartz>
  </div>
</template>

<script>
export default {
  // ...
  methods: {
    handleCronChange(cron) {
      console.log('Cron表达式已变更:', cron);
      // 其他处理逻辑
    }
  }
}
</script>
```

## 5. 支持的时间类型

组件支持以下时间类型的配置：

| 时间类型 | 说明 | 可选值 |
|---------|------|-------|
| second | 秒 | 0, 10, 20, 30, 40, 50 |
| minute | 分钟 | 0-59 |
| hour | 小时 | 0-23 |
| dayofmonth | 日 | 1-31 |
| month | 月 | JAN, FEB, MAR, APR, MAY, JUN, JUL, AUG, SEP, OCT, NOV, DEC |
| dayofweek | 星期 | SUN, MON, TUE, WED, THU, FRI, SAT |
| year | 年 | *（默认） |

## 6. 界面操作说明

1. **编辑模式**：
   - 点击时间类型下拉框选择不同的时间维度（如分钟、小时、日等）
   - 点击具体的时间值进行选择，支持多选
   - 秒默认固定为0，不可修改
   - 日和星期不能同时设置，会自动互相排除

2. **只读模式**：
   - 仅显示当前的 Cron 表达式，不可编辑

## 7. 国际化支持

组件使用了 `$t` 函数进行国际化处理，支持多语言显示。相关的国际化键值包括：

- page.second: 秒
- page.minute: 分钟
- page.hour: 小时
- page.day: 日
- page.week: 星期
- page.month: 月
- page.year: 年
- page.january: 一月
- page.february: 二月
- page.march: 三月
- page.april: 四月
- page.may: 五月
- page.june: 六月
- page.july: 七月
- page.august: 八月
- page.september: 九月
- page.october: 十月
- page.november: 十一月
- page.december: 十二月
- page.sunday: 星期日
- page.monday: 星期一
- page.tuesday: 星期二
- page.wednesday: 星期三
- page.thursday: 星期四
- page.firday: 星期五
- page.saturday: 星期六
- page.allofthem: 所有
- page.notdefine: 未定义
- page.every: 每

## 8. 主题支持

组件支持浅色和深色两种主题，通过 HTML 元素的 `theme-dark` 类来切换。

## 9. 常见问题

### 9.1 日和星期为什么不能同时设置？

在 Cron 表达式中，日（dayofmonth）和星期（dayofweek）是互斥的，不能同时指定具体值。当设置其中一个时，另一个会自动设置为 `?`。

### 9.2 秒为什么固定为0？

为了简化配置，组件默认将秒固定为0，适用于大多数定时任务场景。

### 9.3 如何生成特定的 Cron 表达式？

- 每天中午12点：`0 0 12 * * ?`
- 每天凌晨1点：`0 0 1 * * ?`
- 每周一早上8点：`0 0 8 ? * MON`
- 每月1号中午12点：`0 0 12 1 * ?`

## 10. 示例

### 示例1：每天早上9点执行

```vue
<template>
  <div>
    <TsQuartz v-model="cronExpression"></TsQuartz>
  </div>
</template>

<script>
export default {
  components: {
    TsQuartz
  },
  data() {
    return {
      cronExpression: '0 0 9 * * ?'
    };
  }
}
</script>
```

### 示例2：每周一、三、五下午3点30分执行

```vue
<template>
  <div>
    <TsQuartz v-model="cronExpression" />
  </div>
</template>

<script>
export default {
  components: {
    TsQuartz
  },
  data() {
    return {
      cronExpression: '0 30 15 ? * MON,WED,FRI'
    };
  }
}
</script>
```

## 11. 注意事项

1. 组件依赖于 Vue 和相关样式文件，使用前请确保环境正确配置
2. 组件支持的 Cron 表达式格式为标准的 Quartz Cron 格式
3. 当修改时间配置时，组件会自动生成对应的 Cron 表达式并通过 v-model 绑定或 onChange 回调返回
4. 组件会自动处理日和星期的互斥关系，确保生成的 Cron 表达式有效
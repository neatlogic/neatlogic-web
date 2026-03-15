# TsAvatar 组件使用说明

## 组件简介

TsAvatar 是一个头像展示组件，用于显示用户、角色、分组等不同类型的头像。它支持自定义头像路径、大小、形状，并能显示用户状态（激活/禁用/删除）和VIP等级。

## 组件结构

- `TsAvatar.vue` - 主组件，负责头像的展示逻辑
- `user-status.vue` - 用户状态图标组件（显示禁用、删除、VIP等级等状态）

## 安装与引入

### 局部引入

```javascript
export default {
  components: {
    TsAvatar: () => import('@/resources/components/TsAvatar/TsAvatar.vue')
  }
};
```

## 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|-------|------|-------|------|
| initType | String | 'user' | 头像类型，可选值：'user'（用户）、'role'（角色）、'team'（分组） |
| vipLevel | Number | 0 | VIP等级 |
| avatar | String | - | 头像路径 |
| shape | String | 'circle' | 头像形状，可选值：'circle'（圆形）、'square'（方形） |
| size | [String, Number] | 32 | 头像大小，可选值：'large'（40px）、'default'（32px）、'small'（24px）或具体数值 |
| pinyin | String | - | 拼音 |
| name | String | - | 名称 |
| userName | String | - | 用户名 |
| isActive | Number | - | 用户是激活还是禁用，1表示激活，0表示禁用 |
| isDelete | Number | - | 是否被删除，1表示被删除，0表示没有被删除 |

## 组件事件

| 事件名 | 说明 | 回调参数 |
|-------|------|--------|
| on-error | 头像加载失败时触发 | error |

## 基本使用示例

### 1. 基本用户头像

```vue
<template>
  <TsAvatar
    :name="userName"
    :avatar="userAvatar"
    size="default"
  ></TsAvatar>
</template>

<script>
export default {
  data() {
    return {
      userName: '张三',
      userAvatar: 'https://example.com/avatar.jpg'
    };
  }
};
</script>
```

### 2. 角色头像

```vue
<template>
  <TsAvatar
    initType="role"
    :name="roleName"
    size="small"
  ></TsAvatar>
</template>

<script>
export default {
  data() {
    return {
      roleName: '管理员'
    };
  }
};
</script>
```

### 3. 分组头像

```vue
<template>
  <TsAvatar
    initType="team"
    :name="teamName"
    size="large"
  ></TsAvatar>
</template>

<script>
export default {
  data() {
    return {
      teamName: '研发分组'
    };
  }
};
</script>
```

### 4. 带状态的用户头像

```vue
<template>
  <TsAvatar
    :name="userName"
    :avatar="userAvatar"
    :vipLevel="3"
    :isActive="1"
    :isDelete="0"
    shape="square"
    size="40"
    @on-error="handleError"
  ></TsAvatar>
</template>

<script>
export default {
  data() {
    return {
      userName: '李四',
      userAvatar: 'https://example.com/avatar2.jpg'
    };
  },
  methods: {
    handleError(error) {
      console.log('头像加载失败:', error);
    }
  }
};
</script>
```

## 注意事项

1. 当 `initType` 为 'role' 或 'team' 时，会使用默认的角色或分组图标，即使提供了 `avatar` 属性也会被忽略。
2. 当 `initType` 为 'user' 且没有提供 `name` 或 `userName` 时，会使用默认的用户图标。
3. 当 `initType` 不是 'role'、'team' 或 'user' 时，会使用默认的流程图标。
4. 当提供了 `name` 或 `userName` 但没有提供 `avatar` 时，会显示名称的首字符作为头像。
5. 当 `size` 为字符串时，会根据预设值（'large'、'default'、'small'）设置对应的大小。
6. 当 `size` 为数字时，会直接使用该数字作为头像大小（单位：px）。
7. 组件会根据 `isActive` 和 `isDelete` 属性显示不同的状态图标。

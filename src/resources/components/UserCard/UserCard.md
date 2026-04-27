# UserCard 组件使用说明

## 组件简介

UserCard 是一个用户信息展示组件，用于显示用户头像、名称及详细信息。它支持用户、分组和角色三种类型的展示，并提供了丰富的配置选项。

## 组件结构

- `UserCard.vue` - 主组件，负责整体布局和逻辑
- `UserInfo.vue` - 用户详细信息展示组件
- `user-status.vue` - 用户状态图标组件（显示禁用、删除、VIP等级等状态）
- `GroupCard.vue` - 群组卡片组件
- `UserCard.js` - 组件导出和注册文件

## 安装与引入

```javascript

export default {
  components: {
    UserCard: () => import('@/resources/components/UserCard/UserCard.vue'),
  }
};
```

## UserCard 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|-------|------|-------|------|
| trigger | String | 'click' | 用户信息卡片显示的触发方式，可选值：'click'、'hover'、'none'（不触发） |
| initType | String | 'user' | 初始化类型，可选值：'user'（用户）、'team'（分组）、'role'（角色）、'common'（通用） |
| initViaNet | Boolean | false | 是否通过后台接口初始化头像和用户名，需传入userUuid |
| avatar | String | - | 头像URL |
| hideAvatar | Boolean | false | 是否隐藏头像 |
| isInterface | Boolean | true | 是否调用基础数据接口请求 (user/cache/get)，工单中心的列表用户是不调用接口的 |
| vipLevel | Number | - | VIP等级 |
| uuid | String | - | 用户/分组/角色的UUID |
| name | String | - | 名称 |
| pinyin | String | - | 拼音 |
| placement | String | - | 自定义提示位置 |
| iconSize | Number | 24 | 头像大小 |
| hideName | Boolean | false | 是否隐藏名称 |
| nameLength | [Boolean, Number] | false | 展示多少个字符：false默认不限制；true展示4个字符；number自定义 |
| alignMode | String | 'horizontal' | 头像和名称的对齐方式，可选值：'horizontal'（水平对齐）、'vertical'（垂直对齐） |
| isActive | Number | - | 用户是激活还是禁用，1表示激活，0表示禁用 |
| isDelete | Number | - | 是否被删除，1表示被删除，0表示没有被删除 |
| hideStatusIcon | Boolean | false | 是否隐藏用户右上角状态图标【禁用/删除/钻石(VIP等级)】 |

## UserCard 组件事件

| 事件名 | 说明 | 回调参数 |
|-------|------|--------|
| showPop | 当用户信息弹窗显示或隐藏时触发 | true/false |

## 基本使用示例

### 1. 基本用户展示

```vue
<template>
  <UserCard
    :uuid="userUuid"
    :name="userName"
    :avatar="userAvatar"
    trigger="hover"
  ></UserCard>
</template>

<script>
export default {
  data() {
    return {
      userUuid: '123456',
      userName: '张三',
      userAvatar: 'https://example.com/avatar.jpg'
    };
  }
};
</script>
```

### 2. 分组展示

```vue
<template>
  <UserCard
    initType="team"
    :uuid="teamUuid"
    :name="teamName"
    trigger="click"
  ></UserCard>
</template>

<script>
export default {
  data() {
    return {
      teamUuid: 'team123',
      teamName: '研发分组'
    };
  }
};
</script>
```

### 3. 角色展示

```vue
<template>
  <UserCard
    initType="role"
    :uuid="roleUuid"
    :name="roleName"
    trigger="hover"
  ></UserCard>
</template>

<script>
export default {
  data() {
    return {
      roleUuid: 'role123',
      roleName: '管理员'
    };
  }
};
</script>
```

### 4. 自定义配置

```vue
<template>
  <UserCard
    :uuid="userUuid"
    :name="userName"
    :avatar="userAvatar"
    :iconSize="32"
    :nameLength="8"
    alignMode="vertical"
    :hideStatusIcon="false"
    trigger="click"
    @showPop="handleShowPop"
  ></UserCard>
</template>

<script>
export default {
  data() {
    return {
      userUuid: '123456',
      userName: '张三',
      userAvatar: 'https://example.com/avatar.jpg'
    };
  },
  methods: {
    handleShowPop(show) {
      console.log('用户信息弹窗状态:', show);
    }
  }
};
</script>
```


## 注意事项

1. 当 `initType` 为 'user'、'team' 或 'role' 时，需要传入对应的 `uuid` 属性。
2. 当 `isInterface` 为 true 时，组件会自动调用接口获取用户信息，无需手动传入 `name`、`avatar` 等属性。
3. 当 `trigger` 为 'none' 时，不会显示用户信息弹窗。
4. 组件支持国际化，使用 `$t()` 方法获取翻译文本。
5. 组件会根据 `isActive` 和 `isDelete` 属性显示不同的状态图标。

## 兼容性说明

1. `showPop` 事件时机保持不变，这次只补了请求取消、请求序号和定时器清理，不改原有交互入口。
2. `team`、`role` 成员列表现在按 `uuid` 维度缓存，切换到新的 `uuid` 时会重置旧列表，避免串数据；同一个 `uuid` 再次打开仍可复用当前列表。
3. `user-status` 在父组件头像节点不存在时会回退到默认尺寸，不会因为 `getComputedStyle(undefined)` 报错。

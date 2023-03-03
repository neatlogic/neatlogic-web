<template>
  <div class="focususer-handler">
    <span class="tip-title">{{ config.typeName }}</span>
    <template v-if="config.changeType === 'new'">
      <span class="text-grey change-text">新增</span>
      <UserCard
        v-for="newUser in newUserList"
        :key="newUser.value"
        class="usercard"
        v-bind="newUser"
        hideAvatar
      />
    </template>
    <template v-else-if="config.changeType === 'clear'">
      <span class="text-grey change-text">移除</span>
      <UserCard
        v-for="oldUser in oldUserList"
        :key="oldUser.value"
        class="usercard"
        v-bind="oldUser"
        hideAvatar
      />
    </template>
    <template v-else-if="config.changeType === 'update'">
      <span>
        <UserCard
          v-for="oldUser in oldUserList"
          :key="oldUser.value"
          class="usercard"
          v-bind="oldUser"
          hideAvatar
        />
      </span>
      <span class="text-grey change-text">改为</span>
      <span>
        <UserCard
          v-for="newUser in newUserList"
          :key="newUser.value"
          class="usercard"
          v-bind="newUser"
          hideAvatar
        />
      </span>
    </template>
  </div>
</template>

<script>
export default {
  name: 'FocususerHandler',
  components: {
    UserCard: resolve => require(['@/resources/components/UserCard/UserCard.vue'], resolve)
  },
  props: {
    config: Object
  },
  data() {
    return {
      oldUserList: [],
      newUserList: []
    };
  },
  mounted() {
    if (this.config.oldContent) {
      this.oldUserList = JSON.parse(this.config.oldContent);
    }
    if (this.config.newContent) {
      this.newUserList = JSON.parse(this.config.newContent);
    }
  }
};
</script>

<style lang="less" scoped>
.tip-title {
  vertical-align: bottom;
}
.change-text {
  vertical-align: bottom;
}
.usercard {
  &:not(:last-of-type) {
    padding-right: 8px;
  }
}
</style>

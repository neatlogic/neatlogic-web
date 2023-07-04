<template>
  <!-- <img
    v-if="isDelete == 1"
    :style="vipIconStyle"
    src="~@/resources/assets/images/avatar/delete.svg"
    class="vip-icon"
    :title="$t('page.userdelete')"
  />
  <img
    v-else-if="isActive == 0"
    src="~@/resources/assets/images/avatar/forbid.svg"
    :style="vipIconStyle"
    class="vip-icon"
    :title="$t('page.userdisabled')"
  /> -->
  <img
    v-if="vipIcon"
    :src="vipIcon"
    :style="vipIconStyle"
    class="vip-icon"
  />
</template>
<script>
export default {
  props: {
    isActive: {
      type: Number // 用户是激活还是禁用，1表示激活，0表示禁用
    },
    isDelete: {
      type: Number // 是否被删除，1表示被删除，0表示没有被删除
    },
    vipLevel: {
      //VIP等级
      type: Number 
    },
    size: {
      //头像大小
      type: [String, Number], 
      default: 32 
    },
    hideAvatar: {
      // 是否是隐藏头像
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      avatarSize: 0
    };
  },
  mounted() {
    if (!this.size) {
      this.avatarSize = +getComputedStyle(this.$parent && this.$parent.$refs.avatar && this.$parent.$refs.avatar.$el).width.slice(0, -2);
    } else if (isNaN(this.size)) {
      this.avatarSize = { large: 40, defautl: 32, small: 24 }[this.size];
    } else {
      this.avatarSize = +this.size;
    }
  },
  computed: {
    vipIcon() {
      return this.$store && this.$store.getters.getVipIconByLevel(this.vipLevel, true);
    },
    vipIconStyle() {
      return {
        width: `${this.avatarSize * 0.44}px`,
        top: `-${this.hideAvatar ? 4.5 : this.avatarSize / 18}px`,
        right: `-${this.hideAvatar ? 6 : this.avatarSize / 20}px`
      };
    }
  }
};
</script>

<style lang="less" scoped>
  .vip-icon {
    display: inline-block;
    position: absolute;
    z-index: 1;
  }
</style>

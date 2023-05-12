<template>
  <span class="ts-avatar">
    <Avatar
      v-if="avatarSrc"
      ref="avatar"
      :shape="shape"
      :size="size"
      :src="avatarSrc"
      @on-error="handleError"
    ></Avatar>
    <span v-else class="ivu-avatar" :style="sizeClass">
      <span class="text-info" style="text-transform: lowercase">{{ namePinyin }}</span>
    </span>
    <img
      v-if="vipIcon"
      :src="vipIcon"
      :style="vipIconStyle"
      class="vip-icon"
    />
  </span>
</template>

<script>
export default {
  name: 'TsAvatar',
  props: {
    initType: { type: String, default: 'user' }, //头像的类型,user, role, team
    vipLevel: { type: Number, default: 0 },
    avatar: { type: String }, //头像路径
    shape: { type: String, default: 'circle' }, //头像形状，circle、square
    size: { type: [String, Number], default: 32 }, //头像大小
    pinyin: { type: String },
    name: { type: String }
  },
  data() {
    return {
      avatarSize: 0
    };
  },
  mounted() {
    if (!this.size) {
      this.avatarSize = +getComputedStyle(this.$refs.avatar.$el).width.slice(0, -2);
    } else if (isNaN(this.size)) {
      this.avatarSize = { large: 40, defautl: 32, small: 24 }[this.size];
    } else {
      this.avatarSize = +this.size;
    }
  },
  methods: {
    handleError(error) {
      this.$emit('on-error', error);
    }
  },
  computed: {
    avatarSrc() {
      if (this.avatar === null) return null;
      if (this.avatar && this.avatar.indexOf('api') > -1) return this.avatar.indexOf(BASEURLPREFIX + '/') != 0 ? BASEURLPREFIX + '/' + this.avatar : this.avatar;
      if (this.initType === 'role') return require('@/resources/assets/images/avatar/role.png');
      if (this.initType === 'team') return require('@/resources/assets/images/avatar/team.png');
      if (this.initType === 'processUserType') return require('@/resources/assets/images/avatar/process.png');
      if (this.initType === 'user' && !this.namePinyin) return require('@/resources/assets/images/avatar/user.png');
      else return null;
    },
    vipIcon() {
      return this.$store && this.$store.getters.getVipIconByLevel(this.vipLevel, true);
    },
    vipIconStyle() {
      return {
        width: `${this.avatarSize * 0.44}px`,
        bottom: `-${this.avatarSize / 18}px`,
        right: `-${this.avatarSize / 20}px`
      };
    },
    namePinyin() {
      // console.log(this.pinyin, '-----', this.name);
      let newName = '';
      let re = /^[\u4E00-\u9FA5]+$/;
      let name = this.name;
      if (name) {
        newName = name.slice(0, 1);//判断中文，如果是的话，就显示第一个文字
        if (!re.test(newName)) { // 不是，就显示前面两个字符
          newName = name.slice(0, 2);
        } 
      }
      return newName;
      // return this.pinyin && this.pinyin.slice(0, 2);
    },
    sizeClass: function() {
      let _this = this;
      return {
        'width': `${_this.avatarSize}px`,
        'height': `${_this.avatarSize}px`,
        'line-height': `${_this.avatarSize}px`,
        'font-size': `${_this.avatarSize / 2}px`
      };
    }
  }
};
</script>

<style lang="less" scoped>
.ts-avatar {
  position: relative;
  display: inline-block;
  .vip-icon {
    display: inline-block;
    position: absolute;
    z-index: 3;
  }
}
</style>

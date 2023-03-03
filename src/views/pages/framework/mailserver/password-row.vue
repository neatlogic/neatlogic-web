<template>
  <div class="password-view">
    <div class="item" :class="!isShow ? 'hide-pwd' : ''">
      <div class="text">{{ value }}</div>
      <i :class="isShow ? 'btn-icon tsfont-eye-off' : 'tsfont-eye'" @click="isShow?changestatus():''"></i>
    </div>
    <div v-show="!isShow" class="item hide-item">
      <div class="text">{{ hiddenText }}</div>
      <i class="btn-icon" :class="isShow ? 'tsfont-eye-off' : 'tsfont-eye'" @click="changestatus()"></i>
    </div>
  </div>
</template>

<script>
export default {
  name: '',
  components: {},
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isShow: false
    };
  },

  beforeCreate() {},

  created() {},

  beforeMount() {},

  mounted() {},

  beforeUpdate() {},

  updated() {},

  activated() {},

  deactivated() {},

  beforeDestroy() {},

  destroyed() {},

  methods: {
    changestatus() {
      this.isShow = !this.isShow;
    }
  },

  filter: {},

  computed: {
    hiddenText() {
      const arr = new Array(this.value.length);
      arr.fill('*');
      return arr.join('');
    }
  },

  watch: {}
};
</script>
<style lang='less' scoped>
.password-view {
  position: relative;
  .item {
    display: flex;
    align-items: center;
    &.hide-pwd {
      opacity: 0;
      z-index: -1;
      position: relative;
    }
    .text {
      padding-right: 10px;
    }
    .btn-icon {
      cursor: pointer;
    }
  }

  .hide-item {
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>

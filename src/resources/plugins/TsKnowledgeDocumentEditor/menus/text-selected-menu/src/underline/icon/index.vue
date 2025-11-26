<template>
  <div class="flex-start cursor-pointer" @click.stop="$emit('click')">
    <svg
      :width="fontSize"
      :height="fontSize"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-icon="UnderlineOutlined"
    >
      <path
        d="M7.361 3.052a.99.99 0 0 0-.989-.994.998.998 0 0 0-.999.994v5.765c0 4.205 2.601 7.29 6.627 7.29s6.627-3.085 6.627-7.29V3.052a.996.996 0 0 0-.996-.994.992.992 0 0 0-.992.994v5.765c0 3.003-1.763 5.302-4.639 5.302-2.876 0-4.639-2.299-4.639-5.302V3.052ZM3.054 19.42a.988.988 0 0 0-.994.988 1 1 0 0 0 .994 1h17.892a1 1 0 0 0 .994-1.002.987.987 0 0 0-.994-.986H3.054Z"
        class="icon-svg"
        :class="activeClassName"
      >
      </path></svg>
  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  props: {
    fontSize: {
      type: String,
      default: '18px'
    },
    activeClassName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {};
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
  methods: {},
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
@import '~@/resources/assets/css/variable.less';
.theme(@text-color, @primary-color) {
  .icon-svg {
    fill: @text-color
  }
  .active {
    fill: @primary-color
  }
}
html {
  .theme(@default-text, @default-primary-color);

  &.theme-dark {
    .theme(@dark-text, @dark-primary-color);
  }
}
</style>

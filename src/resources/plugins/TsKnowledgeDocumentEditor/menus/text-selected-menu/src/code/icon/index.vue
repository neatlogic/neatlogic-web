<template>
  <div class="flex-start cursor-pointer" @click.stop="$emit('click')">
    <svg
      :width="fontSize"
      :height="fontSize"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-icon="CodeOutlined"
    ><path
      d="M13.31 1.082a1 1 0 0 0-1.115.87L9.758 21.805a1 1 0 0 0 1.985.243l2.437-19.85a1 1 0 0 0-.87-1.115ZM8.207 5.293a1 1 0 0 1 0 1.414L2.414 12.5l5.793 5.793a1 1 0 1 1-1.414 1.414l-6.5-6.5a1 1 0 0 1 0-1.414l6.5-6.5a1 1 0 0 1 1.414 0Zm7.586 0a1 1 0 0 0 0 1.414l5.793 5.793-5.793 5.793a1 1 0 0 0 1.414 1.414l6.5-6.5a1 1 0 0 0 0-1.414l-6.5-6.5a1 1 0 0 0-1.414 0Z"
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

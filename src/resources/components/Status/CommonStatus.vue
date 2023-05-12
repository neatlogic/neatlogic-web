<template>
  <div v-if="statusName && type == 'block'" class="com-status tips">
    <div class="fz10 bg status-text" :class="className(statusValue)" @click="handleClick">{{ statusName }}</div>
  </div>
  <div v-else-if="statusName && type == 'tag'" class="com-status tag-status">
    <div class="fz10 bg status-text" :class="className(statusValue)" @click="handleClick">{{ statusName }}</div>
  </div>
  <span
    v-else-if="statusName && type == 'text'"
    class="com-status "
    :class="'text-' + statusValue"
    @click="handleClick"
  >{{ statusName }}</span>
</template>
<script>
export default {
  name: '',
  components: {},
  filters: {},
  props: {
    border: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'block' //block text tag
    },
    statusValue: {
      type: String,
      default: ''
    },
    statusName: {
      type: [String, Number],
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
  methods: {
    handleClick() {
      this.$emit('click');
    }
  },
  computed: {
    className() {
      return function(name) {
        return 'bg-' + name + ' text-' + name;
      };
    }
  },
  watch: {}
};
</script>
<style lang="less">
@import './status.less';
</style>
<style lang="less" scoped>
.com-status {
  display: inline-block;
  overflow: hidden;
  position: relative;
  text-align: center;
  .status-text {
    border-radius: 20px;
    padding: 2px 6px;
    line-height: 16px;
    min-height: 20px;
    min-width: 20px;
    text-align: center;
  }
  .text {
    line-height: 19px;
  }
  &.tag-status {
    .status-text {
      border-radius: 0;
      font-size: 16px;
      font-weight: 600;
      padding: 8px 14px 8px 16px;
      line-height: 16px;
      border-top-left-radius: 2px;
      border-top-right-radius: 2px;
      border-bottom-left-radius: 16px;
    }
  }
}
</style>

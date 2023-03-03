<template>
  <div :class="classes" :style="style">
    <span v-if="config.content" :style="style" class="divider-inner-text">{{ config.content }}</span>
  </div>
</template>
<script>
import base from '../base.vue';
import validmixin from '../common/validate-mixin.js';

export default {
  name: '',
  components: {},
  extends: base,
  mixins: [validmixin],
  props: {
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
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
  computed: {
    classes() {
      const classes = {};
      if (this.config.content) {
        classes['divider-width-text-' + this.config.contentPosition] = true;
      } else {
        classes['divider'] = true;
      }
      return classes;
    },
    style() {
      const style = {};
      style['--border-width'] = (this.config.dividerWidth || 1) + 'px';
      style['--border-style'] = this.config.dividerType || 'solid';
      if (this.config.dividerColor) {
        style['--border-color'] = this.config.dividerColor;
      }
      return style;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
@import './formdivider.less';
</style>

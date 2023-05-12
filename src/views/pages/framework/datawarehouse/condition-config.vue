<template>
  <div>
    <Component :is="handler+'Config'" ref="component" :config="config"></Component>
  </div>
</template>
<script>
import * as handlers from './conditionconfigs/index.js';

export default {
  name: '',
  components: {
    ...handlers
  },
  props: {
    handler: {type: String},
    config: {type: Object}
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
    valid() {
      const c = this.$refs['component'];
      if (c && c.valid) {
        return c.valid();
      }
      return true;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>

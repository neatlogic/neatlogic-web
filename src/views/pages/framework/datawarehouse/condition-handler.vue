<template>
  <div>
    <Component
      :is="handler+'Handler'"
      :value="value"
      :config="config"
      @change="change"
    ></Component>
  </div>
</template>
<script>
import * as handlers from './conditionhandlers/index.js';

export default {
  name: '',
  components: {
    ...handlers
  },
  props: {
    handler: {type: String},
    config: {type: Object},
    value: {type: [Object, Array, String, Number]}
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
    change(val) {
      this.$emit('change', val);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>

<template>
  <div>
    <component
      :is="config.type + '_config'"
      ref="graphConfig"
      :config="config"
      @setConfig="setConfig"
    ></component>
  </div>
</template>
<script>
import * as handlers from './graphitemconfig/index.js';
export default {
  name: '',
  components: {
    ...handlers
  },
  props: {
    config: {type: Object}
  },
  data() {
    return {
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    setConfig(config) {
      //this.$emit('setConfig', config);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>

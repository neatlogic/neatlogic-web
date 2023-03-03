<template>
  <component :is="type+'_config'" :config="config" @setConfig="setConfig"></component>
</template>
<script>
import * as borders from './index.js';
export default {
  name: '',
  components: {
    ...borders
  },
  props: {
    config: {type: Object},
    type: { type: String }
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
    setConfig(attrName, attrValue) {
      this.$set(this.config, attrName, attrValue);
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>

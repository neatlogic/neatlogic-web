<template>
  <component :is="type+'_border'" :config="config"></component>
</template>
<script>
import * as borders from './index.js';
export default {
  name: '',
  components: {
    ...borders
  },
  props: {
    type: { type: String },
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
  methods: {},
  filter: {},
  computed: {},
  watch: {
  }
};
</script>

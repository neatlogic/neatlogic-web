<template>
  <component
    :is="appName + 'Handler'"
    :projectId="projectId"
    :appId="appId"
  ></component>
</template>
<script>
import * as handlers from './index.js';

export default {
  name: '',
  components: {
    ...handlers
  },
  props: {
    appName: {type: String},
    projectId: {type: Number},
    appId: {type: Number}
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
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>

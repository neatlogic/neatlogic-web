<template>
  <component
    :is="appType.appType + 'Editor'"
    v-if="appType"
    ref="editor"
    :appType="appType"
  ></component>
</template>
<script>
import * as editor from './edit-tab/index.js';

export default {
  name: '',
  components: {
    ...editor
  },
  props: {
    appType: { type: Object }
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
<style lang="less"></style>

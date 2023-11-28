<template>
  <div v-if="appType && editors[appType.appType + 'Editor']">
    <component
      :is="appType.appType + 'Editor'"
      ref="editor"
      :appType="appType"
    ></component>
  </div>
  <div v-else><Alert>{{ $t('term.rdm.noconfig') }}</Alert></div>
</template>
<script>
import * as editor from './edittab/index.js';

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
      editors: editor
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

<template>
  <div v-if="appData && editors[appData.type + 'Editor']">
    <component
      :is="appData.type + 'Editor'"
      ref="editor"
      :appData="appData"
    ></component>
  </div>
  <div v-else><Alert>{{ $t('term.rdm.noconfig') }}</Alert></div>
</template>
<script>
import * as editor from './index.js';

export default {
  name: '',
  components: {
    ...editor
  },
  props: {
    projectId: { type: Number },
    appId: { type: Number }
  },
  data() {
    return {
      editors: editor,
      appData: null
    };
  },
  beforeCreate() {},
  created() {
    this.getAppById();
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
    getAppById() {
      this.$api.rdm.app.getAppById(this.appId).then(res => {
        this.appData = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less"></style>

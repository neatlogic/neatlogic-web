<template>
  <div v-if="appData && editors[appData.type + 'Editor']">
    <component
      :is="appData.type + 'Editor'"
      :key="appData.id"
      ref="editor"
      :appData="appData"
    ></component>
  </div>
  <div v-else class="padding-md"><Alert>{{ $t('term.rdm.noconfig') }}</Alert></div>
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
      appData: null,
      requestSeq: 0
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
  beforeDestroy() { this.requestSeq++; },
  destroyed() {},
  methods: {
    getAppById() {
      // 切换应用时隔离旧响应，并销毁旧应用的配置弹窗。
      const seq = ++this.requestSeq;
      this.appData = null;
      this.$api.rdm.app.getAppById(this.appId).then(res => {
        if (seq === this.requestSeq) this.appData = res.Return;
      });
    }
  },
  filter: {},
  computed: {},
  watch: { appId: 'getAppById' }
};
</script>
<style lang="less"></style>

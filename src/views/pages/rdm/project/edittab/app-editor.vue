<template>
  <div v-if="appEditor">
    <component
      :is="appEditor"
      :key="appData.id"
      ref="editor"
      v-bind="editorProps"
    ></component>
  </div>
  <div v-else class="padding-md"><Alert>{{ $t('term.rdm.noconfig') }}</Alert></div>
</template>
<script>
import * as editor from './index.js';
import ComponentManager from '@/resources/import/component-manager';

export default {
  name: '',
  props: {
    projectId: { type: Number },
    appId: { type: Number }
  },
  data() {
    return {
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
  computed: {
    builtInEditor() {
      return this.appData && editor[this.appData.type + 'Editor'];
    },
    // 只有商业模块已启用且注册了配置组件的应用才使用扩展入口。
    appEditor() {
      if (this.builtInEditor) return this.builtInEditor;
      if (this.appData && COMMERCIAL_MODULES.includes('rdm')) {
        return ComponentManager.getComponent('rdmAppEditor', this.appData.type);
      }
      return null;
    },
    editorProps() {
      if (this.builtInEditor) {
        return { appData: this.appData };
      }
      return { scope: { projectId: this.projectId, appId: this.appData.id } };
    }
  },
  watch: { appId: 'getAppById' }
};
</script>
<style lang="less"></style>

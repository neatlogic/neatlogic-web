<template>
  <div v-if="config && config.isChecked">
    <div class="fz-h1">{{ config.title }}</div>
    <TsSheet
      ref="formSheet"
      mode="read"
      :value="config.formConfig"
      :data="config.formAttributeDataMap"
      :readonly="true"
      class="pl-sm pr-sm"
    ></TsSheet>
  </div>
</template>
<script>
import { createEditorFromDom } from '@/views/pages/process/task/processdetail/workorder/actiondialog/knowledgeutils/index.js';
export default {
  name: '',
  components: {
    TsSheet: () => import('@/resources/plugins/TsSheet/TsSheet.vue')
  },
  filters: {},
  props: {
    config: Object
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
    getData() {
      // 获取转知识的数据
      let list = [];
      let titleConfig = { handler: 'h1', uuid: this.$utils.setUuid(), content: this.config.title };
      let contentConfig = { handler: 'formtable', uuid: this.$utils.setUuid(), content: this.getTableJson() };
      list.push(titleConfig, contentConfig);
      return list;
    },
    getTableJson() {
      // 获取预览DOM节点
      const tableDom = this.$refs?.formSheet.$refs?.tsSheetMainRef?.cloneNode(true);
      if (!tableDom) {
        return; 
      }
      const knowledgeDom = createEditorFromDom(tableDom);
      return knowledgeDom; 
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped></style>

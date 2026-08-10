<template>
  <TsDialog
    :isShow="true"
    width="900px"
    :hasFooter="false"
    :maskClose="true"
    className="workbench-preview-dialog"
    @on-close="$emit('close')"
  >
    <template slot="header">
      <div class="preview-dialog__header">
        <div class="overflow">{{ $t('term.workbench.fullpreviewtitle', { name: workbench.name || $t('term.workbench.workbench') }) }}</div>
      </div>
    </template>
    <div class="preview-dialog__viewport bg-grey">
      <WorkbenchLayoutPreview
        :widgetList="widgetList"
        :presentationMap="presentationMap"
        :labelMap="labelMap"
        mode="detail"
      ></WorkbenchLayoutPreview>
    </div>
  </TsDialog>
</template>

<script>
import WorkbenchLayoutPreview from './workbench-layout-preview.vue';

export default {
  name: 'WorkbenchPreviewDialog',
  components: {
    WorkbenchLayoutPreview
  },
  props: {
    workbench: { type: Object, default: () => ({}) },
    presentationMap: { type: Object, default: () => ({}) },
    labelMap: { type: Object, default: () => ({}) }
  },
  computed: {
    widgetList() {
      return this.workbench && this.workbench.config && Array.isArray(this.workbench.config.widgetList)
        ? this.workbench.config.widgetList
        : [];
    }
  }
};
</script>

<style lang="less" scoped>
.preview-dialog__header {
  min-width: 0;
  padding-right: 40px;
}

.preview-dialog__viewport {
  width: 100%;
  min-height: 360px;
  max-height: min(680px, calc(100vh - 220px));
  padding: 16px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>

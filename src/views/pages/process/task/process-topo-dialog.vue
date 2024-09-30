<template>
  <TsDialog v-bind="dialogConfig" @on-close="close()">
    <template v-slot:header>
      <span class="text-action" @click="openFlow()">{{ title }}</span>
    </template>
    <template v-slot>
      <div class="bg-op radius-md">
        <div style="height: 34px">
          <FlowEditorToolbar
            :graph="graph"
            mode="graph"
            :readonly="true"
          ></FlowEditorToolbar>
        </div>
        <div style="height: calc(100vh - 334px)">
          <FlowEditor
            ref="flowEditor"
            :config="flowConfig"
            :muted="true"
            :readonly="true"
            :grid="false"
            @ready="ready"
          ></FlowEditor>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <Button @click="close()">{{ $t('page.close') }}</Button>
    </template>
  </TsDialog>
</template>
<script>
import FlowUtil from '@/views/pages/process/flow/flow-utils.js';
export default {
  name: '',
  components: {
    FlowEditor: () => import('@/views/pages/process/flow/floweditor/flow-editor.vue'),
    FlowEditorToolbar: () => import('@/views/pages/process/flow/floweditor/flow-editor-toolbar.vue')
  },
  props: {
    channelUuid: { type: String }
  },
  data() {
    return {
      dialogConfig: {
        isShow: true,
        type: 'modal',
        width: 'large'
      },
      graph: null,
      dnd: null,
      flowConfig: {},
      flowData: null,
      isFlowReady: false //流程数据就绪，用于激活finalFlowData重新计算
    };
  },
  beforeCreate() {},
  created() {
    window.addEventListener('resize', this.resize);
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {
    window.removeEventListener('resize', this.resize);
  },
  destroyed() {},
  methods: {
    close() {
      this.$emit('close');
    },
    resize() {
      setTimeout(() => {
        if (this.graph) {
          this.graph.zoomToFit({ maxScale: 1, padding: 10 });
          this.graph.centerContent();
        }
      }, 300);
    },
    async getFlowData() {
      this.isFlowReady = false;
      await this.$api.process.processtask.stepFlowTop({ channelUuid: this.channelUuid }).then(res => {
        this.flowData = res.Return.config;
        this.isFlowReady = true;
      });
    },
    async ready(graph, dnd) {
      await this.getFlowData();
      this.graph = graph;
      this.dnd = dnd;
      this.graph.fromJSON(this.finalFlowData);
      this.$nextTick(() => {
        setTimeout(() => {
          this.graph.zoomToFit({ maxScale: 1, padding: 10 });
          this.graph.centerContent();
        }, 500);
      });
    },
    openFlow() {
      if (this.flowUuid) {
        window.open(HOME + '/process.html#/flow-edit?uuid=' + this.flowUuid, '_blank');
      }
    }
  },
  filter: {},
  computed: {
    finalFlowData() {
      if (this.isFlowReady && this.flowData && this.flowData.topo && this.flowData.topo.nodes) {
        const cells = FlowUtil.transfer(this.flowData);
        return { cells: cells };
      } else if (this.flowData && this.flowData.topo && this.flowData.topo.cells) {
        return this.flowData.topo.cells;
      }
      return [];
    },
    title() {
      if (this.isFlowReady && this.flowData && this.flowData.process && this.flowData.process.processConfig) {
        return this.flowData.process.processConfig.name;
      }
      return '流程图';
    },
    flowUuid() {
      if (this.isFlowReady && this.flowData && this.flowData.process && this.flowData.process.processConfig) {
        return this.flowData.process.processConfig.uuid;
      }
      return '';
    }
  },
  watch: {}
};
</script>
<style lang="less"></style>

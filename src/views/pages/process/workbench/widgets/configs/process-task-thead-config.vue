<template>
  <div class="process-task-thead-config">
    <TsFormItem :label="label" labelPosition="top">
      <div v-if="theadLoading" class="text-tip">正在加载可选表头...</div>
      <div v-else-if="theadError" class="text-danger">
        {{ theadError }}
        <span class="text-action ml-xs" @click="loadTheadList">重试</span>
      </div>
      <div v-else>
        <div v-if="visibleTheadList.length" class="thead-summary mb-xs">
          <Tag v-for="thead in visibleTheadList" :key="thead.name">{{ thead.displayName }}</Tag>
        </div>
        <div v-else class="text-tip mb-xs">尚未选择表头</div>
        <span class="text-action tsfont-setting" @click="openTheadDialog">配置表头</span>
      </div>
    </TsFormItem>

    <TsDialog
      v-if="isShowTheadDialog"
      :isShow.sync="isShowTheadDialog"
      :title="dialogTitle"
      type="modal"
      width="large"
      @on-ok="saveThead"
      @on-close="closeTheadDialog"
    >
      <div class="thead-editor">
        <div class="text-tip mb-md">
          拖拽调整列顺序，取消勾选可隐藏对应列；{{ requiredTheadLabel }}为必选列。
        </div>
        <draggable :list="theadDraftList" :animation="150" handle=".thead-drag-handler">
          <div
            v-for="thead in theadDraftList"
            :key="thead.name"
            class="thead-editor-item border-color radius-sm padding-xs mb-xs"
          >
            <i class="thead-drag-handler tsfont-drag text-grey"></i>
            <Checkbox
              v-model="thead.isShow"
              :true-value="1"
              :false-value="0"
              :disabled="thead.name === requiredTheadName"
            ></Checkbox>
            <span>{{ thead.displayName }}</span>
          </div>
        </draggable>
      </div>
    </TsDialog>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import {
  PROCESS_TASK_THEAD_HANDLER,
  PROCESS_TASK_WIDGET_NAME,
  extractTheadList,
  mergeTheadList,
  serializeTheadList
} from '../utils/process-task-search.js';

export default {
  name: 'ProcessTaskTheadConfig',
  components: {
    draggable,
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem')
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: { type: Array, default: () => [] },
    label: { type: String, default: '表头' },
    dialogTitle: { type: String, default: '配置工单表头' },
    portalWidgetName: { type: String, default: PROCESS_TASK_WIDGET_NAME },
    handler: { type: String, default: PROCESS_TASK_THEAD_HANDLER },
    requiredTheadName: { type: String, default: 'title' },
    requiredTheadLabel: { type: String, default: '工单标题' }
  },
  data() {
    return {
      theadLoading: false,
      theadError: '',
      availableTheadList: [],
      theadList: [],
      theadDraftList: [],
      isShowTheadDialog: false
    };
  },
  created() {
    this.loadTheadList();
  },
  methods: {
    async loadTheadList() {
      this.theadLoading = true;
      this.theadError = '';
      try {
        const res = await this.$api.common.searchWorkbenchWidgetData({
          handler: this.handler,
          portalWidgetName: this.portalWidgetName,
          param: {}
        });
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || '可选表头加载失败');
        }
        this.availableTheadList = extractTheadList(res.Return);
        this.theadList = mergeTheadList(this.availableTheadList, this.value);
        if (!this.value.length) {
          this.$emit('change', serializeTheadList(this.theadList));
        }
      } catch (error) {
        this.availableTheadList = [];
        this.theadList = mergeTheadList(this.value, this.value);
        this.theadError = (error && (error.Message || error.message)) || '可选表头加载失败';
      } finally {
        this.theadLoading = false;
      }
    },
    openTheadDialog() {
      this.theadDraftList = this.$utils.deepClone(this.theadList);
      this.isShowTheadDialog = true;
    },
    closeTheadDialog() {
      this.isShowTheadDialog = false;
      this.theadDraftList = [];
    },
    saveThead() {
      const requiredThead = this.theadDraftList.find(item => item.name === this.requiredTheadName);
      if (requiredThead) {
        requiredThead.isShow = 1;
      }
      if (!this.theadDraftList.some(item => item.isShow !== 0)) {
        this.$Message.warning('请至少选择一个表头');
        return;
      }
      const theadList = serializeTheadList(this.theadDraftList);
      this.theadList = this.$utils.deepClone(theadList);
      this.$emit('change', theadList);
      this.closeTheadDialog();
    }
  },
  computed: {
    visibleTheadList() {
      return this.theadList.filter(item => item.isShow !== 0);
    }
  },
  watch: {
    value: {
      deep: true,
      handler(value) {
        if (this.theadLoading) {
          return;
        }
        const availableList = this.availableTheadList.length ? this.availableTheadList : value;
        this.theadList = mergeTheadList(availableList, value);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.thead-editor {
  max-height: 520px;
  overflow: auto;
}
.thead-editor-item {
  display: flex;
  align-items: center;
  gap: 8px;
  border-width: 1px;
  border-style: solid;
}
.thead-drag-handler {
  cursor: move;
}
</style>

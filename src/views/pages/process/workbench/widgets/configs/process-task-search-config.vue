<template>
  <div class="process-task-search-config">
    <TsFormItem label="每页展示条数" labelPosition="top">
      <TsFormSelect
        :value="pageSize"
        :dataList="pageSizeDataList"
        :clearable="false"
        :transfer="true"
        @change="value => setConfig('pageSize', value)"
      ></TsFormSelect>
    </TsFormItem>

    <TsFormItem label="搜索条件" labelPosition="top">
      <div v-if="hasTimeCondition" class="mb-xs">
        <Tag>已配置时间范围</Tag>
      </div>
      <ConditionViewer
        v-if="hasCondition"
        :readonly="true"
        :conditionList="currentConditionList"
        :workcenterConditionData="conditionConfig"
      ></ConditionViewer>
      <div v-else class="text-tip mb-xs">未配置搜索条件，将查询全部工单</div>
      <span class="text-action tsfont-setting" @click="openConditionDialog">配置搜索条件</span>
    </TsFormItem>

    <TsFormItem label="表头" labelPosition="top">
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
      title="配置工单表头"
      type="modal"
      width="large"
      @on-ok="saveThead"
      @on-close="closeTheadDialog"
    >
      <div class="thead-editor">
        <div class="text-tip mb-md">拖拽调整列顺序，取消勾选可隐藏对应列；工单标题为必选列。</div>
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
              :disabled="thead.name === 'title'"
            ></Checkbox>
            <span>{{ thead.displayName }}</span>
          </div>
        </draggable>
      </div>
    </TsDialog>

    <TsDialog
      v-if="isShowConditionDialog"
      :isShow.sync="isShowConditionDialog"
      title="配置工单搜索条件"
      type="modal"
      width="large"
      :okBtnDisable="conditionLoading || !!conditionError"
      @on-ok="saveCondition"
      @on-close="closeConditionDialog"
    >
      <Loading v-if="conditionLoading" :loadingShow="true"></Loading>
      <div v-else class="condition-editor">
        <div v-if="conditionError" class="text-danger text-center padding-sm mb-sm">{{ conditionError }}</div>
        <TsRow :gutter="16">
          <Col :span="8">
            <TsFormItem label="时间范围" labelPosition="top">
              <TimeSelect
                :value="editingConditionConfig.startTimeCondition"
                :transfer="true"
                :clearable="true"
                @change="value => setEditingConditionField('startTimeCondition', value)"
              ></TimeSelect>
            </TsFormItem>
          </Col>
          <Col :span="8">
            <TsFormItem label="标题关键词" labelPosition="top">
              <TsFormInput v-model.trim="titleKeyword" border="border" clearable></TsFormInput>
            </TsFormItem>
          </Col>
          <Col :span="8">
            <TsFormItem label="上报内容关键词" labelPosition="top">
              <TsFormInput v-model.trim="contentKeyword" border="border" clearable></TsFormInput>
            </TsFormItem>
          </Col>
        </TsRow>
        <Tabs
          :value="conditionMode"
          :animated="false"
          @on-click="changeConditionMode"
        >
          <TabPane label="简单模式" name="simple">
            <SimplePanel
              v-if="conditionMode === 'simple' && currentEditingConditionList.length"
              ref="conditionPanel"
              :key="conditionPanelKey"
              :conditionList="currentEditingConditionList"
              :workcenterConditionData="editingConditionConfig"
            ></SimplePanel>
            <NoData v-else-if="conditionMode === 'simple'" text="暂无可用搜索条件"></NoData>
          </TabPane>
          <TabPane v-if="canUseAdvanced" label="高级模式" name="custom">
            <CustomPanel
              v-if="conditionMode === 'custom' && currentEditingConditionList.length"
              ref="conditionPanel"
              :key="conditionPanelKey"
              :conditionList="currentEditingConditionList"
              :workcenterConditionData="editingConditionConfig"
            ></CustomPanel>
            <NoData v-else-if="conditionMode === 'custom'" text="暂无可用搜索条件"></NoData>
          </TabPane>
        </Tabs>
      </div>
    </TsDialog>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import {
  PROCESS_TASK_PAGE_SIZE_LIST,
  PROCESS_TASK_THEAD_HANDLER,
  PROCESS_TASK_WIDGET_NAME,
  PROCESS_TASK_WORKCENTER_UUID,
  createDefaultConditionConfig,
  extractTheadList,
  mergeTheadList,
  normalizePageSize,
  serializeTheadList
} from '../utils/process-task-search.js';

export default {
  name: 'ProcessTaskSearchConfig',
  components: {
    draggable,
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TimeSelect: () => import('@/resources/components/TimeSelect/TimeSelect.vue'),
    ConditionViewer: () => import('@/resources/components/ProcessTaskSearcher/condition-viewer.vue'),
    SimplePanel: () => import('@/resources/components/ProcessTaskSearcher/simple-panel.vue'),
    CustomPanel: () => import('@/resources/components/ProcessTaskSearcher/custom-panel.vue')
  },
  props: {
    widget: { type: Object, default: () => ({}) },
    definition: { type: Object, default: () => ({}) },
    setConfig: { type: Function, required: true }
  },
  data() {
    return {
      theadLoading: false,
      theadError: '',
      theadList: [],
      theadDraftList: [],
      isShowTheadDialog: false,
      isShowConditionDialog: false,
      conditionLoading: false,
      conditionError: '',
      conditionMode: 'simple',
      conditionPanelKey: 0,
      editingConditionConfig: createDefaultConditionConfig(),
      conditionListMap: {
        simple: [],
        custom: []
      },
      titleKeyword: '',
      contentKeyword: ''
    };
  },
  created() {
    this.loadTheadList();
    this.loadConditionList(this.conditionConfig.handlerType || 'simple').catch(() => {});
  },
  methods: {
    async loadTheadList() {
      this.theadLoading = true;
      this.theadError = '';
      try {
        const res = await this.$api.common.searchWorkbenchWidgetData({
          handler: PROCESS_TASK_THEAD_HANDLER,
          portalWidgetName: PROCESS_TASK_WIDGET_NAME,
          param: {}
        });
        if (!res || res.Status !== 'OK') {
          throw new Error((res && res.Message) || '可选表头加载失败');
        }
        this.theadList = mergeTheadList(extractTheadList(res.Return), this.config.theadList || []);
        if (!this.config.theadList || !this.config.theadList.length) {
          this.setConfig('theadList', serializeTheadList(this.theadList));
        }
      } catch (error) {
        this.theadList = mergeTheadList(this.config.theadList || [], this.config.theadList || []);
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
      const titleThead = this.theadDraftList.find(item => item.name === 'title');
      if (titleThead) {
        titleThead.isShow = 1;
      }
      if (!this.theadDraftList.some(item => item.isShow !== 0)) {
        this.$Message.warning('请至少选择一个表头');
        return;
      }
      const theadList = serializeTheadList(this.theadDraftList);
      this.theadList = this.$utils.deepClone(theadList);
      this.setConfig('theadList', theadList);
      this.closeTheadDialog();
    },
    normalizeConditionConfig(config) {
      const conditionConfig = {
        ...createDefaultConditionConfig(),
        ...this.$utils.deepClone(config || {})
      };
      ['conditionGroupList', 'conditionGroupRelList', 'keywordConditionList'].forEach(key => {
        if (!Array.isArray(conditionConfig[key])) {
          conditionConfig[key] = [];
        }
      });
      conditionConfig.handlerType = conditionConfig.handlerType === 'custom' ? 'custom' : 'simple';
      return conditionConfig;
    },
    async loadConditionList(mode) {
      const conditionMode = mode === 'custom' ? 'custom' : 'simple';
      if (this.conditionListMap[conditionMode].length) {
        return;
      }
      const res = await this.$api.process.processtask.workcenterCondition({
        conditionModel: conditionMode,
        workcenterUuid: PROCESS_TASK_WORKCENTER_UUID
      });
      if (!res || res.Status !== 'OK') {
        throw new Error((res && res.Message) || '搜索条件加载失败');
      }
      this.$set(this.conditionListMap, conditionMode, Array.isArray(res.Return) ? res.Return : []);
    },
    async openConditionDialog() {
      this.editingConditionConfig = this.normalizeConditionConfig(this.conditionConfig);
      this.conditionMode = this.editingConditionConfig.handlerType;
      if (this.conditionMode === 'custom' && !this.canUseAdvanced) {
        this.conditionMode = 'simple';
        this.editingConditionConfig.handlerType = 'simple';
      }
      this.initKeyword();
      this.isShowConditionDialog = true;
      this.conditionLoading = true;
      this.conditionError = '';
      try {
        await this.loadConditionList(this.conditionMode);
        this.conditionPanelKey += 1;
      } catch (error) {
        this.conditionError = (error && (error.Message || error.message)) || '搜索条件加载失败';
      } finally {
        this.conditionLoading = false;
      }
    },
    closeConditionDialog() {
      this.isShowConditionDialog = false;
    },
    async changeConditionMode(mode) {
      if (mode === this.conditionMode) {
        return;
      }
      const startTimeCondition = this.editingConditionConfig.startTimeCondition;
      const keywordConditionList = this.createKeywordConditionList();
      this.conditionLoading = true;
      this.conditionError = '';
      try {
        await this.loadConditionList(mode);
        this.conditionMode = mode;
        this.editingConditionConfig = {
          ...createDefaultConditionConfig(),
          handlerType: mode,
          startTimeCondition,
          keywordConditionList
        };
        this.conditionPanelKey += 1;
      } catch (error) {
        this.conditionError = (error && (error.Message || error.message)) || '搜索条件加载失败';
      } finally {
        this.conditionLoading = false;
      }
    },
    setEditingConditionField(name, value) {
      this.$set(this.editingConditionConfig, name, value);
    },
    initKeyword() {
      const keywordConditionList = this.editingConditionConfig.keywordConditionList || [];
      const titleCondition = keywordConditionList.find(item => item.name === 'title');
      const contentCondition = keywordConditionList.find(item => item.name === 'content');
      this.titleKeyword = titleCondition && titleCondition.valueList ? titleCondition.valueList.join(' ') : '';
      this.contentKeyword = contentCondition && contentCondition.valueList ? contentCondition.valueList.join(' ') : '';
    },
    createKeywordConditionList() {
      const keywordConditionList = [];
      if (this.titleKeyword) {
        keywordConditionList.push({
          uuid: this.$utils.setUuid(),
          name: 'title',
          text: '标题',
          valueList: [this.titleKeyword]
        });
      }
      if (this.contentKeyword) {
        keywordConditionList.push({
          uuid: this.$utils.setUuid(),
          name: 'content',
          text: '上报内容',
          valueList: [this.contentKeyword]
        });
      }
      return keywordConditionList;
    },
    generateJoinData(conditionConfig) {
      const conditionGroupList = conditionConfig.conditionGroupList || [];
      const conditionGroupRelList = conditionConfig.conditionGroupRelList || [];
      conditionGroupList.forEach((conditionGroup, groupIndex) => {
        const conditionList = conditionGroup.conditionList || [];
        const conditionRelList = conditionGroup.conditionRelList || [];
        for (let conditionIndex = 1; conditionIndex < conditionList.length; conditionIndex++) {
          const conditionRel = conditionRelList[conditionIndex - 1];
          if (conditionRel) {
            conditionRel.from = conditionList[conditionIndex - 1].uuid;
            conditionRel.to = conditionList[conditionIndex].uuid;
          }
        }
        if (groupIndex > 0) {
          const conditionGroupRel = conditionGroupRelList[groupIndex - 1];
          if (conditionGroupRel) {
            conditionGroupRel.from = conditionGroupList[groupIndex - 1].uuid;
            conditionGroupRel.to = conditionGroup.uuid;
          }
        }
      });
      return conditionConfig;
    },
    saveCondition() {
      const conditionPanel = this.$refs.conditionPanel;
      if (conditionPanel && conditionPanel.valid && !conditionPanel.valid()) {
        return;
      }
      const conditionConfig = conditionPanel && conditionPanel.getData
        ? conditionPanel.getData()
        : createDefaultConditionConfig();
      conditionConfig.handlerType = this.conditionMode;
      conditionConfig.startTimeCondition = this.editingConditionConfig.startTimeCondition || null;
      conditionConfig.keywordConditionList = this.createKeywordConditionList();
      this.setConfig('conditionConfig', this.$utils.deepClone(this.generateJoinData(conditionConfig)));
      this.closeConditionDialog();
    }
  },
  computed: {
    config() {
      return this.widget.config || {};
    },
    pageSize() {
      return normalizePageSize(this.config.pageSize);
    },
    pageSizeDataList() {
      return PROCESS_TASK_PAGE_SIZE_LIST.map(value => ({
        value,
        text: `${value} 条/页`
      }));
    },
    conditionConfig() {
      return this.normalizeConditionConfig(this.config.conditionConfig);
    },
    currentConditionList() {
      return this.conditionListMap[this.conditionConfig.handlerType] || [];
    },
    currentEditingConditionList() {
      return this.conditionListMap[this.conditionMode] || [];
    },
    visibleTheadList() {
      return this.theadList.filter(item => item.isShow !== 0);
    },
    hasTimeCondition() {
      const condition = this.conditionConfig.startTimeCondition;
      return !!(condition && (condition.timeRange || condition.startTime));
    },
    hasCondition() {
      return !!(
        (this.conditionConfig.conditionGroupList && this.conditionConfig.conditionGroupList.length) ||
        (this.conditionConfig.keywordConditionList && this.conditionConfig.keywordConditionList.length)
      );
    },
    canUseAdvanced() {
      return this.$AuthUtils.hasRole('WORKCENTER_ADVANCED_SEARCH');
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
.condition-editor {
  min-height: 360px;
  max-height: 620px;
  overflow: auto;
}
</style>

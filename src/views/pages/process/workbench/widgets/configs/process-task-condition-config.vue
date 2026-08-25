<template>
  <div class="process-task-condition-config">
    <TsFormItem :label="label" labelPosition="top">
      <div v-if="hasTimeCondition" class="mb-xs">
        <Tag>{{ $t('term.workbench.timerangeconfigured') }}</Tag>
      </div>
      <ConditionViewer
        v-if="hasCondition"
        :readonly="true"
        :conditionList="currentConditionList"
        :workcenterConditionData="conditionConfig"
      ></ConditionViewer>
      <div v-else class="text-tip mb-xs">{{ $t('term.workbench.conditionnotconfigured') }}</div>
      <span class="text-action tsfont-setting" @click="openConditionDialog">{{ $t('term.workbench.configuresearchcriteria') }}</span>
    </TsFormItem>

    <TsDialog
      v-if="isShowConditionDialog"
      :isShow.sync="isShowConditionDialog"
      :title="dialogTitle"
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
            <TsFormItem :label="$t('page.timerange')" labelPosition="top">
              <TimeSelect
                :value="editingConditionConfig.startTimeCondition"
                :transfer="true"
                :clearable="true"
                @change="value => setEditingConditionField('startTimeCondition', value)"
              ></TimeSelect>
            </TsFormItem>
          </Col>
          <Col :span="8">
            <TsFormItem :label="$t('term.workbench.titlekeyword')" labelPosition="top">
              <TsFormInput v-model.trim="titleKeyword" border="border" clearable></TsFormInput>
            </TsFormItem>
          </Col>
          <Col :span="8">
            <TsFormItem :label="$t('term.workbench.reportcontentkeyword')" labelPosition="top">
              <TsFormInput v-model.trim="contentKeyword" border="border" clearable></TsFormInput>
            </TsFormItem>
          </Col>
        </TsRow>
        <Tabs
          :value="conditionMode"
          :animated="false"
          @on-click="changeConditionMode"
        >
          <TabPane :label="$t('page.simplemode')" name="simple">
            <SimplePanel
              v-if="conditionMode === 'simple' && currentEditingConditionList.length"
              ref="conditionPanel"
              :key="conditionPanelKey"
              :conditionList="currentEditingConditionList"
              :workcenterConditionData="editingConditionConfig"
            ></SimplePanel>
            <NoData v-else-if="conditionMode === 'simple'" :text="$t('term.workbench.nosearchcriteria')"></NoData>
          </TabPane>
          <TabPane v-if="canUseAdvanced" :label="$t('page.advancedmode')" name="custom">
            <CustomPanel
              v-if="conditionMode === 'custom' && currentEditingConditionList.length"
              ref="conditionPanel"
              :key="conditionPanelKey"
              :conditionList="currentEditingConditionList"
              :workcenterConditionData="editingConditionConfig"
            ></CustomPanel>
            <NoData v-else-if="conditionMode === 'custom'" :text="$t('term.workbench.nosearchcriteria')"></NoData>
          </TabPane>
        </Tabs>
      </div>
    </TsDialog>
  </div>
</template>

<script>
import {
  PROCESS_TASK_CONDITION_HANDLER,
  PROCESS_TASK_WIDGET_NAME,
  PROCESS_TASK_WORKCENTER_UUID,
  createDefaultConditionConfig
} from '../utils/process-task-search.js';
import { $t } from '@/resources/init.js';

export default {
  name: 'ProcessTaskConditionConfig',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TimeSelect: () => import('@/resources/components/TimeSelect/TimeSelect.vue'),
    ConditionViewer: () => import('@/resources/components/ProcessTaskSearcher/condition-viewer.vue'),
    SimplePanel: () => import('@/resources/components/ProcessTaskSearcher/simple-panel.vue'),
    CustomPanel: () => import('@/resources/components/ProcessTaskSearcher/custom-panel.vue')
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: { type: Object, default: () => ({}) },
    label: { type: String, default: () => $t('term.workbench.searchcriteria') },
    dialogTitle: { type: String, default: () => $t('term.workbench.configureworkordersearchcriteria') },
    portalWidgetName: { type: String, default: PROCESS_TASK_WIDGET_NAME },
    handler: { type: String, default: PROCESS_TASK_CONDITION_HANDLER },
    workcenterUuid: { type: String, default: PROCESS_TASK_WORKCENTER_UUID },
    advancedAuth: { type: String, default: 'WORKCENTER_ADVANCED_SEARCH' }
  },
  data() {
    return {
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
      conditionLoadedMap: {
        simple: false,
        custom: false
      },
      conditionRequestMap: {
        simple: null,
        custom: null
      },
      titleKeyword: '',
      contentKeyword: ''
    };
  },
  created() {
    this.loadConditionList(this.conditionConfig.handlerType).catch(() => {});
  },
  methods: {
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
      if (this.conditionLoadedMap[conditionMode]) {
        return;
      }
      if (!this.conditionRequestMap[conditionMode]) {
        const request = this.$api.tenant.searchWorkbenchWidgetData({
          portalWidgetName: this.portalWidgetName,
          handler: this.handler,
          param: {
            conditionModel: conditionMode,
            workcenterUuid: this.workcenterUuid
          }
        }).then(res => {
          if (!res || res.Status !== 'OK') {
            throw new Error((res && res.Message) || this.$t('term.workbench.searchcriterialoadfailed'));
          }
          const conditionList = Array.isArray(res.Return)
            ? res.Return
            : ((res.Return && (res.Return.conditionList || res.Return.tbodyList)) || []);
          this.$set(this.conditionListMap, conditionMode, conditionList);
          this.$set(this.conditionLoadedMap, conditionMode, true);
        }).finally(() => {
          this.$set(this.conditionRequestMap, conditionMode, null);
        });
        this.$set(this.conditionRequestMap, conditionMode, request);
      }
      await this.conditionRequestMap[conditionMode];
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
        this.conditionError = (error && (error.Message || error.message)) || this.$t('term.workbench.searchcriterialoadfailed');
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
        this.conditionError = (error && (error.Message || error.message)) || this.$t('term.workbench.searchcriterialoadfailed');
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
          text: this.$t('page.title'),
          valueList: [this.titleKeyword]
        });
      }
      if (this.contentKeyword) {
        keywordConditionList.push({
          uuid: this.$utils.setUuid(),
          name: 'content',
          text: this.$t('term.workbench.reportcontentkeyword'),
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
      this.$emit('change', this.$utils.deepClone(this.generateJoinData(conditionConfig)));
      this.closeConditionDialog();
    }
  },
  computed: {
    conditionConfig() {
      return this.normalizeConditionConfig(this.value);
    },
    currentConditionList() {
      return this.conditionListMap[this.conditionConfig.handlerType] || [];
    },
    currentEditingConditionList() {
      return this.conditionListMap[this.conditionMode] || [];
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
      return !this.advancedAuth || this.$AuthUtils.hasRole(this.advancedAuth);
    }
  },
  watch: {
    value: {
      deep: true,
      handler(value) {
        const mode = this.normalizeConditionConfig(value).handlerType;
        this.loadConditionList(mode).catch(() => {});
      }
    }
  }
};
</script>

<style lang="less" scoped>
.condition-editor {
  min-height: 360px;
  max-height: 620px;
  overflow: auto;
}
</style>

<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <ServiceInvalidAlert :serviceData="serviceConfig"></ServiceInvalidAlert>
    <template v-if="ready">
      <CollapseSection
        :title="$t('page.job')"
        :expanded="expanded.jobName"
        :border="border"
        @toggle="$set(expanded, 'jobName', $event)"
      >
        <TsFormInput
          ref="jobName"
          :value="jobDraft.name"
          :maxlength="50"
          :validateList="['required', 'name-special']"
          :isChangeWrite="false"
          border="border"
          :readonly="readonly"
          :disabled="disabled"
          @on-change="handleJobNameChange"
        ></TsFormInput>
      </CollapseSection>
      <CollapseSection
        v-if="formConfig"
        :title="$t('page.inputparam')"
        :expanded="expanded.formParam"
        :border="border"
        @toggle="$set(expanded, 'formParam', $event)"
      >
        <TsSheet
          ref="sheet"
          mode="read"
          :readonly="readonly"
          :disabled="disabled"
          :value="formConfig"
          :data="jobDraft.formAttributeDataList"
          @setValue="handleChange"
        ></TsSheet>
      </CollapseSection>
      <ServiceParamPanel
        ref="params"
        :value="parameterValues"
        :definitions="editableDefinitions"
        :context="context"
        :mode="readonly ? 'readonly' : 'job-create'"
        :disabled="disabled"
        :border="border"
        @input="handleParamsChange"
      >
      </ServiceParamPanel>
      <CollapseSection
        :title="$t('term.autoexec.otherparam')"
        :expanded="expanded.otherParam"
        :border="border"
        @toggle="$set(expanded, 'otherParam', $event)"
      >
        <ServiceBasicInfo :value="serviceConfig"></ServiceBasicInfo>
        <ServiceParamPanel
          :value="parameterValues"
          :definitions="configuredDefinitions"
          :context="context"
          mode="readonly"
          border="none"
          :grouped="false"
        ></ServiceParamPanel>
      </CollapseSection>
    </template>
    <SaveSetting
      v-if="isSaveDialog"
      :value="true"
      @input="isSaveDialog = $event"
      @on-ok="okSave"
    ></SaveSetting>
  </div>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput';
import TsSheet from '@/resources/plugins/TsSheet/TsSheet.vue';
import SaveSetting from '@/views/pages/autoexec/detail/runnerDetail/save-setting.vue';
import ServiceInvalidAlert from './service-invalid-alert.vue';
import CollapseSection from './collapse-section.vue';
import ServiceParamPanel from './combopconfig/service-param-panel.vue';
import ServiceBasicInfo from './service-basic-info.vue';
import { isJobEditable } from './combopconfig/mapping-rules.js';
import { validateControls } from './combopconfig/editor-contract.js';
import { createDefinitions } from './combopconfig/fields/index.js';
import { initializeValues, parameterContext } from '../model/service-model.js';
import { toJobPayload } from '../model/service-payload.js';
import { loadServiceDependencies } from '../model/service-loader.js';
import { createRequestState } from '../model/request-state.js';
export default {
  name: 'JobEditor',
  components: {
    TsFormInput,
    TsSheet,
    SaveSetting,
    ServiceInvalidAlert,
    CollapseSection,
    ServiceParamPanel,
    ServiceBasicInfo
  },
  props: {
    defaultData: { type: Object, default: () => ({}) },
    serviceData: { type: Object, default: () => ({}) },
    border: { type: String, default: 'border' },
    source: { type: String, default: '' },
    readonly: Boolean,
    disabled: Boolean
  },
  data() {
    return {
      loadingShow: false,
      submitting: false,
      validating: false,
      ready: false,
      isSaveDialog: false,
      jobDraft: { name: '', formAttributeDataList: [] },
      requests: createRequestState(),
      changeQueued: false,
      nameTouched: false,
      combop: {},
      parameterValues: {},
      formConfig: null,
      formFields: [],
      expanded: {
        jobName: true,
        formParam: true,
        otherParam: true
      },
      lastEmitted: null,
      initialData: null
    };
  },
  beforeDestroy() {
    this.ready = false;
    this.requests.invalidate();
  },
  methods: {
    async initData() {
      const current = this.requests.begin('initialize');
      this.requests.begin('submit');
      this.submitting = false;
      const service = this.$utils.deepClone(this.serviceConfig);
      // 在请求发出时保存快照；名称晚到或相同配置回传不应重复初始化。
      this.initialData = this.configSnapshot(service);
      this.ready = false;
      this.loadingShow = true;
      try {
        const dependencies = await loadServiceDependencies(this.$api, service);
        if (!current() || !dependencies) return;
        Object.assign(this, dependencies);
        // 读取最新回填值，覆盖加载期间到达的旧作业快照。
        this.applyJobDraft(this.externalJob || {});
        this.ready = true;
        await this.handleChange();
      } finally {
        if (current()) this.loadingShow = false;
      }
    },
    configSnapshot(service) {
      const snapshot = this.$utils.deepClone(service);
      delete snapshot.combopName;
      return snapshot;
    },
    applyJobDraft(job) {
      this.parameterValues = initializeValues(this.serviceConfig, this.combop, job, 'job-create');
      this.jobDraft = {
        name: job.name !== undefined ? job.name : this.serviceConfig.combopName || this.serviceConfig.name || '',
        formAttributeDataList: this.$utils.deepClone(job.formAttributeDataList || [])
      };
      this.nameTouched = job.name !== undefined;
    },
    handleJobNameChange(value) {
      this.jobDraft.name = value;
      this.nameTouched = true;
      this.handleChange();
    },
    handleParamsChange(value) {
      this.parameterValues = value;
      this.handleChange();
    },
    async handleChange() {
      if (this.changeQueued) return;
      this.changeQueued = true;
      await this.$nextTick();
      this.changeQueued = false;
      if (!this.ready || this._isBeingDestroyed || this._isDestroyed) return;
      const data = this.getSaveData();
      if (this.$utils.isSame(data, this.lastEmitted)) return;
      this.lastEmitted = this.$utils.deepClone(data);
      this.$emit('set-value', data);
    },
    getSaveData(schedule = {}) {
      const sheet = this.$refs.sheet;
      const options = {
        ...(sheet ? { formAttributeDataList: sheet.getFormData(), hidecomponentList: sheet.getHiddenComponents(), readcomponentList: sheet.getReadComponents() } : {}),
        ...schedule
      };
      // 不能仅依赖 input 事件：执行目标控件可能延迟提交值。
      const values = this.$refs.params ? this.$refs.params.getValue() : this.parameterValues;
      return toJobPayload(this.serviceConfig, this.jobDraft, values, this.definitions, options);
    },
    saveData() {
      return this.getSaveData();
    },
    async valid() {
      await this.$nextTick();
      if (!this.ready || this.loadingShow) return false;
      const controlsValid = await validateControls([this.$refs.jobName, this.$refs.params], control => {
        if (control === this.$refs.jobName) this.$set(this.expanded, 'jobName', true);
      });
      const sheet = this.$refs.sheet;
      const errors = sheet && sheet.validData ? await sheet.validData() : {};
      const sheetValid = this.$utils.isEmpty(errors);
      if (!sheetValid) this.$set(this.expanded, 'formParam', true);
      return controlsValid && sheetValid;
    },
    async saveService() {
      if (this.validating || this.submitting || this.disabled || this.readonly) return false;
      this.validating = true;
      const snapshot = this.initialData;
      try {
        if (!(await this.valid()) || this._isDestroyed || snapshot !== this.initialData) return false;
        this.isSaveDialog = true;
        return true;
      } finally {
        this.validating = false;
      }
    },
    async saveExecuteService(schedule) {
      if (this.submitting || this.disabled || this.readonly) return false;
      this.submitting = true;
      const current = this.requests.begin('submit');
      try {
        if (!(await this.valid()) || !current()) return false;
        this.loadingShow = true;
        const res = await this.$api.autoexec.catalogManage.saveJobCreate(this.getSaveData(schedule));
        if (!current()) return false;
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.addsuccess'));
          this.$router.push({ path: '/job-detail', query: { id: res.Return.jobId } });
          return true;
        }
        return false;
      } finally {
        if (current()) {
          this.submitting = false;
          this.loadingShow = false;
        }
      }
    },
    okSave(data) {
      return this.saveExecuteService(data);
    }
  },
  computed: {
    serviceConfig() {
      return this.defaultData;
    },
    externalJob() {
      const job = this.serviceData;
      return job.serviceId && job.serviceId != this.serviceConfig.id ? null : job;
    },
    context() {
      return parameterContext(this.combop, this.parameterValues, this.serviceConfig, { formFields: this.formFields });
    },
    definitions() {
      return this.ready ? createDefinitions(this.context) : [];
    },
    editableDefinitions() {
      return this.definitions.filter(d => isJobEditable(d, this.parameterValues[d.key]));
    },
    configuredDefinitions() {
      return this.definitions.filter(d => !isJobEditable(d, this.parameterValues[d.key]));
    }
  },
  watch: {
    defaultData: {
      deep: true,
      immediate: true,
      handler(value) {
        if (!this.$utils.isSame(this.configSnapshot(value), this.initialData) || (!this.ready && !this.loadingShow)) {
          this.initData();
        } else if (this.ready && !this.nameTouched && value.combopName && this.jobDraft.name !== value.combopName) {
          this.jobDraft.name = value.combopName;
          this.handleChange();
        }
      }
    },
    serviceData: {
      deep: true,
      handler() {
        const value = this.externalJob;
        if (!this.ready || !value || this.$utils.isSame(value, this.lastEmitted) || this.$utils.isSame(value, this.getSaveData())) return;
        this.applyJobDraft(value);
        this.handleChange();
      }
    }
  }
};
</script>

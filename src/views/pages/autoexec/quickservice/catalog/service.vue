<template>
  <div class="service-container">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <ServiceInvalidAlert :serviceData="serviceConfig" type="location" @click="toJobParamLocation"></ServiceInvalidAlert>
    <div class="radius-lg bg-op padding">
      <div class="flex-between mb-sm">
        <span>{{ $t('page.basicinfo') }}</span>
        <span
          class="cursor"
          :class="basicExpanded ? 'tsfont-down' : 'tsfont-up'"
          @click="basicExpanded = !basicExpanded"
        ></span>
      </div>
      <TsForm
        v-show="basicExpanded"
        ref="basicForm"
        v-model="basicFormValue"
        :item-list="basicFormItemList"
      >
        <template v-slot:combopId>
          <div class="grid">
            <TsFormSelect ref="combopSelector" v-model="basicFormValue.combopId" v-bind="combopConfig"></TsFormSelect>
            <span
              v-if="basicFormValue.combopId"
              class="tsfont-edit text-action"
              @click.stop="toActionDetail(basicFormValue.combopId)"
            >{{ $t('page.edit') }}</span>
          </div>
        </template>
      </TsForm>
    </div>
    <ServiceParamPanel
      v-if="ready && basicFormValue.combopId"
      ref="params"
      v-model="parameterValues"
      :definitions="definitions"
      :context="context"
      @precondition="changePreCondition"
    ></ServiceParamPanel>
    <div class="pt-nm">
      <Button
        type="primary"
        :disabled="validating || loadingShow || formLoading"
        @click="saveService"
      >{{ $t('page.save') }}</Button>
    </div>
  </div>
</template>
<script>
import catalogmixin from './catalogmixin.js';
import ServiceParamPanel from '../components/combopconfig/service-param-panel.vue';
import ServiceInvalidAlert from '../components/service-invalid-alert.vue';
import { createDefinitions } from '../components/combopconfig/fields/index.js';
import { initializeValues, parameterContext } from '../model/service-model.js';
import { has } from '../components/combopconfig/mapping-rules.js';
import { validateControls } from '../components/combopconfig/editor-contract.js';
import { cleanFormMappings, toServicePayload } from '../model/service-payload.js';
import { loadServiceDependencies, loadTool, loadForm } from '../model/service-loader.js';
import { createRequestState } from '../model/request-state.js';
import { getServiceBasicInfoItemList, getServiceInfoValues } from '../model/service-info.js';
export default {
  name: 'Service',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    ServiceParamPanel,
    ServiceInvalidAlert
  },
  mixins: [catalogmixin],
  data() {
    return {
      requests: createRequestState(),
      ready: false,
      validating: false,
      loadingShow: false,
      formLoading: false,
      basicExpanded: true,
      serviceConfig: {},
      combop: {},
      parameterValues: {},
      formFields: [],
      preCondition: undefined,
      preConditionChanged: false,
      basicFormValue: getServiceInfoValues(),
      basicFormItemList: getServiceBasicInfoItemList({
        onChange: {
          isActive: isActive => this.updateActiveStatus(this.id, isActive),
          combopId: id => this.getCombopDetail(id),
          citeForm: enabled => this.changeCiteForm(enabled),
          formUuid: uuid => this.getFormListByFormUuid(uuid)
        }
      })
    };
  },
  beforeDestroy() {
    this.requests.invalidate();
  },
  methods: {
    cleanFormMappings,
    toActionDetail(id) {
      window.open(HOME + '/autoexec.html#/action-detail?id=' + id + '&versionStatus=passed', '_blank');
    },
    changeCiteForm(enabled) {
      this.basicFormItemList.find(item => item.name === 'formUuid').isHidden = !enabled;
      if (!enabled) {
        this.$set(this.basicFormValue, 'formUuid', '');
        this.formFields = [];
        this.parameterValues = this.cleanFormMappings(this.parameterValues);
        this.requests.begin('form');
        this.formLoading = false;
      }
    },
    async initData() {
      const current = this.requests.begin('initialize');
      this.requests.begin('form');
      this.formLoading = false;
      this.ready = false;
      this.loadingShow = true;
      this.basicExpanded = true;
      const id = this.id;
      const parentId = this.parentId;
      this.basicFormItemList
        .find(item => item.name === 'name')
        .validateList.filter(rule => rule && rule.name)
        .forEach(rule => {
          rule.params = { id: id || '', parentId };
        });
      try {
        const response = id ? await this.$api.autoexec.catalogManage.getSeriveInfo({ id }) : null;
        if (!current() || (response && response.Status !== 'OK')) return;
        const service = response ? this.$utils.deepClone(response.Return) : {};
        const dependencies = await loadServiceDependencies(this.$api, service);
        if (!current() || !dependencies) return;
        this.initializeDraft(service, dependencies);
        await this.$nextTick();
        if (current() && this.positioningKey) this.toJobParamLocation(this.positioningKey);
      } finally {
        if (current()) this.loadingShow = false;
      }
    },
    initializeDraft(service, { combop, formFields }) {
      this.serviceConfig = service;
      this.basicFormValue = getServiceInfoValues(service);
      this.basicFormValue.description = this.escape2Html(this.basicFormValue.description) || '';
      this.basicFormItemList.find(item => item.name === 'formUuid').isHidden = !service.formUuid;
      this.combop = combop;
      this.parameterValues = initializeValues(service, combop);
      this.preCondition = parameterContext(combop, this.parameterValues, service).preCondition;
      this.preConditionChanged = has(service.config, 'preCondition');
      this.formFields = formFields;
      this.ready = true;
    },
    async getFormListByFormUuid(uuid) {
      const current = this.requests.begin('form');
      this.formFields = [];
      this.formLoading = !!uuid;
      if (!uuid) {
        this.parameterValues = cleanFormMappings(this.parameterValues);
        return;
      }
      try {
        const form = await loadForm(this.$api, uuid);
        if (!current() || !form) return;
        this.formFields = form.formFields;
        this.parameterValues = cleanFormMappings(this.parameterValues, this.formFields, true);
      } finally {
        if (current()) this.formLoading = false;
      }
    },
    async getCombopDetail(id) {
      const current = this.requests.begin('initialize');
      this.ready = false;
      this.loadingShow = true;
      this.serviceConfig = {};
      this.parameterValues = initializeValues();
      this.combop = {};
      try {
        const combop = await loadTool(this.$api, id);
        if (!current() || !combop) return;
        this.combop = combop;
        this.parameterValues = initializeValues({}, combop);
        this.preCondition = ((combop.config && combop.config.executeConfig) || {}).preCondition;
        this.preConditionChanged = false;
        this.ready = true;
      } finally {
        if (current()) this.loadingShow = false;
      }
    },
    async valid() {
      await this.$nextTick();
      if (this.loadingShow || this.formLoading || !this.ready) return false;
      return validateControls([this.$refs.basicForm, this.$refs.combopSelector, this.$refs.params], control => {
        if (control !== this.$refs.params) this.basicExpanded = true;
      });
    },
    getSaveData() {
      // 执行目标等控件保留本地编辑值，提交时必须经过 getValue()。
      const values = this.$refs.params ? this.$refs.params.getValue() : this.parameterValues;
      return toServicePayload(this.basicFormValue, values, this.definitions, {
        id: this.id || '',
        parentId: this.parentId,
        preCondition: this.preCondition,
        preConditionChanged: this.preConditionChanged
      });
    },
    async saveService() {
      if (this.validating) return false;
      this.validating = true;
      const target = this.editorTarget;
      try {
        if (!(await this.valid()) || this._isDestroyed || target !== this.editorTarget) return false;
        this.$emit('save', this.getSaveData());
        return true;
      } finally {
        this.validating = false;
      }
    },
    toJobParamLocation(key) {
      return this.$refs.params && this.$refs.params.locate(key);
    },
    changePreCondition(value) {
      this.preCondition = this.$utils.deepClone(value);
      this.preConditionChanged = true;
    }
  },
  computed: {
    combopConfig() {
      const { type, name, label, value, ...config } = this.basicFormItemList.find(item => item.name === 'combopId');
      return config;
    },
    context() {
      return parameterContext(this.combop, this.parameterValues, this.basicFormValue, { formFields: this.formFields, preCondition: this.preCondition });
    },
    definitions() {
      return createDefinitions(this.context);
    }
  },
  watch: {
    editorTarget: {
      immediate: true,
      handler() {
        this.initData();
      }
    }
  }
};
</script>
<style lang="less" scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}
</style>

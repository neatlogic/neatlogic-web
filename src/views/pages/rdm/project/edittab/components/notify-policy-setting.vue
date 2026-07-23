<template>
  <div class="padding-md">
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <div v-if="config.handler" class="setting-content">
      <div class="default-policy-summary border-base radius-md bg-op padding-md mb-lg">
        <div class="default-policy-header">
          <span class="text-title">{{ $t('term.rdm.globaldefaultpolicy') }}</span>
          <Tag v-if="config.defaultPolicyId && policySource === 0" color="blue">{{ $t('term.rdm.currentlyused') }}</Tag>
          <Tag v-else-if="config.defaultPolicyId">{{ $t('term.rdm.forreferenceonly') }}</Tag>
        </div>
        <div class="default-policy-name mt-xs">
          {{ config.defaultPolicyName || $t('term.rdm.policynotconfigured') }}
        </div>
        <div class="text-tip mt-xs">{{ $t('term.rdm.globaldefaultpolicydesc') }}</div>
      </div>

      <div class="text-title mb-sm">{{ $t('term.rdm.policysource') }}</div>
      <TsFormRadio
        :key="policySourceRadioKey"
        v-model="policySource"
        class="policy-source-radio"
        :dataList="policySourceList"
        :vertical="true"
        @on-change="changePolicySource"
      >
        <template v-slot:label="{ node }">
          <span class="source-option-content">
            <span class="source-option-title text-title">{{ node.text }}</span>
            <span v-if="node.value === 0" class="source-option-policy mt-xs">
              <span class="text-tip">{{ $t('term.rdm.currentdefaultpolicy') }}</span>
              <span class="ml-xs">{{ config.defaultPolicyName || $t('term.rdm.policynotconfigured') }}</span>
            </span>
            <span class="source-option-desc text-tip mt-xs">{{ node.detail }}</span>
          </span>
        </template>
      </TsFormRadio>

      <div v-if="policySource === 1" class="custom-policy-field mt-md">
        <div class="require-label text-title mb-xs">{{ $t('term.rdm.customnotifypolicy') }}</div>
        <div class="custom-policy-row">
          <TsFormSelect
            :key="policySelectKey"
            ref="policySelect"
            v-model="selectedPolicyId"
            v-bind="policySelectConfig"
            :placeholder="$t('term.rdm.selectnotifypolicy')"
            @change="changePolicy"
          ></TsFormSelect>
          <span class="tsfont-rotate-right text-action" :title="$t('page.refresh')" @click="refreshPolicy"></span>
          <span
            v-if="config.policyId && policyDetailStatus === 'ready'"
            class="tsfont-edit text-action"
            :title="$t('page.edit')"
            @click="editPolicy"
          ></span>
        </div>
      </div>

      <Alert
        v-if="isGlobalPolicyNotConfigured"
        class="mt-md"
        type="warning"
        show-icon
      >
        {{ $t('term.rdm.globalpolicynotconfiguredtip') }}
      </Alert>
      <Alert
        v-else-if="isPolicyInvalid"
        class="mt-md"
        type="error"
        show-icon
      >
        {{ $t('term.rdm.notifypolicyinvalid') }}
      </Alert>

      <div v-if="canShowDetails" class="notification-detail mt-lg">
        <div class="text-title">{{ $t('term.rdm.notificationdetails') }}</div>
        <div v-if="policySource === 0" class="text-tip mt-xs">
          {{ $t('term.rdm.localnotificationdetaildesc', { target: currentTargetName }) }}
        </div>
        <Tabs v-model="currentTab" class="mt-sm" :animated="false">
          <TabPane :label="$t('term.rdm.triggertiming')" name="trigger">
            <div v-if="triggerList.length" class="trigger-list pt-md">
              <div v-for="item in triggerList" :key="item.trigger" class="trigger-row mb-sm">
                <span>{{ item.triggerName }}</span>
                <TsFormSwitch v-model="item.enabled" width="40px"></TsFormSwitch>
              </div>
            </div>
            <NoData v-else></NoData>
          </TabPane>
          <TabPane :label="$t('term.rdm.parammapping')" name="param">
            <div v-if="customParamList.length" class="param-mapping-list pt-md">
              <div v-for="item in customParamList" :key="item.name" class="param-mapping-row mb-sm">
                <span class="overflow" :title="item.label + '(' + item.name + ')'">{{ item.label }} ({{ item.name }})</span>
                <TsFormSelect
                  v-if="targetType === 'app'"
                  v-model="item.mappingValue"
                  :dataList="customAttrList"
                  valueName="uuid"
                  textName="displayName"
                  :placeholder="$t('form.placeholder.pleaseselect', { target: $t('term.rdm.customattribute') })"
                  filterable
                  clearable
                  transfer
                  border="border"
                ></TsFormSelect>
                <TsFormInput v-else v-model="item.mappingValue" border="border"></TsFormInput>
              </div>
            </div>
            <NoData v-else></NoData>
          </TabPane>
        </Tabs>
      </div>
      <div class="mt-md">
        <Button type="primary" :disabled="isSaveDisabled" @click="save">{{ $t('page.save') }}</Button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RdmNotifyPolicySetting',
  components: {
    TsFormRadio: () => import('@/resources/plugins/TsForm/TsFormRadio'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput')
  },
  props: {
    targetType: { type: String, required: true },
    targetId: { type: Number, required: true }
  },
  data() {
    return {
      loadingShow: false,
      currentTab: 'trigger',
      config: {},
      policySource: 0,
      policySourceRadioKey: 0,
      selectedPolicyId: null,
      policySelectKey: 0,
      policyDetailStatus: 'idle',
      policyDetailRequestSeq: 0,
      triggerList: [],
      customParamList: [],
      customAttrList: [],
      policySelectConfig: {
        dynamicUrl: '/api/rest/notify/policy/search',
        filterable: true,
        transfer: true,
        border: 'border',
        valueName: 'id',
        textName: 'name',
        rootName: 'tbodyList',
        params: { handler: '' }
      }
    };
  },
  created() {
    this.loadCustomAttrList();
    this.loadConfig();
  },
  methods: {
    loadCustomAttrList() {
      this.customAttrList = [];
      if (this.targetType !== 'app' || !this.targetId) {
        return;
      }
      this.$api.rdm.app.searchAppAttr({ appId: this.targetId, isActive: 1 }).then(res => {
        const attrList = res.Return || [];
        this.customAttrList = attrList.filter(item => item.isPrivate === 0).map(item => {
          return Object.assign({}, item, { displayName: item.label + ' (' + item.name + ')' });
        });
      });
    },
    loadConfig() {
      this.loadingShow = true;
      return this.$api.rdm.app.getNotifyPolicyConfig({ targetType: this.targetType, targetId: this.targetId }).then(res => {
        this.config = res.Return || {};
        if (this.config.isCustom !== 1) {
          this.$set(this.config, 'isCustom', 0);
        }
        this.policySource = this.config.isCustom;
        this.selectedPolicyId = this.config.policyId || null;
        this.policySelectConfig.params.handler = this.config.handler;
        return this.loadPolicyDetail();
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    loadPolicyDetail() {
      const requestSeq = ++this.policyDetailRequestSeq;
      this.triggerList = [];
      this.customParamList = [];
      if (!this.detailPolicyId) {
        this.policyDetailStatus = 'idle';
        return Promise.resolve(true);
      }
      this.policyDetailStatus = 'loading';
      return this.$api.framework.tactics.editNotify({ id: this.detailPolicyId }).then(res => {
        if (requestSeq !== this.policyDetailRequestSeq) {
          return true;
        }
        if (res.Status !== 'OK' || !res.Return) {
          this.policyDetailStatus = 'invalid';
          return false;
        }
        const detailConfig = (res.Return && res.Return.config) || {};
        const excludeTriggerList = this.config.excludeTriggerList || [];
        this.triggerList = (detailConfig.triggerList || []).map(item => {
          return Object.assign({}, item, { enabled: excludeTriggerList.indexOf(item.trigger) < 0 ? 1 : 0 });
        });
        const mappingMap = {};
        (this.config.paramMappingList || []).forEach(item => {
          mappingMap[item.name] = item;
        });
        this.customParamList = (detailConfig.paramList || []).filter(item => item.type === 'custom').map(item => {
          const mapping = mappingMap[item.name];
          let mappingValue = '';
          if (mapping) {
            if (this.targetType === 'app' && mapping.type === 'attr') {
              mappingValue = mapping.value;
            } else if (this.targetType !== 'app') {
              mappingValue = mapping.value;
            }
          }
          return Object.assign({}, item, { mappingValue: mappingValue });
        });
        this.policyDetailStatus = 'ready';
        return true;
      }).catch(() => {
        if (requestSeq === this.policyDetailRequestSeq) {
          this.policyDetailStatus = 'invalid';
        }
        return false;
      });
    },
    changePolicySource(value) {
      if (value === this.config.isCustom) {
        return;
      }
      const applyChange = () => {
        this.policySource = value;
        this.config.isCustom = value;
        this.config.policyId = null;
        this.selectedPolicyId = null;
        this.resetPersonalizedDetail();
        this.loadPolicyDetail();
      };
      const cancelChange = () => {
        this.policySource = this.config.isCustom;
        this.policySourceRadioKey += 1;
      };
      if (this.hasPersonalizedDetail) {
        // 单选组件会先更新界面值，确认前恢复原值，避免用户误以为切换已经生效。
        cancelChange();
        this.confirmResetPersonalizedDetail(applyChange, cancelChange);
      } else {
        applyChange();
      }
    },
    changePolicy(policyId) {
      const newPolicyId = policyId || null;
      if (newPolicyId === this.config.policyId) {
        return;
      }
      const applyChange = () => {
        this.config.policyId = newPolicyId;
        this.selectedPolicyId = newPolicyId;
        this.resetPersonalizedDetail();
        this.loadPolicyDetail();
      };
      const cancelChange = () => {
        this.selectedPolicyId = this.config.policyId || null;
        this.policySelectKey += 1;
      };
      if (this.hasPersonalizedDetail) {
        // 策略切换待确认期间继续展示原策略，取消后不需要重建策略详情。
        cancelChange();
        this.confirmResetPersonalizedDetail(applyChange, cancelChange);
      } else {
        applyChange();
      }
    },
    resetPersonalizedDetail() {
      this.config.excludeTriggerList = [];
      this.config.paramMappingList = [];
      this.triggerList = [];
      this.customParamList = [];
    },
    confirmResetPersonalizedDetail(onConfirm, onCancel) {
      this.$createDialog({
        title: this.$t('dialog.title.actionconfirm'),
        content: this.$t('term.rdm.switchpolicyresetconfirm'),
        'on-ok': vnode => {
          onConfirm();
          vnode.isShow = false;
        },
        'on-cancel': () => {
          onCancel();
        }
      });
    },
    refreshPolicy() {
      if (this.$refs.policySelect) {
        this.$refs.policySelect.initDataListByUrl();
      }
      this.loadPolicyDetail().then(isLoaded => {
        if (isLoaded) {
          this.$Message.success(this.$t('message.executesuccess'));
        }
      });
    },
    editPolicy() {
      window.open(HOME + '/framework.html#/notifytactics-edit?id=' + this.config.policyId, '_blank');
    },
    save() {
      if (this.config.isCustom === 1 && !this.config.policyId) {
        this.$Message.warning(this.$t('term.rdm.selectnotifypolicy'));
        return;
      }
      let excludeTriggerList = this.config.excludeTriggerList || [];
      let paramMappingList = this.config.paramMappingList || [];
      // 只有策略详情加载成功时才从界面重建配置，避免无默认策略时保存操作误清空历史配置。
      if (this.canShowDetails) {
        excludeTriggerList = this.triggerList.filter(item => !item.enabled).map(item => item.trigger);
        paramMappingList = this.customParamList.filter(item => item.mappingValue).map(item => {
          let type = 'constant';
          if (this.targetType === 'app') {
            type = 'attr';
          }
          return { name: item.name, value: item.mappingValue, type: type };
        });
      }
      const data = {
        targetType: this.targetType,
        targetId: this.targetId,
        isCustom: this.config.isCustom || 0,
        policyId: this.config.policyId || null,
        excludeTriggerList: excludeTriggerList,
        paramMappingList: paramMappingList
      };
      this.$api.rdm.app.saveNotifyPolicyConfig(data).then(res => {
        if (res.Status === 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.loadConfig();
        }
      });
    }
  },
  computed: {
    policySourceList() {
      return [
        {
          value: 0,
          text: this.$t('term.rdm.inheritglobaldefaultpolicy'),
          detail: this.$t('term.rdm.inheritglobaldefaultpolicydesc')
        },
        {
          value: 1,
          text: this.$t('term.rdm.usecustompolicy'),
          detail: this.$t('term.rdm.usecustompolicydesc', { target: this.currentTargetName })
        }
      ];
    },
    currentTargetName() {
      if (this.targetType === 'project') {
        return this.$t('page.project');
      }
      return this.$t('term.rdm.application');
    },
    detailPolicyId() {
      if (this.config.isCustom === 1) {
        return this.config.policyId;
      }
      return this.config.defaultPolicyId;
    },
    canShowDetails() {
      return !!this.detailPolicyId && this.policyDetailStatus === 'ready';
    },
    isGlobalPolicyNotConfigured() {
      return this.policySource === 0 && !this.config.defaultPolicyId;
    },
    isPolicyInvalid() {
      return !!this.detailPolicyId && this.policyDetailStatus === 'invalid';
    },
    isSaveDisabled() {
      if (this.config.isCustom !== 1) {
        return false;
      }
      if (!this.config.policyId) {
        return true;
      }
      return this.policyDetailStatus === 'loading' || this.policyDetailStatus === 'invalid';
    },
    hasPersonalizedDetail() {
      if (this.policyDetailStatus === 'ready') {
        if (this.triggerList.some(item => !item.enabled)) {
          return true;
        }
        return this.customParamList.some(item => !!item.mappingValue);
      }
      return !!((this.config.excludeTriggerList || []).length || (this.config.paramMappingList || []).length);
    }
  },
  watch: {
    targetId() {
      this.loadCustomAttrList();
      this.loadConfig();
    }
  }
};
</script>

<style scoped lang="less">
@import (reference) '~@/resources/assets/css/variable.less';

.setting-content {
  width: 100%;
  max-width: 760px;
}
.default-policy-summary {
  display: grid;
  row-gap: 2px;
}
.default-policy-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.default-policy-name {
  font-size: 16px;
  font-weight: 500;
}
.policy-source-radio {
  width: 100%;
}
.policy-source-radio ::v-deep .ivu-radio-group {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  row-gap: 12px;
  width: 100%;
}
.policy-source-radio ::v-deep .ivu-radio-wrapper {
  display: flex;
  align-items: flex-start;
  width: 100%;
  height: auto;
  min-height: 88px;
  margin: 0;
  padding: 16px;
  white-space: normal;
  border: 1px solid;
  border-radius: 6px;
}
.policy-source-radio ::v-deep .ivu-radio {
  margin-top: 3px;
}
.policy-source-radio ::v-deep .ivu-radio-wrapper > span:last-child {
  flex: 1;
  min-width: 0;
}
.source-option-content,
.source-option-policy,
.source-option-desc {
  display: block;
}
.source-option-title {
  display: block;
  line-height: 22px;
}
.custom-policy-field {
  width: 100%;
  max-width: 720px;
}
.custom-policy-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  column-gap: 16px;
  align-items: center;
}
.trigger-list {
  width: 100%;
  max-width: 360px;
}
.trigger-row {
  display: grid;
  grid-template-columns: auto 40px;
  column-gap: 24px;
  align-items: center;
}
.param-mapping-list {
  width: 100%;
  max-width: 664px;
}
.param-mapping-row {
  display: grid;
  grid-template-columns: minmax(180px, 240px) minmax(280px, 400px);
  column-gap: 24px;
  align-items: center;
}
@media screen and (max-width: 640px) {
  .custom-policy-row {
    grid-template-columns: minmax(0, 1fr) auto auto;
    column-gap: 10px;
  }
  .param-mapping-row {
    grid-template-columns: minmax(0, 1fr);
    row-gap: 8px;
  }
}

.theme(@op-color, @border-color, @primary-grey, @primary-color) {
  .policy-source-radio ::v-deep .ivu-radio-wrapper {
    background: @op-color;
    border-color: @border-color;
  }
  .policy-source-radio ::v-deep .ivu-radio-wrapper-checked {
    background: @primary-grey;
    border-color: @primary-color;
  }
}
html {
  .theme(@default-op, @default-border, @default-primary-grey, @default-primary-color);
  &.theme-dark {
    .theme(@dark-op, @dark-border, @dark-primary-grey, @dark-primary-color);
  }
}
</style>

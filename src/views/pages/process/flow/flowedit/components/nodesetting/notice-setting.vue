<template>
  <div class="notice-setting-box" :class="hasPadding ? 'pt-sm pb-sm pl-nm pr-nm' : ''">
    <div :class="isActive ? 'pb-sm' : ''">
      <ul v-if="layoutType == 'default'" class="notifypolicy-box">
        <!-- 【流程设置/节点设置】通知策略样式 -->
        <li>
          <span class="text-grey">{{ $t('page.noticesetting') }}</span>
          <span class="text-href pl-sm" @click="openPersonSettingDialog">{{ $t('page.personalizationsettings') }}</span>
        </li>
        <li>
          <span
            class="tip text-tip pr-xs"
          >{{ isActive == 1 ? $t('page.custom'): $t('term.framework.defaultpolicy') }}</span>
          <i-switch
            v-model="isActive"
            :true-value="1"
            :false-value="0"
            @on-change="changeSwitch"
          ></i-switch>
        </li>
      </ul>
      <ul v-else-if="layoutType == 'flexBetween'" class="notifypolicy-box">
        <!-- 【自动化/时效设置】通知策略样式 -->
        <li>
          <span
            class="tip text-tip pr-xs"
          >{{ isActive == 1 ? $t('page.custom'): $t('term.framework.defaultpolicy') }}</span>
          <i-switch
            v-model="isActive"
            :true-value="1"
            :false-value="0"
            @on-change="changeSwitch"
          ></i-switch>
        </li>
        <li>
          <span class="text-href" @click="openPersonSettingDialog">{{ $t('page.personalizationsettings') }}</span>
        </li>
      </ul>
    </div>
    <template v-if="isActive == 1">
      <div class="notifypolicy-operation-box">
        <TsFormSelect
          ref="notifyPolicy"
          v-model="notifyPolicyConfig.policyId"
          v-bind="notifySelectConfig"
          class="tsformselect-box-width"
          @change="changePolicyId"
          @first="gotoAddNotify()"
        >
        </TsFormSelect>
        <div class="operation-btn-box text-center">
          <span
            class="tsfont-rotate-right text-tip-active"
            :class="canEdit ? 'pr-sm' : ''"
            :title="$t('page.refresh')"
            @click="refreshNotify(notifyPolicyConfig.policyId,notifyPolicyConfig.paramMappingList) "
          ></span>
          <span
            v-if="canEdit"
            class="tsfont-edit text-tip-active"
            :title="$t('page.edit')"
            @click="gotoAddNotify(notifyPolicyConfig.policyId)"
          ></span>
        </div>
      </div>
    </template>
    <PersonSettingsDialog
      v-if="isShowPersonSettingDialog"
      :policyId="notifyPolicyConfig.policyId"
      :border="border"
      :conditionNodeList="conditionNodeList"
      :excludeTriggerList="notifyPolicyConfig.excludeTriggerList"
      :paramMappingList="notifyPolicyConfig.paramMappingList"
      @close="closePersonSettingsDialog"
    ></PersonSettingsDialog>
  </div>

</template>

<script>
import itemmixin from '../itemmixin.js';
export default {
  name: 'NoticeSetting',
  components: {
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    PersonSettingsDialog: resolve => require(['./notice/person-settings-dialog'], resolve) // 个性设置
  },
  mixins: [itemmixin],
  model: {
    prop: 'defaultIsActive',
    event: 'change'
  },
  props: {
    formUuid: {
      type: String || Number,
      default: ''
    },
    config: {
      type: Object,
      default: () => {
        return {};
      }
    },
    handler: String, //搜索通知策略的handler 统一先从config里面取，如果没有才看handler 这个主要是为了兼容实效策略
    border: {
      type: String,
      default: 'border'
    },
    nodeConfig: {
      type: Object
    },
    layoutType: { // 通知策略样式
      type: String,
      default: 'default' // default、flexBetween
    },
    hasPadding: {
      // 是否需要间隙
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isActive: 0,
      notifyPolicyConfig: {
        policyId: null
      },
      conditionNodeList: [], //右边下拉框数据
      paramList: [], //参数列表
      firstText: this.$t('term.process.policy'),
      notifySelectConfig: {
        dynamicUrl: '/api/rest/notify/policy/search',
        filterable: true,
        transfer: true,
        border: this.border,
        valueName: 'id',
        textName: 'name',
        rootName: 'tbodyList',
        validateList: [{ name: 'required', message: ' ' }],
        params: {handler: this.config.handler || this.handler}
      },
      isShowPersonSettingDialog: false,
      tacticsData: {}, // 个性设置
      defaultPolicyId: null, // 默认通知策略的Id
      defaultPolicyName: '', // 默认通知策略的名称
      defaultDeepCloneConfig: this.$utils.deepClone(this.config)
    };
  },

  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.init();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    init() {
      this.getDefaultPolicyId();
      let handler = this.defaultDeepCloneConfig.handler || this.handler;
      this.notifySelectConfig.params.handler = handler;
      this.isActive = this.defaultDeepCloneConfig.isCustom || 0;
      this.$set(this.notifyPolicyConfig, 'paramMappingList', this.defaultDeepCloneConfig.paramMappingList);
      this.$set(this.notifyPolicyConfig, 'isCustom', this.defaultDeepCloneConfig.isCustom);
      this.$set(this.notifyPolicyConfig, 'excludeTriggerList', this.defaultDeepCloneConfig.excludeTriggerList);
      this.$set(this.notifyPolicyConfig, 'handler', handler);
      if (this.defaultDeepCloneConfig.hasOwnProperty('policyId')) {
        this.$set(this.notifyPolicyConfig, 'policyId', this.defaultDeepCloneConfig.policyId);
      }
      if (this.defaultDeepCloneConfig.hasOwnProperty('policyName')) {
        this.$set(this.notifyPolicyConfig, 'policyName', this.defaultDeepCloneConfig.policyName);
      }
      if (this.defaultDeepCloneConfig.hasOwnProperty('policyPath')) {
        this.$set(this.notifyPolicyConfig, 'policyPath', this.defaultDeepCloneConfig.policyPath || '');
      }
    },
    //跳转策略编辑页面
    gotoAddNotify(val) {
      if (val) {
        window.open(HOME + '/framework.html#/notifytactics-edit?id=' + val, '_blank');
      } else {
        let handler = this.defaultDeepCloneConfig.handler || this.handler;
        window.open(HOME + '/framework.html#/notifytactics-overview?addNotify=' + true + '&handler=' + handler, '_blank');
      }
    },
    refreshNotify() { //刷新通知策略
      this.notifyPolicyConfig.paramMappingList = this.getData().paramMappingList;
      this.$refs.notifyPolicy.initDataListByUrl();
      this.$Message.success(this.$t('message.executesuccess'));
    },

    getConditionNode() { //获取参数对应的可选值 条件
      let handler = this.defaultDeepCloneConfig.handler || this.handler;
      if (!handler) {
        return false;
      }
      let formData = { formUuid: this.formUuid, notifyPolicyHandler: handler};
      this.$api.process.process.getNotifyPolicyList(formData).then(res => {
        if (res.Status == 'OK') {
          this.conditionNodeList = res.Return.tbodyList || [];
        }
      });
    },
    getData() { //获取数据
      let data = {
        handler: this.notifyPolicyConfig.handler || '',
        isCustom: this.isActive,
        paramMappingList: this.notifyPolicyConfig.paramMappingList || [],
        excludeTriggerList: this.notifyPolicyConfig.excludeTriggerList || []
      };
      if (this.notifyPolicyConfig.hasOwnProperty('policyId') && this.notifyPolicyConfig.policyId) {
        this.$set(data, 'policyId', this.notifyPolicyConfig.policyId);
      }
      if (this.notifyPolicyConfig.hasOwnProperty('policyName')) {
        this.$set(data, 'policyName', this.notifyPolicyConfig.policyName);
      }
      if (this.notifyPolicyConfig.hasOwnProperty('policyPath')) {
        this.$set(data, 'policyPath', this.notifyPolicyConfig.policyPath);
      }
      Object.assign(data, this.tacticsData);
      return data;
    },
    valid() {
      let isValid = true;
      const data = this.getData();
      if (data && data.isCustom && (this.$refs.notifyPolicy && !this.$refs.notifyPolicy.valid())) {
        // 自定义通知策略，必填
        isValid = false;
      }
      return isValid;
    },
    changeSwitch(isActive) {
      this.tacticsData = {};
      if (isActive) {
        this.notifyPolicyConfig.policyId = null;
        this.notifyPolicyConfig.paramMappingList = [];
        this.notifyPolicyConfig.excludeTriggerList = [];
      } else if (!isActive) {
        // 为空时，需要设置默认参数值
        this.$set(this.notifyPolicyConfig, 'policyId', this.defaultPolicyId);
        this.$set(this.notifyPolicyConfig, 'paramMappingList', !this.defaultDeepCloneConfig.isCustom ? this.defaultDeepCloneConfig.paramMappingList : []);
        this.$set(this.notifyPolicyConfig, 'excludeTriggerList', !this.defaultDeepCloneConfig.isCustom ? this.defaultDeepCloneConfig.excludeTriggerList : []);
        this.$set(this.notifyPolicyConfig, 'policyName', this.defaultPolicyName);
        this.$set(this.notifyPolicyConfig, 'handler', this.defaultDeepCloneConfig.handler);
      }
      this.isActive = isActive;
      this.notifyPolicyConfig.isCustom = this.isActive;
      this.$emit('change', this.isActive);
    },
    openPersonSettingDialog() {
      this.isShowPersonSettingDialog = true;
    },
    closePersonSettingsDialog(needUpdateValue, tacticsData) {
      this.isShowPersonSettingDialog = false;
      if (needUpdateValue) {
        this.tacticsData = tacticsData;
      }
    },
    getDefaultPolicyId() {
      // 获取默认通知策略信息
      let data = {
        handler: this.defaultDeepCloneConfig.handler || this.handler
      };
      if (!data.handler) {
        return false;
      }
      this.defaultPolicyId = null;
      this.defaultPolicyName = '';
      this.$api.framework.tactics.getDefaultPolicy(data).then(res => {
        if (res.Status == 'OK') {
          if (res.Return) {
            this.defaultPolicyId = res.Return.id;
            this.defaultPolicyName = res.Return.name;
          }
        }
      });
    },
    changePolicyId(policyId, valueObject) {
      if (policyId == this.defaultDeepCloneConfig.policyId) {
        // 默认值有，就使用默认值
        this.$set(this.notifyPolicyConfig, 'policyId', policyId);
        this.$set(this.notifyPolicyConfig, 'paramMappingList', !this.defaultDeepCloneConfig.isCustom ? this.defaultDeepCloneConfig.paramMappingList : []);
        this.$set(this.notifyPolicyConfig, 'excludeTriggerList', !this.defaultDeepCloneConfig.isCustom ? this.defaultDeepCloneConfig.excludeTriggerList : []);
      } else {
        // 清空个性化设置值
        this.$set(this.notifyPolicyConfig, 'policyId', policyId || null);
        this.notifyPolicyConfig.paramMappingList = [];
        this.notifyPolicyConfig.excludeTriggerList = [];
        this.notifyPolicyConfig.policyName = (!this.$utils.isEmpty(valueObject) && valueObject.text) || ''; // 用于组合工具，编辑基本信息，值回显
      }
    }
  },
  filter: {},
  computed: {
    canEdit() {
      return !!this.notifyPolicyConfig.policyId;
    }
  },
  watch: {
    config: {
      handler(config) {
        // 解决切换不同的节点，通知策略数据没有变化的问题
        this.defaultDeepCloneConfig = this.$utils.deepClone(config); 
        this.init();
      },
      deep: true
    },
    formUuid(newVal) {
      this.formUuid = newVal;
      this.getConditionNode();
    }
  }
};
</script>
<style lang='less' scoped>
.notice-setting-box {
  .notifypolicy-box {
    display: flex;
    justify-content: space-between;
  }
  .notifypolicy-operation-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .operation-btn-box {
    width: 45px;
  }
  .tsformselect-box-width {
    width: calc(100% - 45px); // 45为 【刷新/编辑】操作按钮的宽度
  }
}

</style>

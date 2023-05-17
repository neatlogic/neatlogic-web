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
      <ul v-else-if="layoutType == 'custom'">
        <!-- 【应用配置/应用信息】通知策略 -->
        <li class="pb-sm">
          <span>{{ $t('page.notify') }}</span>
          <span class="text-href pl-sm" @click="openPersonSettingDialog">{{ $t('page.personalizationsettings') }}</span>
        </li>
        <li>
          <span
            class="tip text-tip pr-xs"
          >{{ isActive == 1 ? ($t('page.custom') + $t('page.notificationstrategy')) : $t('term.framework.defaultpolicy') }}</span>
          <i-switch
            v-model="isActive"
            :true-value="1"
            :false-value="0"
            @on-change="changeSwitch"
          ></i-switch>
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
          @first="gotoAddNotify()"
        >
        </TsFormSelect>
        <div class="operation-btn-box text-center">
          <span
            class="tsfont-rotate-right text-tip-active"
            :class="notifyPolicyConfig.policyId ? 'pr-sm' : ''"
            :title="$t('page.refresh')"
            @click="refreshNotify(notifyPolicyConfig.policyId,notifyPolicyConfig.paramMappingList) "
          ></span>
          <span
            v-if="notifyPolicyConfig.policyId"
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
    layoutType: { // 通知策略样式，模式是流程设置
      type: String,
      default: 'default' // default/
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
      notifyPolicyConfig: {},
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
        validateList: ['required'],
        params: {handler: this.config.handler || this.handler}
      },
      isShowPersonSettingDialog: false,
      tacticsObj: {}, // 个性设置
      defaultPolicyId: null, // 默认通知策略的Id
      defaultDeepCloneConfig: {}
    };
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

    async getConditionNode() { //获取参数对应的可选值 条件
      let handler = this.defaultDeepCloneConfig.handler || this.handler;
      if (!this.defaultDeepCloneConfig || !handler) {
        return;
      }
      let formData = { formUuid: this.formUuid, notifyPolicyHandler: handler};
      this.notifySelectConfig.params.handler = handler;
      this.isActive = this.defaultDeepCloneConfig.isCustom || 0;
      if (!this.isActive && this.$utils.isEmpty(this.defaultPolicyId)) {
        // 为空，默认通知策略时，需要查默认通知策略的名称
        await this.getDefaultPolicyId(handler);
      }
      this.$api.process.process.getNotifyPolicyList(formData).then(res => {
        if (res.Status == 'OK') {
          this.conditionNodeList = res.Return.tbodyList || [];
          this.$set(this.notifyPolicyConfig, 'policyId', (this.defaultDeepCloneConfig.policyId && this.defaultDeepCloneConfig.isCustom) ? this.defaultDeepCloneConfig.policyId : this.defaultPolicyId); // 设置自定义通知策略，使用自定义通知策略，否则使用默认通知策略
          this.$set(this.notifyPolicyConfig, 'paramMappingList', this.defaultDeepCloneConfig.paramMappingList);
          this.$set(this.notifyPolicyConfig, 'isCustom', this.defaultDeepCloneConfig.isCustom);
          this.$set(this.notifyPolicyConfig, 'excludeTriggerList', this.defaultDeepCloneConfig.excludeTriggerList);
        }
      });
    },
    getData() { //获取数据
      let data = {};
      data = {
        policyId: this.notifyPolicyConfig.policyId || this.defaultDeepCloneConfig.defaultPolicyId || undefined,
        policyName: this.notifyPolicyConfig.policyName || undefined,
        policyPath: this.notifyPolicyConfig.policyPath || undefined,
        handler: this.defaultDeepCloneConfig?.handler ? this.defaultDeepCloneConfig.handler : this.handler,
        isCustom: this.isActive,
        ...this.tacticsObj
      };
      return data;
    },
    valid() { //校验
      let isValid = true;
      const data = this.getData();
      console.log('返回的值', data);
      if (data && data.isCustom) {
        // 自定义通知策略，必填
        if (!data.hasOwnProperty('paramMappingList') || (data.hasOwnProperty('paramMappingList') && this.$utils.isEmpty(data.paramMappingList))) {
          isValid = false;
        } else if (!this.$utils.isEmpty(data.paramMappingList) && this.$utils.isEmpty(data.paramMappingList.filter((item) => !item.value))) {
          isValid = false;
        } else {
          isValid = true;
        }
      }
      console.log('返回的值', isValid);
      return isValid;
    },
    changeSwitch(isActive) {
      this.tacticsObj = {};
      if (isActive) {
        this.notifyPolicyConfig.policyId = null;
        this.notifyPolicyConfig.paramMappingList = [];
        this.notifyPolicyConfig.excludeTriggerList = [];
      } else if (!isActive) {
        // 为空时，需要设置默认参数值
        this.$set(this.notifyPolicyConfig, 'policyId', this.defaultPolicyId);
        this.$set(this.notifyPolicyConfig, 'paramMappingList', !this.defaultDeepCloneConfig.isCustom ? this.defaultDeepCloneConfig.paramMappingList : []);
        this.$set(this.notifyPolicyConfig, 'excludeTriggerList', !this.defaultDeepCloneConfig.isCustom ? this.defaultDeepCloneConfig.excludeTriggerList : []);
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
        this.tacticsObj = tacticsData;
      }
    },
    getDefaultPolicyId(handler) {
      let data = {
        handler: handler,
        needPage: false
      };
      let notifyList = [];
      this.defaultPolicyId = null;
      return this.$api.framework.tactics.searchNotifyList(data).then(res => {
        if (res.Status == 'OK') {
          notifyList = res.Return.tbodyList;
          if (!this.$utils.isEmpty(notifyList)) {
            notifyList.forEach((item) => {
              if (item && item.isDefault) {
                this.defaultPolicyId = item.id;
              }
            });
          }
        }
      });
    }
  },
  filter: {},
  computed: {},
  watch: {
    formUuid(newVal) {
      this.formUuid = newVal;
      this.getConditionNode();
    },
    config: {
      handler(newVal) {
        this.defaultDeepCloneConfig = this.$utils.deepClone(newVal);
        this.getConditionNode();
      },
      deep: true,
      immediate: true
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

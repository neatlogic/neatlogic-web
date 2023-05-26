<template>
  <div class="padding">
    <ul>
      <li class="mb-sm">
        <span class="pr-sm">{{ $t('page.notify') }}</span>
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
        <span v-if="isActive" class="text-href pl-sm" @click="openNoticePolicyDialog">{{ $t('page.edit') }}</span>
        <span v-else class="text-href pl-sm" @click="openPersonSettingDialog">{{ $t('page.personalizationsettings') }}</span>
      </li>
      <li v-if="policyName" class="mt-sm">
        <span class="text-tip pr-sm">{{ $t('page.notificationstrategy') }}</span>
        <span>{{ policyName }}</span>
      </li>
    </ul>
    <PersonSettingsDialog
      v-if="isShowPersonSettingDialog"
      :policyId="notifyPolicyConfig.policyId"
      :conditionNodeList="conditionNodeList"
      :excludeTriggerList="notifyPolicyConfig.excludeTriggerList"
      :paramMappingList="notifyPolicyConfig.paramMappingList"
      @close="closePersonSettingsDialog"
    ></PersonSettingsDialog>
    <DeployNoticeEditDialog
      v-if="isEditNoticePolicy"
      :appSystemId="appSystemId"
      @close="closeDeployNoticeEditDialog"
    ></DeployNoticeEditDialog>
  </div>
</template>
<script>

export default {
  name: '',
  components: {
    PersonSettingsDialog: resolve => require(['@/views/pages/process/flow/flowedit/components/nodesetting/notice/person-settings-dialog.vue'], resolve), // 个性设置
    DeployNoticeEditDialog: resolve => require(['@/views/pages/process/flow/flowedit/components/nodesetting/notice/deploy-notice-edit-dialog.vue'], resolve) // 编辑自定义通知策略

  },
  props: {
    appSystemId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      isActive: 1,
      policyName: '',
      isEditNoticePolicy: false,
      defaultPolicyId: null,
      defaultPolicyName: '',
      defaultDeepCloneConfig: {},
      notifyPolicyConfig: {
        // 通知策略配置信息
        isCustom: 0,
        policyId: null,
        policyName: '',
        policyPath: '',
        handler: 'neatlogic.module.deploy.notify.handler.DeployJobNotifyPolicyHandler',
        paramMappingList: [],
        excludeTriggerList: []
      },
      conditionNodeList: [],
      isShowPersonSettingDialog: false
    };
  },
  beforeCreate() {},
  created() {
    this.initData();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async initData() {
      await this.getAppSystemNotifyId();
      await this.getDefaultPolicyId();
    },
    getAppSystemNotifyId() {
      // 获取发布应用的通知策略id
      if (this.$utils.isEmpty(this.appSystemId)) {
        return false;
      }
      return this.$api.deploy.applicationConfig.getAppSystemNotifyId({appSystemId: this.appSystemId}).then((res) => {
        if (res.Status == 'OK') {
          Object.assign(this.notifyPolicyConfig, res.Return);
          this.isActive = this.notifyPolicyConfig.isCustom;
          if (this.isActive) {
            this.policyName = this.notifyPolicyConfig.policyName;
          }
          this.defaultDeepCloneConfig = res.Return;
        }
      });
    },
    getConditionNodeList() {
      return this.$api.process.process.getNotifyPolicyList({notifyPolicyHandler: this.notifyPolicyConfig.handler}).then(res => {
        if (res.Status == 'OK') {
          this.conditionNodeList = res.Return.tbodyList || [];
        }
      });
    },
    getDefaultPolicyId() {
      // 获取默认通知策略信息
      let data = {
        handler: this.notifyPolicyConfig.handler
      };
      if (!data.handler) {
        return false;
      }
      this.defaultPolicyId = null;
      this.defaultPolicyName = '';
      return this.$api.framework.tactics.getDefaultPolicy(data).then(res => {
        if (res.Status == 'OK') {
          if (res.Return) {
            this.defaultPolicyId = res.Return.id;
            this.defaultPolicyName = res.Return.name;
            if (!this.notifyPolicyConfig.policyId) {
              this.notifyPolicyConfig.policyId = res.Return.id;
              this.notifyPolicyConfig.policyName = res.Return.name;
              this.notifyPolicyConfig.isCustom = 0;
            }
          }
        }
      });
    },
    saveDefaultNoticePolicy(tacticsData) {
      // 保存默认通知策略，个性化设置
      let param = {
        appSystemId: this.appSystemId,
        policyId: this.notifyPolicyConfig.policyId,
        policyName: this.notifyPolicyConfig.policyName,
        isCustom: this.notifyPolicyConfig.isCustom,
        ...tacticsData
      };
      this.$api.deploy.applicationConfig.saveAppSystemNotify(param).then((res) => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
        }
      });
    },
    async openPersonSettingDialog() {
      await this.getAppSystemNotifyId();
      await this.getConditionNodeList();
      this.isShowPersonSettingDialog = true;
    },
    closePersonSettingsDialog(needUpdateValue, tacticsData) {
      this.isShowPersonSettingDialog = false;
      if (needUpdateValue) {
        this.saveDefaultNoticePolicy(tacticsData);
      }
    },
    closeDeployNoticeEditDialog(policyName) {
      this.isEditNoticePolicy = false;
      if (!this.$utils.isEmpty(policyName)) {
        this.policyName = policyName;
      }
    },
    changeSwitch(isActive) {
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
        this.policyName = '';
      }
      this.notifyPolicyConfig.isCustom = this.isActive;
    },
    openNoticePolicyDialog() {
      this.isEditNoticePolicy = true;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less">
</style>

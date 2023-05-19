<template>
  <div class="deploy-notice-edit-dialog-box">
    <TsDialog
      :title="$t('page.noticesetting')"
      type="modal"
      :isShow="showDialog"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot>
        <div>
          <TsForm
            ref="form"
            :item-list="formItemList"
          >
            <template v-slot:personalizationsettings>
              <span class="text-href" @click="openPersonSettingDialog">{{ $t('page.personalizationsettings') }}</span>
            </template>
            <template v-slot:policyId>
              <div style="position:relative;">
                <TsFormSelect
                  ref="notifyPolicyId"
                  v-model="notifyPolicyConfig.policyId"
                  v-bind="notifySelectConfig"
                  @change="changePolicyId"
                  @first="gotoAddNotify()"
                >
                </TsFormSelect>
                <div style="position: absolute;top: -27px; right: 0;">
                  <span
                    class="tsfont-rotate-right text-tip-active"
                    :class="notifyPolicyConfig.policyId ? 'pr-sm' : ''"
                    :title="$t('page.refresh')"
                    @click="refreshNotify"
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
          </TsForm>
        </div>
      </template>
    </TsDialog>
    <PersonSettingsDialog
      v-if="isShowPersonSettingDialog"
      :policyId="notifyPolicyConfig.policyId"
      :conditionNodeList="conditionNodeList"
      :excludeTriggerList="notifyPolicyConfig.excludeTriggerList"
      :paramMappingList="notifyPolicyConfig.paramMappingList"
      @close="closePersonSettingsDialog"
    ></PersonSettingsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    PersonSettingsDialog: resolve => require(['@/views/pages/process/flow/flowedit/components/nodesetting/notice/person-settings-dialog.vue'], resolve) // 个性设置
  },
  props: {
    appSystemId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      showDialog: true,
      isShowPersonSettingDialog: false,
      tacticsData: {},
      defaultNotifyPolicyConfig: {
        // 初始化的通知策略值
        isCustom: 1,
        policyId: null,
        policyName: '',
        policyPath: '',
        handler: 'neatlogic.module.deploy.notify.handler.DeployJobNotifyPolicyHandler',
        paramMappingList: [],
        excludeTriggerList: []
      },
      notifyPolicyConfig: {
        // 通知策略配置信息
        isCustom: 1,
        policyId: null,
        policyName: '',
        policyPath: '',
        handler: 'neatlogic.module.deploy.notify.handler.DeployJobNotifyPolicyHandler',
        paramMappingList: [],
        excludeTriggerList: []
      },
      notifySelectConfig: {
        dynamicUrl: '/api/rest/notify/policy/search',
        filterable: true,
        transfer: true,
        valueName: 'id',
        textName: 'name',
        rootName: 'tbodyList',
        validateList: ['required'],
        params: {handler: 'neatlogic.module.deploy.notify.handler.DeployJobNotifyPolicyHandler'}
      },
      formItemList: [
        {
          name: 'personalizationsettings',
          label: this.$t('page.personalizationsettings'),
          type: 'slot'
        },
        {
          name: 'policyId',
          label: this.$t('page.notificationstrategy'),
          type: 'slot',
          validateList: ['required']
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    this.getAppSystemNotifyId();
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
    closeDialog() {
      this.showDialog = false;
      this.$emit('close');
    },
    okDialog() {
      let notifyPolicyId = this.$refs.notifyPolicyId;
      if (notifyPolicyId && !notifyPolicyId.valid()) {
        return false;
      }
      this.saveDefaultNoticePolicy();
    },
    gotoAddNotify(val) {
      if (val) {
        window.open(HOME + '/framework.html#/notifytactics-edit?id=' + val, '_blank');
      } else {
        window.open(HOME + '/framework.html#/notifytactics-overview?addNotify=' + true + '&handler=' + this.notifyPolicyConfig.handler, '_blank');
      }
    },
    refreshNotify() { 
      //刷新通知策略
      this.$refs.notifyPolicyId.initDataListByUrl();
      this.$Message.success(this.$t('message.executesuccess'));
    },
    async openPersonSettingDialog() {
      await this.getConditionNodeList();
      // 切换通知策略，清空个性化设置
      if (this.defaultNotifyPolicyConfig.policyId == this.notifyPolicyConfig.policyId) {
        this.notifyPolicyConfig.paramMappingList = this.defaultNotifyPolicyConfig.paramMappingList;
        this.notifyPolicyConfig.excludeTriggerList = this.defaultNotifyPolicyConfig.excludeTriggerList;
      } else {
        this.notifyPolicyConfig.paramMappingList = [];
        this.notifyPolicyConfig.excludeTriggerList = [];
      }
      this.isShowPersonSettingDialog = true;
    },
    changePolicyId(policyId, valueConfig) {
      this.notifyPolicyConfig.policyId = policyId;
      this.notifyPolicyConfig.policyName = (valueConfig && valueConfig.text) || '';
    },
    getAppSystemNotifyId() {
      // 获取发布应用的通知策略id
      if (this.$utils.isEmpty(this.appSystemId)) {
        return false;
      }
      return this.$api.deploy.applicationConfig.getAppSystemNotifyId({appSystemId: this.appSystemId}).then((res) => {
        if (res.Status == 'OK') {
          if (res.Return && res.Return.isCustom) { // 拿到自定义参数值
            Object.assign(this.notifyPolicyConfig, res.Return);
            Object.assign(this.defaultNotifyPolicyConfig, this.$utils.deepClone(res.Return || {}));
          }
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
    saveDefaultNoticePolicy() {
      // 保存默认通知策略，个性化设置
      let param = {
        appSystemId: this.appSystemId,
        policyId: this.notifyPolicyConfig.policyId,
        policyName: this.notifyPolicyConfig.policyName,
        isCustom: this.notifyPolicyConfig.isCustom,
        ...this.tacticsData
      };
      this.$api.deploy.applicationConfig.saveAppSystemNotify(param).then((res) => {
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.$emit('close', param.policyName);
        }
      });
    },
    closePersonSettingsDialog(needUpdateValue, tacticsData) {
      this.isShowPersonSettingDialog = false;
      if (needUpdateValue) {
        this.tacticsData = tacticsData;
      }
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>

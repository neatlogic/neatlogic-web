
<template>
  <div>
    <div class="control-box">
      <div class="control-setting">
        <span class="label">
          <span>{{ $t('term.process.recreatenewjob') }}</span>
          <Tooltip
            max-width="300"
            :content="$t('message.process.recreatenewjobtip')"
            theme="light"
            placement="bottom"
            :transfer="true"
          >
            <span class="text-href tsfont-info-o"></span>
          </Tooltip>
        </span>
        <span class="control-btn">
          <TsFormSwitch v-model="autoexecConfig.rerunStepToCreateNewJob"></TsFormSwitch>
        </span>
      </div>
    </div>
    <div class="permission-list">
      <div class="list">
        <div class="second-title text-grey require-label">{{ $t('page.failurestrategy') }}</div>
        <div class="input-border">
          <TsFormSelect
            ref="failPolicy"
            v-model="autoexecConfig.failPolicy"
            :dataList="failPolicyList"
            :validateList="validateList"
            border="border"
          > </TsFormSelect>
        </div>
      </div>
    </div>
    <div id="autoexecConfig">
      <div class="autoexecConfig-top">
        <div class="require-label text-grey">{{ $t('term.inspect.jobdetail') }}</div>
        <div class="text-href" @click="editAutoexecList">{{ autoexecConfig.configList.length > 0? $t('page.edit') : $t('term.deploy.clickadd') }}</div>
      </div>
      <div v-if="autoexecConfig.configList && autoexecConfig.configList.length > 0" class="pl-nm pr-nm">
        <div
          v-for="item in autoexecConfig.configList"
          :key="item.uuid"
          class="overflow pb-sm"
          :title="item.jobName"
        >
          {{ item.jobName }}
        </div>
      </div>
      <div v-if="!isValid && $utils.isEmpty(autoexecConfig.configList)" class="form-error-tip pl-nm">
        {{ $t('form.validate.leastonetarget', {'target': $t('term.autoexec.job')}) }}
      </div>
    </div>
    <ConfigListDialog
      v-if="isShow"
      :formUuid="formUuid"
      :list="autoexecConfig.configList"
      @close="closeConfigList"
    ></ConfigListDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    ConfigListDialog: () => import('./setting/config-list-dialog.vue'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  filters: {
  },
  props: {
    defaultAutoexecConfig: Object,
    allPrevNodes: Array, //所有前置节点，用于判断是否是开始节点
    uuid: String, //节点uuid
    formUuid: String
  },
  data() {
    return {
      validateList: ['required'],
      autoexecConfig: {
        failPolicy: null,
        rerunStepToCreateNewJob: 0,
        configList: []
      },
      failPolicyList: [], //失败策略
      isShow: false,
      isValid: true //校验
    };
  },
  beforeCreate() {},
  created() {
    this.getFailPolicyList();
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
    initData(val) {
      let config = this.$utils.deepClone(val);
      if (val) {
        Object.keys(this.autoexecConfig).forEach(key => {
          if (config[key]) {
            this.autoexecConfig[key] = config[key];
          }
        });
      }
    },
    getFailPolicyList() {
      let data = {
        enumClass: 'neatlogic.module.autoexec.constvalue.FailPolicy'
      };
      this.$api.common.getSelectList(data).then((res) => {
        if (res.Status == 'OK') {
          let failPolicyList = res.Return || [];
          let newfailPolicyList = [];
          let isBack = false;
          if (this.nodeAllLinksList && this.nodeAllLinksList.length > 0) {
            this.nodeAllLinksList.forEach(item => {
              if (item.config.type == 'backward') {
                isBack = true;
              }
            });
          }
          if (!isBack) {
            newfailPolicyList = failPolicyList.filter(f => f.value != 'back');
          } else {
            newfailPolicyList = failPolicyList;
          }
          this.failPolicyList = newfailPolicyList;
        }
      });
    },
    editAutoexecList() {
      this.isShow = true;
    },
    closeConfigList(list) {
      if (list) {
        this.$set(this.autoexecConfig, 'configList', list);
      }
      this.isShow = false;
    },
    autoexecConfigValid() { //校验
      this.isValid = true;
      if (this.$utils.isEmpty(this.autoexecConfig.configList)) {
        this.isValid = false;
      }
      return this.isValid;
    },
    saveAutoexecConfig() {
      return this.autoexecConfig;
    }
  },
  computed: {},
  watch: {
    defaultAutoexecConfig: {
      handler(val) {
        if (val && JSON.stringify(val) != '{}') {
          this.initData(val);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
.autoexecConfig-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
}
</style>

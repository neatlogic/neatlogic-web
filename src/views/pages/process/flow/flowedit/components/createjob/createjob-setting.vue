<template>
  <div id="createJobConfig" class="pl-nm pr-nm">
    <div class="pb-xs">
      <TsFormItem :label="$t('term.process.recreatenewjob')" tooltip="$t('message.process.recreatenewjobtip')" labelPosition="left">
        <TsFormSwitch v-model="createJobConfig.rerunStepToCreateNewJob" class="text-right"></TsFormSwitch>
      </TsFormItem>
    </div>
    <div class="pb-sm">
      <TsFormItem :label="$t('page.failurestrategy')" labelPosition="top" required>
        <TsFormSelect
          ref="failPolicy"
          v-model="createJobConfig.failPolicy"
          :dataList="failPolicyList"
          :validateList="validateList"
          border="border"
        > </TsFormSelect>
      </TsFormItem>
    </div>
    <div id="createJobConfig">
      <div class="createJobConfig-top flex-between pb-xs">
        <div class="require-label text-grey">{{ $t('term.inspect.jobdetail') }}</div>
        <div class="text-href" @click="isShow = true">{{ createJobConfig.configList.length > 0? $t('page.edit') : $t('page.add') }}</div>
      </div>
      <div v-if="createJobConfig.configList && createJobConfig.configList.length > 0">
        <div
          v-for="(item,index) in createJobConfig.configList"
          :key="index"
          class="overflow pb-sm"
          :title="item.jobName"
        >
          {{ item.jobName }}
        </div>
      </div>
      <div v-if="!isValid && $utils.isEmpty(createJobConfig.configList)" class="form-error-tip pl-nm">
        {{ $t('form.validate.leastonetarget', {'target': $t('term.autoexec.job')}) }}
      </div>
    </div>
    <ConfigListDialog
      v-if="isShow"
      :formUuid="formUuid"
      :list="createJobConfig.configList"
      @close="closeConfigList"
    ></ConfigListDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSwitch: () => import('@/resources/plugins/TsForm/TsFormSwitch'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    ConfigListDialog: () => import('./config-list-dialog.vue')
  },
  filters: {
  },
  props: {
    formUuid: String,
    defaultCreateJobConfig: Object
  },
  data() {
    return {
      validateList: ['required'],
      createJobConfig: {
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
        Object.keys(this.createJobConfig).forEach(key => {
          if (config[key]) {
            this.createJobConfig[key] = config[key];
          }
        });
      }
    },
    getFailPolicyList() {
      let data = {
        enumClass: 'FailPolicy'
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
          //判断是否有回退线
          if (!isBack) {
            newfailPolicyList = failPolicyList.filter(f => f.value != 'back');
          } else {
            newfailPolicyList = failPolicyList;
          }
          this.failPolicyList = newfailPolicyList;
        }
      });
    },
    closeConfigList(list) {
      if (list) {
        this.$set(this.createJobConfig, 'configList', list);
      }
      this.isShow = false;
    },
    createJobConfigValid() { //校验
      this.isValid = true;
      if (this.$utils.isEmpty(this.createJobConfig.configList)) {
        this.isValid = false;
      }
      if (this.$refs.failPolicy && !this.$refs.failPolicy.valid()) {
        this.isValid = false;
      }
      return this.isValid;
    },
    saveData() {
      return this.createJobConfig;
    }
  },
  computed: {},
  watch: {
    defaultCreateJobConfig: {
      handler(val) {
        if (!this.$utils.isEmpty(val)) {
          this.initData(val);
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>

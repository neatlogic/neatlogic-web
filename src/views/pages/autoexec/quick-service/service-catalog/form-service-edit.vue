<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <ExpiredReasonAlert :serviceData="serviceData"></ExpiredReasonAlert>
    <div class="radius-lg bg-op padding">
      <div class="flex-between" :class="unfoldAndFold.jobName ? 'mb-sm' : ''">
        <span class="tsfont-biaoti">
          {{ $t('term.autoexec.job') }}
          <i class="require-label"></i>
        </span>
        <span class="tsfont-down cursor" :class="unfoldAndFold.jobName ? 'tsfont-down' : 'tsfont-up'" @click.stop="handleUnfoldAndFold('jobName')"></span>
      </div>
      <TsFormItem
        v-show="unfoldAndFold.jobName"
        label=""
        :required="true"
        :labelWidth="0"
      >
        <TsFormInput
          ref="jobName"
          v-model="jobName"
          border="border"
          v-bind="jobNameForm"
        ></TsFormInput>
      </TsFormItem>
    </div>
    <div class="radius-lg bg-op padding mt-nm">
      <div class="flex-between" :class="unfoldAndFold.formParam ? 'mb-sm' : ''">
        <span class="tsfont-formlist">
          {{ $t('page.inputparam') }}
          <i class="require-label"></i>
        </span>
        <span class="tsfont-down cursor" :class="unfoldAndFold.formParam ? 'tsfont-down' : 'tsfont-up'" @click.stop="handleUnfoldAndFold('formParam')"></span>
      </div>
      <template v-if="!$utils.isEmpty(formConfig)">
        <TsSheet
          v-show="unfoldAndFold.formParam"
          ref="formSheet"
          mode="read"
          :value="formConfig"
          :data="formAttributeData"
          class="pl-sm pr-sm"
        ></TsSheet>
      </template>
    </div>
    <div class="radius-lg bg-op padding mt-nm">
      <div class="flex-between" :class="unfoldAndFold.otherParam ? 'mb-sm' : ''">
        <span class="tsfont-adjust">{{ $t('term.autoexec.otherparam') }}</span>
        <span class="tsfont-down cursor" :class="unfoldAndFold.otherParam ? 'tsfont-down' : 'tsfont-up'" @click.stop="handleUnfoldAndFold('otherParam')"></span>
      </div>
      <div v-if="unfoldAndFold.otherParam">
        <FormOtherParams v-if="!$utils.isEmpty(serviceData)" :serviceData="serviceData"></FormOtherParams>
      </div>
    </div>
    <SaveSetting v-if="isSaveDialog" v-model="isSaveDialog" @on-ok="okSave"></SaveSetting>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsSheet: () => import('@/resources/plugins/TsSheet/TsSheet.vue'),
    SaveSetting: () => import('@/views/pages/autoexec/detail/runnerDetail/save-setting.vue'),
    FormOtherParams: () => import('./other-params'), // 其他参数
    ExpiredReasonAlert: () => import('./expired-reason-alert') // 服务失效原因提示列表
  },
  mixins: [],
  props: {
    serviceData: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      loadingShow: false,
      isSaveDialog: false,
      jobName: '', // 作业名称
      formConfig: {},
      formAttributeData: {}, // 表单数据
      unfoldAndFold: {
        // 展开收起
        jobName: true,
        formParam: true,
        otherParam: true
      },
      jobNameForm: [
        {
          maxlength: 50,
          validateList: ['required', 'name-special']
        }
      ]
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
    initData() {
      // 初始化
      this.jobName = '';
      this.unfoldAndFold = {
        // 展开收起
        jobName: true,
        formParam: true,
        otherParam: true
      };
      if (!this.$utils.isEmpty(this.serviceData) && this.serviceData.formUuid) {
        this.getFormListByFormUuid(this.serviceData.formUuid);
      }
      if (!this.$utils.isEmpty(this.serviceData) && this.serviceData.combopName) {
        this.jobName = this.serviceData.combopName;
      }
    },
    getFormListByFormUuid(uuid) {
      // 根据表单id获取表单列表
      if (uuid) {
        this.$api.framework.form.getFormByVersionUuid({ uuid: uuid }).then(res => {
          if (res.Status == 'OK') {
            this.formConfig = res.Return.formConfig;
          }
        });
      }
    },
    handleUnfoldAndFold(moduleName) {
      // 展开收起
      if (this.unfoldAndFold.hasOwnProperty(moduleName)) {
        this.unfoldAndFold[moduleName] = !this.unfoldAndFold[moduleName];
      }
    },
    formValid() {
      let isValid = true;
      let errorMap = this.$refs.formSheet.validData();
      let nameValid = this.$refs.jobName.valid();
      if (!nameValid) {
        if (!this.unfoldAndFold['jobName']) {
          this.handleUnfoldAndFold('jobName');
        }
        isValid = false;
      }
      if (!this.$utils.isEmpty(errorMap)) {
        if (!this.unfoldAndFold['formParam']) {
          this.handleUnfoldAndFold('formParam'); // 验证不通过并且收起时，需要打开对应的模块
        }
        isValid = false;
      }
      return isValid;
    },
    saveService() {
      // 保存
      if (!this.formValid()) {
        return false;
      }
      this.isSaveDialog = true;
    },
    saveExecuteService(data) {
      // 立即执行
      if (!this.formValid()) {
        return false;
      }
      let formAttributeDataList = this.$refs.formSheet.getFormData();
      let hidecomponentList = this.$refs.formSheet.getHiddenComponents();
      let readcomponentList = this.$refs.formSheet.getReadComponents();
      let params = {
        serviceId: this.serviceData.id,
        name: this.jobName,
        formAttributeDataList: formAttributeDataList || [],
        hidecomponentList: hidecomponentList || [],
        readcomponentList: readcomponentList || [],
        planStartTime: data ? data.planStartTime : null,
        triggerType: data ? data.triggerType : null
      };
      this.$api.autoexec.catalogManage
        .saveJobCreate(params)
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.addsuccess'));
            this.$router.push({
              path: '/job-detail',
              query: {id: res.Return.jobId}
            });
          }
        })
        .finally(() => {
          this.loadingShow = false;
        });
    },
    okSave(dataObj) {
      // 保存，添加执行时间和执行方式保存按钮
      this.saveExecuteService(dataObj);
    }
  },
  filter: {},
  computed: {},
  watch: {
    serviceData: {
      handler() {
        this.initData();
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
</style>

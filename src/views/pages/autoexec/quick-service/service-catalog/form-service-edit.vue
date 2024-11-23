<template>
  <div>
    <Loading :loadingShow="loadingShow" type="fix"></Loading>
    <ExpiredReasonAlert :serviceData="defaultData"></ExpiredReasonAlert>
    <div :class="getPaddingClass">
      <div :class="getFlexClass(unfoldAndFold.jobName)">
        <template v-if="border !='border'">
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.jobName)" @click.stop="handleUnfoldAndFold('jobName')"></span>
          <Divider orientation="left" style="border-collapse: initial;"><span>{{ $t('term.autoexec.job') }}<i class="require-label"></i></span></Divider>
        </template>
        <template v-else>
          <span class="tsfont-biaoti">
            {{ $t('term.autoexec.job') }}
            <i class="require-label"></i>
          </span>
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.jobName)" @click.stop="handleUnfoldAndFold('jobName')"></span>
        </template>
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
    <div :class="[getPaddingClass, getMtnmClass]">
      <div :class="getFlexClass(unfoldAndFold.formParam)">
        <template v-if="border !='border'">
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.formParam)" @click.stop="handleUnfoldAndFold('formParam')"></span>
          <Divider orientation="left" style="border-collapse: initial;"><span>{{ $t('page.inputparam') }} </span></Divider>
        </template>
        <template v-else>
          <span class="tsfont-formlist">
            {{ $t('page.inputparam') }}
            <i class="require-label"></i>
          </span>
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.formParam)" @click.stop="handleUnfoldAndFold('formParam')"></span>
        </template>
      </div>
      <div v-if="!$utils.isEmpty(formConfig)">
        <TsSheet
          v-show="unfoldAndFold.formParam"
          ref="formSheet"
          mode="read"
          :value="formConfig"
          :data="formAttributeData"
          class="pl-sm pr-sm"
          @setValue="handleTsSheetData"
        ></TsSheet>
      </div>
    </div>
    <div :class="[getPaddingClass, getMtnmClass]">
      <div :class="getFlexClass(unfoldAndFold.otherParam)">
        <template v-if="border !='border'">
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.otherParam)" @click.stop="handleUnfoldAndFold('otherParam')"></span>
          <Divider orientation="left" style="border-collapse: initial;"><span>{{ $t('term.autoexec.otherparam') }}</span></Divider>
        </template>
        <template v-else>
          <span class="tsfont-adjust">{{ $t('term.autoexec.otherparam') }}</span>
          <span class="tsfont-down cursor" :class="getDownUpClass(unfoldAndFold.otherParam)" @click.stop="handleUnfoldAndFold('otherParam')"></span>
        </template>
      </div>
      <div v-if="unfoldAndFold.otherParam">
        <FormOtherParams v-if="!$utils.isEmpty(defaultData)" :serviceData="defaultData"></FormOtherParams>
      </div>
    </div>
    <SaveSetting v-if="isSaveDialog" v-model="isSaveDialog" @on-ok="okSave"></SaveSetting>
  </div>
</template>
<script>
import serviceMixin from '@/views/pages/autoexec/quick-service/service-catalog/service-mixin.js';
export default {
  name: '',
  components: {
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormInput: () => import('@/resources/plugins/TsForm/TsFormInput'),
    TsSheet: () => import('@/resources/plugins/TsSheet/TsSheet.vue'),
    SaveSetting: () => import('@/views/pages/autoexec/detail/runnerDetail/save-setting.vue'),
    FormOtherParams: () => import('@/views/pages/autoexec/quick-service/service-catalog/other-params'), // 其他参数
    ExpiredReasonAlert: () => import('@/views/pages/autoexec/quick-service/service-catalog/expired-reason-alert') // 服务失效原因提示列表
  },
  mixins: [serviceMixin],
  props: {},
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
  created() {},
  beforeMount() {},
  async mounted() {
    await this.initData();
    let {formAttributeDataList = []} = this.serviceData || {};
    this.formAttributeData = formAttributeDataList;
    this.$nextTick(() => {
      this.$emit('set-value', this.saveData());
    });
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    handleTsSheetData() {
      this.$emit('set-value', this.saveData());
    },
    initData() {
      // 初始化
      this.jobName = '';
      this.unfoldAndFold = {
        // 展开收起
        jobName: true,
        formParam: true,
        otherParam: true
      };
      let {formUuid = '', combopName = ''} = this.defaultData || {};
      if (!this.$utils.isEmpty(combopName)) {
        this.jobName = combopName;
      }
      if (!this.$utils.isEmpty(formUuid)) {
        return this.$api.framework.form.getFormByVersionUuid({ uuid: formUuid }).then(res => {
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
    async valid() {
      let isValid = true;
      let formSheet = this.$refs.formSheet;
      let errorMap = formSheet.validData ? await formSheet.validData() : '';
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
      if (!this.valid()) {
        return false;
      }
      this.isSaveDialog = true;
    },
    saveData() {
      // 提供给外部使用
      let formSheet = this.$refs?.formSheet || '';
      let formAttributeDataList = formSheet ? formSheet.getFormData() : [];
      let hidecomponentList = formSheet ? formSheet.getHiddenComponents() : [];
      let readcomponentList = formSheet ? formSheet.getReadComponents() : [];
      let params = {
        serviceId: '',
        name: this.jobName,
        formAttributeDataList: formAttributeDataList || [],
        hidecomponentList: hidecomponentList || [],
        readcomponentList: readcomponentList || []
      };
      return params;
    },
    saveExecuteService(data) {
      // 立即执行
      if (!this.valid()) {
        return false;
      }
      let formAttributeDataList = this.$refs.formSheet.getFormData();
      let hidecomponentList = this.$refs.formSheet.getHiddenComponents();
      let readcomponentList = this.$refs.formSheet.getReadComponents();
      let params = {
        serviceId: this.defaultData.id,
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
  computed: {
    getMtnmClass() {
      return this.border == 'border' ? 'mt-nm' : '';
    },
    getPaddingClass() {
      return this.border == 'border' ? 'radius-lg bg-op padding' : '';
    }
  },
  watch: {
    defaultData: {
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

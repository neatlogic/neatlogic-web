<template>
  <div>
    <TsForm
      ref="baseFormConfig"
      v-model="baseParams"
      :labelWidth="labelWidth"
      :labelPosition="labelPosition"
      :itemList="baseFormConfig"
    ></TsForm>
    <div v-if="baseParams.type == 'general'" class="pt-nm">
      <TsForm
        ref="generalFormConfig"
        :itemList="generalFormConfig"
        :labelWidth="labelWidth"
        :labelPosition="labelPosition"
      ></TsForm>
    </div>
    <div v-else class="pt-nm">
      <TsForm
        ref="pipelineFormConfig"
        :itemList="pipelineFormConfig"
        :labelWidth="labelWidth"
        :labelPosition="labelPosition"
      ></TsForm>
    </div>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  props: {
    labelWidth: {
      type: Number,
      default: 120
    },
    labelPosition: {
      type: String,
      default: 'right'
    },
    defaultParams: Object,
    disabled: {
      type: Boolean, 
      default: false
    }
  },
  data() {
    let _this = this;
    return {
      baseParams: {
        isActive: 1,
        type: 'general'
      },
      baseFormConfig: {
        name: {
          type: 'text',
          label: this.$t('page.name'),
          validateList: ['required'],
          disabled: this.disabled
        },
        isActive: {
          type: 'radio',
          label: this.$t('page.status'),
          dataList: [
            { value: 1, text: this.$t('page.enable') },
            { value: 0, text: this.$t('page.disable') }
          ],
          validateList: ['required'],
          disabled: this.disabled
        },
        cron: {
          type: 'quartz',
          label: this.$t('term.autoexec.timingplan'),
          validateList: ['required'],
          showType: this.disabled ? 'read' : 'edit'
        },
        beginTime: {
          type: 'datetime',
          label: this.$t('term.autoexec.planstarttime'),
          value: '',
          transfer: true,
          disabled: this.disabled
        },
        endTime: {
          type: 'datetime',
          label: this.$t('term.autoexec.planendtime'),
          value: '',
          transfer: true,
          options: {
            disabledDate(date) {
              if (_this.baseFormConfig.beginTime.value) {
                // 设置结束时间要大于开始时间
                return date && date.valueOf() < new Date(_this.baseFormConfig.beginTime.value).valueOf() + 1 * 60 * 60 * 1000;
              } else {
                return '';
              }
            }
          },
          disabled: this.disabled
        },
        type: {
          type: 'radio',
          label: this.$t('term.deploy.jobtype'),
          url: '/api/rest/universal/enum/get',
          params: { enumClass: 'ScheduleType' },
          validateList: ['required'],
          disabled: this.disabled
        }
      },
      generalFormConfig: {
        appSystemId: {
          type: 'select',
          label: this.$t('page.apply'),
          value: null,
          validateList: ['required'],
          dynamicUrl: '/api/rest/deploy/app/config/appsystem/search',
          dealDataByUrl: (nodeList) => { return this.dealDataByUrl(nodeList, 'app'); },
          rootName: 'tbodyList',
          border: 'border',
          transfer: true,
          disabledHoverTitle: this.$t('term.deploy.currentapplynotconfig'),
          onChange: (val) => {
            this.handleModuleParams(val);
          }
        },
        appModuleId: {
          label: this.$t('page.module'),
          type: 'select',
          value: null,
          validateList: ['required'],
          dynamicUrl: '/api/rest/deploy/app/config/module/list',
          params: {appSystemId: null},
          dealDataByUrl: (nodeList) => { return this.dealDataByUrl(nodeList, 'module'); },
          border: 'border',
          transfer: true,
          disabled: true,
          disabledHoverTitle: this.$t('term.deploy.pleaseselectapply')
        }
      },
      pipelineFormConfig: {
        pipelineType: {
          type: 'radio',
          label: this.$t('term.deploy.pipelinetype'),
          value: 'appsystem', //global(全局)，appsystem（应用）
          url: '/api/rest/universal/enum/get',
          params: { enumClass: 'PipelineType' },
          validateList: ['required'],
          onChange: (val) => {
            this.handlePipelineId(val);
          }
        },
        pipelineId: {
          type: 'select',
          label: this.$t('term.autoexec.pipeline'),
          value: null,
          dynamicUrl: '/api/rest/deploy/pipeline/search',
          params: {type: 'appsystem', needVerifyAuth: 1},
          rootName: 'tbodyList',
          dealDataByUrl: this.dealPipelineData,
          validateList: ['required']
        }
      }
    };
  },
  beforeCreate() {},
  async created() {
    if (this.$route.query) {
      //新建定时作业，默认选中应用和模块，需要判断权限
      let disableAppSystemId = false;
      if (this.$route.query.appSystemId) {
        let appSystemId = parseInt(this.$route.query.appSystemId);
        let res = await this.$api.deploy.applicationConfig.searchAppSystemList({ appSystemIdList: [appSystemId], authorityActionList: ['view']});
        if (res.Return && res.Return.tbodyList.length && res.Return.tbodyList[0]) {
          disableAppSystemId = !!this.getDisabledText(res.Return.tbodyList[0], 'app');
        }
        if (!disableAppSystemId) {
          this.$set(this.generalFormConfig.appSystemId, 'value', appSystemId);
          this.$set(this.generalFormConfig.appModuleId, 'disabled', false);
          this.$set(this.generalFormConfig.appModuleId.params, 'appSystemId', appSystemId);
        }
        if (!disableAppSystemId && this.$route.query.appModuleId) {
          let moduleId = parseInt(this.$route.query.appModuleId);
          let appModule = await this.$api.deploy.applicationConfig.getAppModuleTreeList({ appSystemId: appSystemId, appModuleIdList: [moduleId], authorityActionList: ['view'] });
          if (appModule.Return && appModule.Return.length) {
            if (!this.getDisabledText(appModule.Return[0], 'module')) {
              this.$set(this.generalFormConfig.appModuleId, 'value', moduleId);
            }
          }
        }
      }
    }
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
    dealDataByUrl(nodeList, type) {
      let dataList = [];
      if (nodeList) {
        nodeList.forEach(item => {
          dataList.push({
            value: item.id,
            text: item.abbrName + (item.name ? '(' + item.name + ')' : ''),
            _disabled: this.getDisabledText(item, type)
          });
        });
      }
      return dataList;
    },
    getDisabledText(item, type) {
      let text = false;
      if (!item.isHasAllAuthority && type == 'app') {
        if (item.authActionSet && item.authActionSet.length) {
          if (!item.authActionSet.includes('operation#edit') && !item.authActionSet.includes('operation#all')) {
            text = this.$t('term.deploy.notapplyeditconfigauth');
          } else if (!item.authActionSet.find((item) => item.includes('scenario#')) && !item.authActionSet.includes('scenario#all')) {
            text = this.$t('term.deploy.notapplyallsceneexecuteauth');
          } else if (!item.authActionSet.find((item) => item.includes('env#')) && !item.authActionSet.includes('env#all')) {
            text = this.$t('term.deploy.notapplyallenvexecuteauth');
          }
        } else {
          text = this.$t('term.deploy.notapplyeditconfigauth');
        }
      } else if (!item.isConfig) {
        text = this.$t('term.deploy.applynotconfigpipeline');
      } else if (type == 'app' && !item.isHasModule) {
        text = this.$t('term.deploy.applynotconfigmodule');
      } else if (!item.isHasEnv) {
        type == 'app' && (text = this.$t('term.deploy.applynotconfigenv'));
        type == 'module' && (text = this.$t('term.deploy.modulenotconfigenv'));
      }
      return text;
    },
    valid() {
      let isValid = true;
      if (this.$refs.baseFormConfig && !this.$refs.baseFormConfig.valid()) {
        isValid = false;
      }
      if (this.$refs.generalFormConfig && !this.$refs.generalFormConfig.valid()) {
        isValid = false;
      }
      if (this.$refs.pipelineFormConfig && !this.$refs.pipelineFormConfig.valid()) {
        isValid = false;
      }
      return isValid;
    },
    saveBaseData() {
      let data = this.$refs.baseFormConfig.getFormValue();
      if (this.$refs.generalFormConfig) {
        Object.assign(data, this.$refs.generalFormConfig.getFormValue());
      }
      if (this.$refs.pipelineFormConfig) {
        Object.assign(data, this.$refs.pipelineFormConfig.getFormValue());
      }
      return data;
    },
    handleModuleParams(val) {
      this.generalFormConfig.appModuleId.params.appSystemId = val;
      this.generalFormConfig.appModuleId.value = null;
      if (val) {
        this.$set(this.generalFormConfig.appModuleId, 'disabled', false);
      } else {
        this.$set(this.generalFormConfig.appModuleId, 'disabled', true);
      }
    },
    handlePipelineId(val) {
      this.$set(this.pipelineFormConfig.pipelineId, 'value', null);
      this.$set(this.pipelineFormConfig.pipelineId.params, 'type', val);
    },
    dealPipelineData(nodeList) {
      let dataList = [];
      if (nodeList) {
        nodeList.forEach(item => {
          dataList.push({
            value: item.id,
            text: item.name + (item.appSystemAbbrName ? '/' + item.appSystemAbbrName : '')
          });
        });
      }
      return dataList;
    }
  },
  filter: {},
  computed: {},
  watch: {
    defaultParams: {
      handler(val) {
        if (!this.$utils.isEmpty(val)) {
          this.baseParams = this.$utils.deepClone(val);
          this.$set(this.baseFormConfig.type, 'disabled', true);
          if (this.baseParams.type == 'general') {
            this.$set(this.generalFormConfig.appSystemId, 'value', this.baseParams.appSystemId);
            this.$set(this.generalFormConfig.appModuleId, 'value', this.baseParams.appModuleId);
            this.$set(this.generalFormConfig.appSystemId, 'disabled', true);
            this.$set(this.generalFormConfig.appModuleId, 'disabled', true);
          } else if (this.baseParams.type == 'pipeline') {        
            this.$set(this.pipelineFormConfig.pipelineType, 'value', this.baseParams.pipelineType);
            this.$set(this.pipelineFormConfig.pipelineId, 'value', this.baseParams.pipelineId);
            this.$set(this.pipelineFormConfig.pipelineType, 'disabled', true);
            this.$set(this.pipelineFormConfig.pipelineId, 'disabled', true);
            if (this.baseParams.pipelineType == 'appsystem') {
              this.$set(this.pipelineFormConfig.pipelineId.params, 'type', 'appsystem');
            } else if (this.baseParams.pipelineType == 'global') {
              this.$set(this.pipelineFormConfig.pipelineId.params, 'type', 'global');
            }
          }
        }
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less">
</style>

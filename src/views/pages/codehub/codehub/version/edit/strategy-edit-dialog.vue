<template>
  <TsDialog v-bind="dialogSetting" @on-close="close" @on-ok="saveStrategy">
    <div>
      <Loading
        :loadingShow="loadingShow"
        type="fix"
      ></Loading>
      <TsForm
        v-if="!loadingShow"
        ref="form"
        v-model="formValue"
        :itemList="formConfig"
      >
      </TsForm>
    </div>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve)
  },
  filters: {},
  props: {
    id: {type: Number}
  },
  data() {
    return {
      loadingShow: true,
      dialogSetting: {
        title: this.id ? this.$t('term.pbc.editpolicy') : this.$t('page.newtarget', {'target': this.$t('term.process.policy')}),
        maskClose: false,
        isShow: true
      },
      formValue: {
        id: this.id,
        name: '',
        usePattern: 1,
        srcBranch: '',
        targetBranch: '',
        appSystemId: null,
        appModuleId: null,
        type: '',
        versionPrefix: '',
        versionTypeId: '',
        issueStatusIdList: []
      },
      formConfig: [
        {
          type: 'text',
          label: this.$t('page.name'),
          name: 'name',
          maxlength: 50,
          validateList: [
            'required', 
            { name: 'searchUrl',
              url: '/api/rest/codehub/versionstrategy/save', 
              key: 'name',
              message: this.$t('message.targetisexists', {target: this.$t('page.name')}),
              params: { id: this.id}
            }],
          onChange: () => {
            this.showUsePatternComponent();
          }
        }, 
        {
          type: 'text',
          label: this.$t('term.deploy.versionprefix'),
          name: 'versionPrefix',
          maxlength: 50
        }, 
        {
          type: 'select',
          label: this.$t('page.versiontype'),
          transfer: true,
          name: 'versionTypeId',
          dynamicUrl: '/api/rest/codehub/versiontype/search?isActive=1',
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id'
        }, 
        {
          type: 'select',
          label: this.$t('term.codehub.strategytype'),
          name: 'type',
          transfer: true,
          validateList: ['required'],
          dataList: [{
            text: this.$t('page.branch'),
            value: 'branch'
          },
          {
            text: this.$t('term.rdm.request'),
            value: 'issue'
          }]
        }, 
        {
          type: 'select',
          label: this.$t('page.system'),
          name: 'appSystemId',
          transfer: true,
          dynamicUrl: '/api/rest/codehub/appsystem/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getAppForselect,
          validateList: ['required'],
          onChange: (val) => {
            this.changeAppModule(val);
          }
        }, 
        {
          type: 'select',
          label: this.$t('page.subsystem'),
          name: 'appModuleId',
          validateList: ['required'],
          transfer: true,
          isHidden: true,
          dynamicUrl: '/api/rest/codehub/appmodule/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getAppForselect,
          params: {},
          onChange: (appModuleId) => {
            this.updateComponentStatusByAppModuleId(appModuleId);
          }
        }, 
        {
          type: 'select',
          label: this.$t('term.codehub.issuesstatus'),
          name: 'issueStatusIdList',
          transfer: true,
          url: '/api/rest/codehub/issue/status/get',
          rootName: 'list',
          textName: 'displayName',
          valueName: 'id',
          multiple: true,
          params: {},
          isHidden: true
        },  
        {
          type: 'radio',
          label: this.$t('term.codehub.fixedsourcebranch'),
          name: 'usePattern',
          validateList: ['required'],
          isHidden: true,
          dataList: [{
            text: this.$t('page.yes'),
            value: 0
          },
          {
            text: this.$t('page.no'),
            value: 1
          }],
          onChange: (usePattern) => {
            this.changeUsePatternUseComponent(usePattern);
          }
        }, 
        {
          type: 'text', // 固定源分支否时，显示的组件
          label: this.$t('page.sourcebranch'),
          name: 'srcBranch',
          isHidden: true
        },
        {
          type: 'select', // 固定源分支时，显示的组件
          label: this.$t('page.sourcebranch'),
          name: 'srcBranchSelect',
          isHidden: true,
          transfer: true,
          dynamicUrl: '/api/rest/codehub/repository/branch/search',
          rootName: 'list',
          textName: 'name',
          valueName: 'name',
          params: {}
        },
        {
          type: 'select',
          label: this.$t('page.targetbranch'),
          name: 'targetBranch',
          isHidden: true,
          transfer: true,
          dynamicUrl: '/api/rest/codehub/repository/branch/search',
          rootName: 'list',
          textName: 'name',
          valueName: 'name',
          params: {}
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
      if (this.id) {
        this.getStrategyDetail();
      } else {
        this.loadingShow = false;
      }
    },
    close() {
      this.$emit('close');
    },
    showUsePatternComponent() {
      // 根据名称，显示固定源分支组件
      this.formConfig.forEach((item) => {
        if (item && item.name == 'usePattern') {
          item.isHidden = false;
        }
      });
    },
    changeUsePatternUseComponent(usePattern) {
      // 固定源分支是否时，源分支显示输入框，否则显示下拉框
      this.formConfig.forEach(item => {
        const isSrcBranchHidden = usePattern === 1;
        const isSrcBranchSelectHidden = !isSrcBranchHidden;
  
        if (item.name === 'srcBranch') {
          this.$set(item, 'isHidden', isSrcBranchHidden);
        } else if (item.name === 'srcBranchSelect') {
          this.$set(item, 'isHidden', isSrcBranchSelectHidden);
          item.params = {
            appModuleId: this.formValue.appModuleId
          };
        }
      });
    },
    updateComponentStatusByAppModuleId(appModuleId) {
      // 根据模块id，更新组件的组件【需求状态/源分支/目标分支】组件是否显示
      let hideComponentList = ['srcBranch', 'targetBranch', 'issueStatusIdList'];
      this.formConfig.forEach(item => {
        if (hideComponentList.includes(item.name)) {
          this.$set(item, 'isHidden', !appModuleId);
          item.params = { appModuleId: appModuleId};
        }
      });
      // 清空值
      if (this.$utils.isEmpty(appModuleId)) {
        for (const key in this.formValue) {
          if (hideComponentList.includes(key)) {
            this.formValue[key] = '';
          }
        }
      }
    },
    changeAppModule(appSystemId) {
      const appModuleItem = this.formConfig.find(item => item.name === 'appModuleId');

      if (appModuleItem) {
        if (appSystemId) {
          appModuleItem.isHidden = false;
          appModuleItem.params = { appSystemId };
        } else {
          this.formValue.appModuleId = null;
          appModuleItem.isHidden = true;
          appModuleItem.params = {};
          this.changeUsePatternUseComponent(this.formValue.usePattern);
          this.updateComponentStatusByAppModuleId('');
        }
      }
    },
    saveStrategy() {
      if (!this.$refs.form.valid()) {
        return false;
      }
      let param = this.$utils.deepClone(this.formValue);
      if (param.issueStatusIdList) {
        param.issueStatusIdListText = param.issueStatusIdList.length > 0 ? param.issueStatusIdList.join(',') : '';
        delete param.issueStatusIdList; // 删除这个属性
      }
      if (!param.usePattern && param.srcBranchSelect) {
        param.srcBranch = param.srcBranchSelect;
        delete param.srcBranchSelect; // 固定分支时，源分支是下拉框，需要重新取值
      }
      this.$api.codehub.strategy.save(param).then(res => {
        if (res?.Status === 'OK') {
          this.$emit('close', true);
        }
      });
    },
    getStrategyDetail() {
      this.loadingShow = true;
      this.$api.codehub.strategy.getDetail({id: this.id}).then(res => {
        if (res && res.Status == 'OK') {
          Object.assign(this.formValue, res.Return);
          this.changeAppModule(this.formValue.appSystemId);
          if (this.formValue.appModuleId) {
            this.updateComponentStatusByAppModuleId(res.Return.appModuleId);
          }
          if (this.formValue.name) {
            this.showUsePatternComponent();
          }
          this.formValue.issueStatusIdList = res.Return.issueStatusIdListText ? res.Return.issueStatusIdListText.split(',') : [];
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
</style>

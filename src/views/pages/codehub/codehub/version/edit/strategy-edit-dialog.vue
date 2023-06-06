<template>
  <TsDialog v-bind="dialogSetting" @on-close="close" @on-ok="saveEdit">
    <div>
      <Loading
        :loadingShow="loadingShow"
        type="fix"
      ></Loading>
      <TsForm v-if="!loadingShow" ref="editform" :itemList="formConfig">
        <template slot="appModuleId">
          <TsFormSelect
            v-model="formValue.appModuleId"
            v-bind="subsystemConfig"
            :validateList="vaildConfig"
            @on-change="updatesystemsetting"
          />
        </template>
        <template slot="issueStatusId">
          <TsFormSelect v-model="statusVal" v-bind="issueStatusconfig" />
        </template>
        <template slot="usePattern">
          <TsFormRadio
            v-model="formValue.usePattern"
            v-bind="usepatternConfig"
            :validateList="vaildConfig"
          />
        </template>
        <template slot="srcBranch">
          <TsFormSelect
            v-if="formValue.usePattern=='0'"
            v-model="formValue.srcBranch"
            v-bind="srcbranchConfig"
          />
          <TsFormInput v-else v-model.trim="formValue.srcBranch"></TsFormInput>
        </template>
        <template slot="targetBranch">
          <div>
            <TsFormSelect v-model="formValue.targetBranch" v-bind="targetbranchConfig" />
          </div>
        </template>
      </TsForm>
    </div>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve),
    TsFormRadio: resolve => require(['@/resources/plugins/TsForm/TsFormRadio'], resolve),
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve)
  },
  filters: {},
  props: {
    id: {type: Number},
    appSystemId: [String, Number],
    appModuleId: [String, Number]
  },
  data() {
    return {
      dialogSetting: {
        title: this.id ? this.$t('term.pbc.editpolicy') : this.$t('page.newtarget', {'target': this.$t('term.process.policy')}),
        maskClose: false,
        isShow: true
      },
      loadingShow: true,
      vaildConfig: ['required'],
      statusVal: [], //需求状态
      formConfig: [
        {
          type: 'text',
          label: this.$t('page.name'),
          name: 'name',
          validateList: ['required'],
          onChange: (val) => {
            this.formValue.name = val;
          }
        }, 
        {
          type: 'text',
          label: this.$t('term.deploy.versionprefix'),
          name: 'versionPrefix',
          onChange: (val) => {
            this.formValue.versionPrefix = val;
          }
        }, 
        {
          type: 'select',
          label: this.$t('page.versiontype'),
          transfer: true,
          name: 'versionTypeId',
          dynamicUrl: '/api/rest/codehub/versiontype/search?isActive=1',
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id',
          onChange: (val) => {
            this.formValue.versionTypeId = val;
          }
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
          }],
          value: 'branch',
          onChange: (val) => {
            this.formValue.type = val;
          }
        }, {
          type: 'select',
          label: this.$t('page.system'),
          name: 'appSystemId',
          transfer: true,
          dynamicUrl: '/api/rest/codehub/appsystem/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getAppForselect,
          validateList: ['required'],
          onChange: (val) => {
            this.changeSubsys(val);
          }
        }, {
          type: 'slot',
          label: this.$t('page.subsystem'),
          name: 'appModuleId',
          validateList: ['required'],
          isHidden: true
        }, {
          type: 'slot',
          label: this.$t('term.codehub.issuesstatus'),
          name: 'issueStatusId',
          isHidden: true
        },  
        {
          type: 'slot',
          label: this.$t('term.codehub.fixedsourcebranch'),
          name: 'usePattern',
          validateList: ['required'],
          isHidden: true       
        }, 
        {
          type: 'slot',
          label: this.$t('page.sourcebranch'),
          name: 'srcBranch',
          isHidden: true
        }, 
        {
          type: 'slot',
          label: this.$t('page.targetbranch'),
          name: 'targetBranch',
          isHidden: true
        }
      ],
      typeTxt: {
        branch: this.$t('term.codehub.branchmerge'),
        issue: this.$t('term.codehub.issuemerge')
      },
      subsystemConfig: {
        transfer: true,
        isHidden: true,
        dynamicUrl: '/api/rest/codehub/appmodule/search',
        rootName: 'tbodyList',
        dealDataByUrl: this.$utils.getAppForselect,
        validateList: ['required']
      },
      usepatternConfig: {
        validateList: ['required'],
        dataList: [{
          text: this.$t('page.yes'),
          value: '0'
        },
        {
          text: this.$t('page.no'),
          value: '1'
        }],
        value: '1'
      }, 
      srcbranchConfig: {
        transfer: true,
        dynamicUrl: '/api/rest/codehub/repository/branch/search',
        rootName: 'list',
        textName: 'name',
        valueName: 'name',
        params: {}
      },
      targetbranchConfig: {
        transfer: true,
        dynamicUrl: '/api/rest/codehub/repository/branch/search',
        rootName: 'list',
        textName: 'name',
        valueName: 'name',
        idListName: 'keyword',
        params: {}
      },
      formValue: {
        name: '',
        srcBranch: '',
        appSystemId: this.appSystemId,
        appModuleId: this.appModuleId,
        targetBranch: '',
        type: '',
        usePattern: '1',
        id: '',
        versionPrefix: '',
        versionTypeId: '' 
      },
      issueStatusconfig: {
        transfer: true,
        url: '/api/rest/codehub/issue/status/get',
        rootName: 'list',
        textName: 'displayName',
        valueName: 'id',
        multiple: true,
        params: {}
      }
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
        this.getDetail();
      } else {
        this.formConfig.forEach(form => {
          if (form.name == 'isActive') {
            this.$set(form, 'value', 1);
          } else {
            this.$set(form, 'value', '');
          }
        });
        this.$set(this.subsystemConfig, 'params', {appSystemId: this.appSystemId});
        this.updataVal('appSystemId', this.appSystemId);
        if (this.appSystemId) {
          this.formConfig.forEach((form) => {
            if (form.name == 'appModuleId') {
              this.$set(form, 'isHidden', false);
            }
          });
        }
        this.$set(this.formValue, 'appModuleId', this.appModuleId);
        this.updataVal('appModuleId', this.appModuleId);
        this.updateRelate(this.appModuleId);
        this.loadingShow = false;
      }
    },
    close() {
      this.$emit('close');
    },
    updatesystemsetting(val) {
      let hideList = ['usePattern', 'srcBranch', 'targetBranch', 'issueStatusId'];
      this.formValue.appModuleId = val;
      this.formValue.usePattern = '1';
      this.formValue.srcBranch = '';
      this.formValue.targetBranch = '';
      this.statusVal = [];
      this.formConfig.forEach((form, findex) => {
        if (hideList.indexOf(form.name) > -1) {
          this.$set(form, 'isHidden', !val);
        }
      });
      Object.assign(this.srcbranchConfig.params, {
        appModuleId: val
      });
      Object.assign(this.targetbranchConfig.params, {
        appModuleId: val
      });
      Object.assign(this.issueStatusconfig.params, {
        appModuleId: val
      });
    },
    saveEdit() {
      if (this.$refs.editform.valid()) {
        let param = this.$utils.deepClone(this.formValue);
        Object.assign(param, {
          usePattern: parseInt(this.formValue.usePattern)
        });
        if (this.statusVal) {
          Object.assign(param, {
            issueStatusId: this.statusVal.length > 0 ? this.statusVal.join(',') : ''
          });
        }
        if (this.id) {
          Object.assign(param, {id: this.id});
        }
        this.$api.codehub.strategy.save(param).then(res => {
          this.$emit('close', true);
        });
      }
    },
    changeSubsys(val) {
      //根据系统改变子系统
      let hideList = ['appModuleId', 'usePattern', 'srcBranch', 'targetBranch', 'issueStatusId'];
      this.formValue.appModuleId = '';
      this.formValue.usePattern = '1';
      this.formValue.srcBranch = '';
      this.formValue.targetBranch = '';
      this.formConfig.forEach((form, findex) => {
        if (hideList.indexOf(form.name) > -1) {
          this.$set(form, 'isHidden', !val);
        }
      });
      this.$set(this.subsystemConfig, 'params', {appSystemId: val}); 
      this.updatesystemsetting('');
    },
    getDetail() {
      this.loadingShow = true;
      this.$api.codehub.strategy.getDetail({id: this.id}).then(res => {
        if (res && res.Status == 'OK') {
          if (res.Return.appModuleId) {
            this.updatesystemsetting(res.Return.appModuleId);
          }
          Object.assign(this.formValue, {
            name: res.Return.name || '',
            srcBranch: res.Return.srcBranch || '',
            appSystemId: res.Return.appSystemId,
            appModuleId: res.Return.appModuleId || '',
            targetBranch: res.Return.targetBranch || '',
            type: res.Return.type || '',
            usePattern: String(res.Return.usePattern),
            id: res.Return.id || '',
            versionPrefix: res.Return.versionPrefix || '',
            versionTypeId: res.Return.versionTypeId || ''
          });
          this.statusVal = res.Return.issueStatusId ? res.Return.issueStatusId.split(',') : [];
        } else {
          this.formValue = {};
          this.statusVal = [];
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    updataVal(name, val) {
      this.formConfig.forEach(form => {
        if (form.name == name) {
          this.$set(form, 'value', val);
          val && this.$set(form, 'isHidden', false);
        }
      });
    },
    updateRelate(val) {
      //单独更新子系统相关的参数（不改变值
      let hideList = ['usePattern', 'srcBranch', 'targetBranch', 'issueStatusId'];
      this.formConfig.forEach((form, findex) => {
        if (hideList.indexOf(form.name) > -1) {
          this.$set(form, 'isHidden', !val);
        }
      });
      Object.assign(this.srcbranchConfig.params, {
        appModuleId: val
      });
      Object.assign(this.targetbranchConfig.params, {
        appModuleId: val
      });
      Object.assign(this.issueStatusconfig.params, {
        appModuleId: val
      });
    }
  },
  computed: {},
  watch: {
    formValue: {
      handler: function(val) {
        if (val && val.name) {
          if (val.appModuleId) {
            Object.assign(this.srcbranchConfig.params, {
              appModuleId: val.appModuleId
            });
            Object.assign(this.targetbranchConfig.params, {
              appModuleId: val.appModuleId
            });
          }
          this.formConfig.forEach(form => {
            if (val[form.name]) {
              this.$set(form, 'value', val[form.name]);
              this.$set(form, 'isHidden', false);
            }
          });
        }
      },
      immediate: true,
      deep: true      
    }
  }
};
</script>
<style lang="less" scoped>
</style>

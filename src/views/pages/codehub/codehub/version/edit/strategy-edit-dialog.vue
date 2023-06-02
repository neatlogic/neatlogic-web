<template>
  <TsDialog v-bind="dialogSetting" @on-close="close" @on-ok="saveEdit">
    <div>
      <TsForm ref="editform" :itemList="formConfig">
        <template slot="appModuleId">
          <TsFormSelect
            v-model="editvalList.appModuleId"
            v-bind="subsystemConfig"
            :validateList="vaildConfig"
            :selectItemList.sync="selectSub"
            @on-change="updatesystemsetting"
          />
        </template>
        <template slot="issueStatusUuid">
          <TsFormSelect v-model="statusVal" v-bind="issueStatusconfig" />
        </template>
        <template slot="usePattern">
          <TsFormRadio
            v-model="editvalList.usePattern"
            v-bind="usepatternConfig"
            :validateList="vaildConfig"
          />
        </template>
        <template slot="srcBranch">
          <TsFormSelect
            v-if="editvalList.usePattern=='0'"
            v-model="editvalList.srcBranch"
            v-bind="srcbranchConfig"
          />
          <TsFormInput v-else v-model.trim="editvalList.srcBranch"></TsFormInput>
        </template>
        <template slot="targetBranch">
          <div>
            <TsFormSelect v-model="editvalList.targetBranch" v-bind="targetbranchConfig" />
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
      selectSub: null,
      vaildConfig: ['required'],
      statusVal: [], //需求状态
      formConfig: [
        {
          type: 'text',
          label: this.$t('page.name'),
          name: 'name',
          validateList: ['required'],
          onChange: (val) => {
            this.editvalList.name = val;
          }
        }, 
        {
          type: 'text',
          label: this.$t('term.deploy.versionprefix'),
          name: 'versionPrefix',
          onChange: (val) => {
            this.editvalList.versionPrefix = val;
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
          idListName: 'id',
          onChange: (val) => {
            this.editvalList.versionTypeId = val;
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
            this.editvalList.type = val;
          }
        }, {
          type: 'select',
          label: this.$t('page.system'),
          name: 'appSystemId',
          transfer: true,
          dynamicUrl: '/api/rest/codehub/appsystem/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getAppForselect,
          idListName: 'id',
          validateList: ['required'],
          value: '',
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
          name: 'issueStatusUuid',
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
        textName: 'name',
        valueName: 'id',
        idListName: 'id',
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
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'name',
        idListName: 'keyword',
        params: {}
      },
      targetbranchConfig: {
        transfer: true,
        dynamicUrl: '/api/rest/codehub/repository/branch/search',
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'name',
        idListName: 'keyword',
        params: {}
      },
      editvalList: {
        name: '',
        srcBranch: '',
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
        rootName: 'tbodyList',
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
        this.getDetail(this.id);
      } else {
        this.formConfig.forEach(form => {
          if (form.name == 'isActive') {
            this.$set(form, 'value', 1);
          } else {
            this.$set(form, 'value', '');
          }
        });
        this.$set(this.subsystemConfig, 'params', {systemId: this.appSystemId});
        this.updataVal('appSystemId', this.appSystemId);
        if (this.appSystemId) {
          this.formConfig.forEach((form) => {
            if (form.name == 'appModuleId') {
              this.$set(form, 'isHidden', false);
            }
          });
        }
        this.$set(this.editvalList, 'appModuleId', this.appModuleId);
        this.updataVal('appModuleId', this.appModuleId);
        this.updateRelate(this.appModuleId);
      }
    },
    close() {
      this.$emit('close');
    },
    updatesystemsetting(val) {
      let hideList = ['usePattern', 'srcBranch', 'targetBranch', 'issueStatusUuid'];
      this.editvalList.appModuleId = val;
      this.editvalList.usePattern = '1';
      this.editvalList.srcBranch = '';
      this.editvalList.targetBranch = '';
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
        let param = this.$utils.deepClone(this.editvalList);
        Object.assign(param, {
          usePattern: parseInt(this.editvalList.usePattern)
        });
        if (this.statusVal) {
          Object.assign(param, {
            issueStatusUuid: this.statusVal.length > 0 ? this.statusVal.join(',') : ''
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
      let hideList = ['appModuleId', 'usePattern', 'srcBranch', 'targetBranch', 'issueStatusUuid'];
      this.editvalList.appModuleId = '';
      this.editvalList.usePattern = '1';
      this.editvalList.srcBranch = '';
      this.editvalList.targetBranch = '';
      this.formConfig.forEach((form, findex) => {
        if (hideList.indexOf(form.name) > -1) {
          this.$set(form, 'isHidden', !val);
        }
      });
      this.$set(this.subsystemConfig, 'params', {systemId: val}); 
      this.updatesystemsetting('');
    },
    getDetail(strategyId) {
      this.$set(this.editvalList, 'appModuleId', '');
      if (strategyId) {
        this.$api.codehub.strategy.getDetail({id: strategyId}).then(res => {
          if (res && res.Status == 'OK') {
            if (res.Return.appModuleId) {
              this.updatesystemsetting(res.Return.appModuleId);
            }
            Object.assign(this.editvalList, {
              name: res.Return.name || '',
              srcBranch: res.Return.srcBranch || '',
              appModuleId: res.Return.appModuleId || '',
              targetBranch: res.Return.targetBranch || '',
              type: res.Return.type || '',
              usePattern: String(res.Return.usePattern),
              id: res.Return.id || '',
              versionPrefix: res.Return.versionPrefix || '',
              versionTypeId: res.Return.versionTypeId || ''
            });
            this.statusVal = res.Return.issueStatusUuid ? res.Return.issueStatusUuid.split(',') : [];
          } else {
            this.editvalList = {};
            this.statusVal = [];
          }
        });
      } else {
        this.editvalList = {};
      }
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
      let hideList = ['usePattern', 'srcBranch', 'targetBranch', 'issueStatusUuid'];
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
    selectSub: {
      handler: function(val, oldeval) {
        if (val && val.systemVo) {
          this.updataVal('appSystemId', val.systemVo.uuid);
          this.$set(this.subsystemConfig, 'params', {systemId: val.systemVo.uuid});
        }
      },
      immediate: true,
      deep: true
    },
    editvalList: {
      handler: function(val) {
        if (val && val.name) {
          if (val.appModuleId) {
            this.$set(this.dialogSetting, 'height', '500px');
            Object.assign(this.srcbranchConfig.params, {
              appModuleId: val.appModuleId
            });
            Object.assign(this.targetbranchConfig.params, {
              appModuleId: val.appModuleId
            });
          } else {
            this.$set(this.dialogSetting, 'height', '300px');
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

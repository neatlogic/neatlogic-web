<template>
  <TsDialog v-bind="setting" :isShow="isShow" @on-close="close">
    <div>
      <TsForm ref="editform" :itemList="formConfig">
        <template slot="subsystemUuid">
          <TsFormSelect
            v-model="editvalList.subsystemUuid"
            v-bind="subsystemConfig"
            :validateList="vaildConfig"
            width="75%"
            :selectItemList.sync="selectSub"
            @on-change="updatesystemsetting"
          />
        </template>
        <template slot="issueStatusUuid">
          <TsFormSelect v-model="statusVal" v-bind="issueStatusconfig" width="75%" />
        </template>
        <template slot="usePattern">
          <TsFormRadio
            v-model="editvalList.usePattern"
            v-bind="usepatternConfig"
            :validateList="vaildConfig"
            width="75%"
          />
        </template>
        <template slot="srcBranch">
          <TsFormSelect
            v-if="editvalList.usePattern=='0'"
            v-model="editvalList.srcBranch"
            v-bind="srcbranchConfig"
            width="75%"
          />
          <TsFormInput v-else v-model.trim="editvalList.srcBranch" width="75%"></TsFormInput>
        </template>
        <template slot="targetBranch">
          <div>
            <TsFormSelect v-model="editvalList.targetBranch" v-bind="targetbranchConfig" width="75%" />
          </div>
        </template>
      </TsForm>
    </div>
    <template v-slot:footer>
      <div class="footer-btn-contain">
        <Button type="text" @click="close">{{ $t('page.cancel') }}</Button>
        <Button type="primary" :disabled="saving" @click="saveEdit">{{ $t('page.confirm') }}</Button>
      </div>
    </template>
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
    isShow: {
      type: Boolean,
      default: false
    },
    uuid: {type: [String, Boolean]},
    systemUuid: [String, Number],
    subsystemUuid: [String, Number]
  },
  data() {
    return {
      setting: {
        title: this.uuid ? this.$t('term.pbc.editpolicy') : this.$t('page.newtarget', {'target': this.$t('term.process.policy')}),
        maskClose: false
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
          name: 'versionTypeUuid',
          dynamicUrl: '/api/rest/codehub/versiontype/search?isActive=1',
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id',
          idListName: 'id',
          onChange: (val) => {
            this.editvalList.versionTypeUuid = val;
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
          name: 'systemUuid',
          transfer: true,
          dynamicUrl: '/api/rest/codehub/appsystem/search',
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id',
          idListName: 'id',
          validateList: ['required'],
          value: '',
          onChange: (val) => {
            this.changeSubsys(val);
          }
        }, {
          type: 'slot',
          label: this.$t('page.subsystem'),
          name: 'subsystemUuid',
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
        subsystemUuid: this.subsystemUuid,
        targetBranch: '',
        type: '',
        usePattern: '1',
        uuid: '',
        versionPrefix: '',
        versionTypeUuid: '' 
      },
      issueStatusconfig: {
        transfer: true,
        url: '/api/rest/codehub/issue/status/get',
        rootName: 'tbodyList',
        textName: 'displayName',
        valueName: 'id',
        multiple: true,
        params: {}
      },
      saving: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    close() {
      this.$emit('close');
    },
    updatesystemsetting(val) {
      let hideList = ['usePattern', 'srcBranch', 'targetBranch', 'issueStatusUuid'];
      this.editvalList.subsystemUuid = val;
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
        subsystemUuid: val
      });
      Object.assign(this.targetbranchConfig.params, {
        subsystemUuid: val
      });
      Object.assign(this.issueStatusconfig.params, {
        subsystemUuid: val
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
        if (this.uuid) {
          Object.assign(param, {uuid: this.uuid});
        }
        this.saving = true;
        this.$api.codehub.strategy.save(param).then(res => {
          this.saving = false;
          this.$emit('close', true);
        }).catch(e => {
          this.saving = false;
        });
      }
    },
    changeSubsys(val) {
      //根据系统改变子系统
      let hideList = ['subsystemUuid', 'usePattern', 'srcBranch', 'targetBranch', 'issueStatusUuid'];
      this.editvalList.subsystemUuid = '';
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
    getDetail(val) {
      this.$set(this.editvalList, 'subsystemUuid', '');
      if (val) {
        this.$api.codehub.strategy.getDetail({uuid: val}).then(res => {
          if (res && res.Status == 'OK') {
            if (res.Return.subsystemUuid) {
              this.updatesystemsetting(res.Return.subsystemUuid);
            }
            Object.assign(this.editvalList, {
              name: res.Return.name || '',
              srcBranch: res.Return.srcBranch || '',
              subsystemUuid: res.Return.subsystemUuid || '',
              targetBranch: res.Return.targetBranch || '',
              type: res.Return.type || '',
              usePattern: String(res.Return.usePattern),
              uuid: res.Return.uuid || '',
              versionPrefix: res.Return.versionPrefix || '',
              versionTypeUuid: res.Return.versionTypeUuid || ''
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
        subsystemUuid: val
      });
      Object.assign(this.targetbranchConfig.params, {
        subsystemUuid: val
      });
      Object.assign(this.issueStatusconfig.params, {
        subsystemUuid: val
      });
    }
  },
  computed: {},
  watch: {
    uuid: {
      handler: function(val) {
        if (val) {
          this.getDetail(val);
        } else {
          this.formConfig.forEach(form => {
            if (form.name == 'isActive') {
              this.$set(form, 'value', 1);
            } else {
              this.$set(form, 'value', '');
            }
          });
        }
        this.$set(this.setting, 'title', val ? this.$t('term.pbc.editpolicy') : this.$t('page.newtarget', {'target': this.$t('term.process.policy')}));
      },
      immediate: true
    },
    selectSub: {
      handler: function(val, oldeval) {
        if (val && val.systemVo) {
          this.updataVal('systemUuid', val.systemVo.uuid);
          this.$set(this.subsystemConfig, 'params', {systemId: val.systemVo.uuid});
        }
      },
      immediate: true,
      deep: true
    },
    editvalList: {
      handler: function(val) {
        if (val && val.name) {
          if (val.subsystemUuid) {
            this.$set(this.setting, 'height', '500px');
            Object.assign(this.srcbranchConfig.params, {
              subsystemUuid: val.subsystemUuid
            });
            Object.assign(this.targetbranchConfig.params, {
              subsystemUuid: val.subsystemUuid
            });
          } else {
            this.$set(this.setting, 'height', '300px');
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
    },
    systemUuid: {
      handler: function(val) {
        if (!this.uuid) {
          this.$set(this.subsystemConfig, 'params', {systemId: val});
          this.updataVal('systemUuid', val);
          if (val) {
            this.formConfig.forEach((form) => {
              if (form.name == 'subsystemUuid') {
                this.$set(form, 'isHidden', false);
              }
            });
          }
        }
      },
      immediate: true
    },
    subsystemUuid: {
      handler: function(val) {
        if (!this.uuid) {
          this.$set(this.editvalList, 'subsystemUuid', val);
          this.updataVal('subsystemUuid', val);
          this.updateRelate(val);
        }
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
</style>

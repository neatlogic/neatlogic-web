<template>
  <TsDialog v-bind="dialogSetting" @on-close="close" @on-ok="saveVersion">
    <template v-slot>
      <div>
        <TsForm
          ref="form"
          v-model="formValue"
          :itemList="formConfig"
        >
        </TsForm>     
        <div v-if="strategyData.tbodyList && formValue.appModuleId" class="mt-sm">
          <TsTable v-bind="strategyData" @getSelected="getSelected">
            <template slot="type" slot-scope="{row}">
              {{ typeTxt[row.type] }}
            </template>
          </TsTable>
        </div>
      </div>
    </template>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve)
  },
  props: {
    id: {type: Number},
    appModuleId: [String, Number],
    appSystemId: [String, Number]
  },
  data() {
    return {
      dialogSetting: {
        title: this.id ? this.$t('dialog.title.edittarget', {'target': this.$t('page.versions')}) : this.$t('page.newtarget', {'target': this.$t('page.versions')}),
        maskClose: false,
        isShow: true
      },
      formValue: {
        version: '',
        versionStrategyId: null
      },
      versionStrategyId: null,
      strategyPre: '',
      strategyData: {
        multiple: false,
        rowKey: 'id', 
        theadList: [
          {
            key: 'selection'
          }, 
          {
            title: this.$t('term.codehub.strategyname'),
            key: 'name'
          }, 
          {
            title: this.$t('page.type'),
            key: 'type'
          },
          { 
            title: this.$t('page.sourcebranch'),
            key: 'srcBranch'
          }, 
          {
            title: this.$t('page.targetbranch'),
            key: 'targetBranch'
          }],
        tbodyList: null
      },
      formConfig: [
        {
          type: 'select',
          label: this.$t('page.system'),
          name: 'appSystemId',
          transfer: true,
          validateList: ['required'],
          dynamicUrl: '/api/rest/codehub/appsystem/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getAppForselect,
          onChange: (val) => {
            this.changeSubsys(val);
          }
        }, 
        {
          name: 'appModuleId',
          type: 'select',
          transfer: true,
          validateList: ['required'],
          dynamicUrl: '/api/rest/codehub/appmodule/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.dealDataByUrl,
          label: this.$t('page.subsystem'),
          onChange: (appModuleId) => {
            if (appModuleId) {
              this.getVersion(appModuleId);
            }
          }
        },
        {
          type: 'select',
          label: this.$t('page.versiontype'),
          width: '100%',
          name: 'versionTypeId',
          transfer: true,
          validateList: ['required'],
          url: '/api/rest/codehub/versiontype/search?isActive=1',
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id',
          onChange: (val) => {
            this.formValue.versionTypeId = val;
            this.autofillName(this.formValue);
          } 
        }, {
          type: 'text',
          maxlength: 100,
          label: this.$t('term.framework.pkgversion'),
          width: '100%',
          name: 'version',
          isHidden: true,
          prepend: this.strategyPre,
          validateList: ['required']
        }
      ],
      typeTxt: {
        branch: this.$t('term.codehub.branchmerge'),
        issue: this.$t('term.codehub.issuemerge')
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.initData();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    initData() {
      this.$set(this.strategyData, 'tbodyList', null);
      if (this.appSystemId) {
        this.formConfig && this.formConfig.forEach((item) => {
          if (item && item.name == 'appModuleId') {
            this.$set(item, 'params', {systemId: this.appSystemId});
            this.$set(item, 'dynamicUrl', '/api/rest/codehub/appmodule/search');
          }
        });
      }
      if (this.appModuleId) {
        this.$set(this.formValue, 'appModuleId', this.appModuleId);
      }
    },
    close() {
      this.$emit('close');
    },
    dealDataByUrl(nodeList) {
      let dataList = [];
      if (!this.$utils.isEmpty(nodeList)) {
        nodeList.forEach((item) => {
          if (item.id) {
            dataList.push({
              text: item.abbrName ? (item.name ? `${item.abbrName}(${item.name})` : item.abbrName) : (item.abbrName || item.name),
              value: item.id 
            });
          }
        });
      }
      return dataList;
    },
    saveVersion() {
      if (this.$refs.form && !this.$refs.form.valid()) {
        return false;
      }
      if (this.formValue.versionStrategyId) {
        let param = {};
        Object.assign(param, this.formValue);
        Object.assign(param, {
          version: this.strategyPre + this.formValue.version
        });
        if (this.id) {
          Object.assign(param, {id: this.id});
        }
        this.$api.codehub.version.save(param).then(res => {
          if (res && res.Status == 'OK') {
            this.$emit('close', true);
          }
        });
      } else {
        this.$Message.error(this.$t('form.validate.required', {target: this.$t('term.process.policy')}));
      }
    },
    getSelected(val, vals) {
      if (val.length > 0) {
        this.formValue.versionStrategyId = vals[0].id;
        this.strategyPre = vals[0].versionPrefix;
      } else {
        this.formValue.versionStrategyId = '';
        this.strategyPre = '';
      }
      this.hideName(this.formValue.versionStrategyId);
      this.autofillName(this.formValue);
    },
    hideName(id) {
      this.formConfig.forEach((form, findex) => {
        if (form.name == 'version') {
          form.isHidden = !id;
        }
      });
    },
    changeSubsys(val) {
      this.formValue.appSystemId = val;
      this.formValue.appModuleId = '';
      this.formValue.versionStrategyId = '';
      this.hideName();
      if (val) {
        this.formConfig && this.formConfig.forEach((item) => {
          if (item && item.name == 'appModuleId') {
            this.$set(item, 'params', {systemId: val});
            this.$set(item, 'dynamicUrl', '/api/rest/codehub/appmodule/search');
          }
        });
      } else {
        this.formConfig && this.formConfig.forEach((item) => {
          if (item && item.name == 'appModuleId') {
            this.$set(item, 'params', {});
            this.$set(item, 'dynamicUrl', '');
          }
        });
      }
    },
    getVersion(appModuleId) {
      this.strategyPre = '';
      this.formValue.versionStrategyId = '';
      this.hideName();
      if (appModuleId) {
        this.$api.codehub.strategy.getList({needPage: false, appModuleId: appModuleId}).then(res => {
          this.isLoad = false;
          if (res && res.Status == 'OK') {
            this.$set(this.strategyData, 'tbodyList', res.Return.tbodyList);
          } else {
            this.$set(this.strategyData, 'tbodyList', []);
          }
        });
      } else {
        this.$set(this.strategyData, 'tbodyList', null);
      }
    },
    autofillName(config) {
      let appModuleId = config.appModuleId || '';
      let versionStrategyId = config.versionStrategyId || '';
      let versionTypeId = config.versionTypeId || '';
      Object.assign(this.formValue, {
        version: ''
      });
      if (appModuleId && versionStrategyId && versionTypeId) {
        let param = {
          appModuleId: appModuleId,
          versionStrategyId: versionStrategyId, 
          versionTypeId: versionTypeId
        };
        this.$api.codehub.version.autofillName(param).then((res) => {
          if (res && res.Status == 'OK' && res.Return.version) {
            Object.assign(this.formValue, {
              version: res.Return.version.replace(this.strategyPre, '')
            });
          }
        });
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

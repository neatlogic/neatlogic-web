<template>
  <TsDialog v-bind="dialogSetting" @on-close="close" @on-ok="saveMerge">
    <template v-slot>
      <div>
        <TsForm
          ref="form"
          v-model="formValue"
          :itemList="formConfig"
        >
        </TsForm>
        <!-- 不创建新版本——start    -->
        <div v-if="!isNewVersion && !$utils.isEmpty(versionTable.tbodyList) && formValue.appModuleId" class="mt-nm">
          <TsTable :theadList="versionTheadList" v-bind="versionTable" @getSelected="getversionSelected">
            <template slot="type" slot-scope="{row}">
              {{ typeTxt[row.type] }}
            </template>
          </TsTable>
        </div>
        <!-- 不创建新版本——end    -->
        <!-- 创建新版本——start    -->
        <div v-if="isNewVersion && !$utils.isEmpty(strategyData.tbodyList) && formValue.appModuleId">
          <TsTable :theadList="strategyTheadList" v-bind="strategyData" @getSelected="getstrategySelected">
            <template slot="type" slot-scope="{row}">
              {{ typeTxt[row.type] }}
            </template>
          </TsTable>
        </div>
        <!-- 创建新版本——end    -->
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
  props: {},
  data() {
    return {
      dialogSetting: {
        title: this.$t('term.codehub.createmergerequest'),
        maskClose: false,
        isShow: true
      },
      versionPrefix: '',
      versionTheadList: [{
        key: 'selection'
      }, {
        title: this.$t('term.framework.pkgversion'),
        key: 'version'
      }, {
        title: this.$t('term.codehub.mergertype'),
        key: 'type'
      }, { 
        title: this.$t('page.sourcebranch'),
        key: 'srcBranch'
      }, {
        title: this.$t('page.targetbranch'),
        key: 'targetBranch'
      }, {
        title: this.$t('page.versiontype'),
        key: 'versiontypeName' //这个没有可取字段,用的版本类型名字
      }],
      versionTable: {
        multiple: false,
        rowKey: 'id',
        tbodyList: []
      },
      formValue: {
        isNewVersion: '1',
        id: '',
        version: '',
        versionTypeId: '',
        versionStrategyId: '',
        appModuleId: null
      },
      formConfig: [{
        type: 'radio',
        label: this.$t('page.newversion'),
        width: '100%',
        itemWidth: '100%',
        name: 'isNewVersion',
        validateList: ['required'],
        dataList: [{
          text: this.$t('page.yes'),
          value: '1'
        }, {
          text: this.$t('page.no'),
          value: '0'          
        }],
        onChange: () => {
          this.getVersion(this.formValue.appModuleId);
        }
      }, 
      {
        type: 'select',
        label: this.$t('page.system'),
        width: '100%',
        name: 'appSystemId',
        transfer: true,
        validateList: ['required'],
        dynamicUrl: '/api/rest/codehub/appsystem/search',
        rootName: 'tbodyList',
        dealDataByUrl: this.$utils.getAppForselect,
        onChange: (val) => {
          this.changeAppModule(val);
        }
      }, 
      {
        type: 'select',
        isHidden: true,
        label: this.$t('page.subsystem'),
        name: 'appModuleId',
        width: '100%',
        transfer: true,
        validateList: ['required'],
        dynamicUrl: '/api/rest/codehub/appmodule/search',
        rootName: 'tbodyList',
        dealDataByUrl: this.$utils.getAppForselect,
        params: {appSystemId: null},
        onChange: (val) => {
          this.getVersion(val);
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
          this.autofillName();
        } 
      }, 
      {
        type: 'text',
        isHidden: true,
        hidden: true,
        label: this.$t('term.framework.pkgversion'),
        width: '100%',
        name: 'version',
        validateList: ['required'],
        prepend: ''
      }
      ],
      typeTxt: {
        branch: this.$t('term.codehub.branchmerge'),
        issue: this.$t('term.codehub.issuemerge')
      },
      selectedversion: {},
      strategyTheadList: [{
        key: 'selection'
      }, {
        title: this.$t('term.codehub.strategyname'),
        key: 'name'
      }, {
        title: this.$t('page.type'),
        key: 'type'
      }, { 
        title: this.$t('page.sourcebranch'),
        key: 'srcBranch'
      }, {
        title: this.$t('page.targetbranch'),
        key: 'targetBranch'
      }],
      strategyData: {
        multiple: false,
        rowKey: 'id',
        tbodyList: []
      }
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
    saveMerge() {
      if (this.$refs.form.valid()) {
        if (this.formValue.versionStrategyId) {
          let param = {};
          if (this.isNewVersion) {
            //如果是新建的要校验必填信息
            if (this.$refs.versionform && this.$refs.versionform.valid()) {
              Object.assign(param, {
                version: this.versionPrefix + this.formValue.version,
                versionTypeId: this.formValue.versionTypeId,
                versionStrategyId: this.formValue.versionStrategyId,
                appModuleId: this.formValue.appModuleId
              });
              this.$api.codehub.version.save(param).then(res => {
                if (res && res.Status == 'OK') {
                  this.gotoCreate(res.Return, this.selectedversion[0].type);
                  this.$emit('close', true);
                }
              });
            }
          } else {
            //如果是用之前的，用选中的列的数据,不需要调用保存接口
            if (this.selectedversion.length > 0) {
              if (this.selectedversion[0].canEdit) {
                Object.assign(param, {
                  version: this.versionPrefix + this.selectedversion[0].name,
                  id: this.selectedversion[0].id,
                  versionTypeId: this.selectedversion[0].versionTypeId,
                  versionStrategyId: this.selectedversion[0].versionStrategyId,
                  appModuleId: this.formValue.appModuleId
                });
                this.gotoCreate(this.selectedversion[0].id, this.selectedversion[0].type);
                this.$emit('close', true);
              } else {
                this.$Notice.error({
                  title: this.$t('term.codehub.versionnobuildnewmerger')
                });
              }
            }
          }
        } else {
          this.$Message.error(this.$t('term.codehub.chooseastrategtfromtable'));
        }
      }
    },
    getversionSelected(val, vals) {
      //不新建版本，选中对应版本
      if (val.length > 0) {
        this.formValue.versionStrategyId = vals[0].id;
        this.versionPrefix = vals[0].versionPrefix;
        this.selectedversion = vals;
        this.setVersionPrefix(vals[0].versionPrefix);
      } else {
        this.formValue.versionStrategyId = '';
        this.versionPrefix = '';
        this.selectedversion = {};
      }
      this.hideVersion(this.formValue.versionStrategyId);
    },
    getstrategySelected(val, vals) {
      //新建版本，策略选中的话，
      if (val.length > 0) {
        this.formValue.versionStrategyId = vals[0].id;
        this.versionPrefix = vals[0].versionPrefix;
        this.selectedversion = vals;
        this.autofillName();
        this.setVersionPrefix(this.versionPrefix);
      } else {
        this.formValue.versionStrategyId = '';
        this.versionPrefix = '';
        this.selectedversion = {};
        this.setVersionPrefix(this.versionPrefix);
      }
      this.hideVersion(this.formValue.versionStrategyId);
    },
    hideVersion(id) {
      this.formConfig.forEach((form) => {
        if (form.name == 'version') {
          form.isHidden = !id;
        }
      });
    },
    setVersionPrefix(versionPrefix) {
      // 设置版本前缀
      this.formConfig.forEach((item) => {
        if (item && item.name == 'version') {
          item.prepend = versionPrefix;
        }
      });
    },
    changeAppModule(appSystemId) {
      // 改变子系统的入参
      this.formValue.appSystemId = appSystemId;
      this.formValue.versionStrategyId = '';
      this.hideVersion();
      this.formConfig.forEach((item) => {
        if (item.name == 'appModuleId') {
          item.isHidden = !appSystemId;
          item.params = {appSystemId: appSystemId};
        }
      });
    },
    getVersion(appModuleId) {
      let param = {
        needPage: false
      };
      this.formValue.versionStrategyId = '';
      this.hideVersion();
      if (appModuleId) {
        Object.assign(param, {appModuleId: appModuleId});
        if (this.isNewVersion) {
          this.$api.codehub.strategy.getList(param).then(res => {
            if (res && res.Status == 'OK') {
              this.$set(this.strategyData, 'tbodyList', res.Return.tbodyList);
            } else {
              this.$set(this.strategyData, 'tbodyList', []);
            }
          }).finally(() => {
            this.isLoad = false;
          });
        } else {
          this.$api.codehub.version.getList(param).then(res => {
            if (res && res.Status == 'OK') {
              let tbodyList = res.Return.tbodyList || [];
              if (tbodyList.length > 0) {
                tbodyList.forEach(li => {
                  if (li.versionStrategyVo) {
                    let versionArr = li.versionStrategyVo;
                    Object.assign(li, {
                      srcBranch: versionArr.srcBranch,
                      targetBranch: versionArr.targetBranch,
                      type: versionArr.type,
                      versionPrefix: versionArr.versionPrefix,
                      versiontypeName: li.versionTypeVo.name
                    });
                    Object.assign(li, {
                      versionTypeId: li.versionTypeStrategyRelationVo.versionTypeId,
                      versionStrategyId: li.versionTypeStrategyRelationVo.versionStrategyId
                    });
                  }
                });
              }
              this.$set(this.versionTable, 'tbodyList', tbodyList);
            } else {
              this.$set(this.versionTable, 'tbodyList', []);
            }
          }).finally(() => {
            this.isLoad = false;
          });
        }
      } else {
        this.$set(this.versionTable, 'tbodyList', []);
        this.$set(this.strategyData, 'tbodyList', []);
      }
    },
    gotoCreate(id, type) {
      this.$router.push({ path: 'merge-create', query: {versionid: id, type: type} });
    },
    autofillName() {
      this.formValue.version = '';
      if (this.formValue.appModuleId && this.formValue.versionStrategyId && this.formValue.versionTypeId) {
        let param = {
          appModuleId: this.formValue.appModuleId,
          versionStrategyId: this.formValue.versionStrategyId, 
          versionTypeId: this.formValue.versionTypeId
        };
        this.$api.codehub.version.autofillName(param).then((res) => {
          if (res && res.Status == 'OK' && res.Return.version) {
            this.formValue.version = res.Return.version.replace(this.versionPrefix, '');
          }
        });
      }
    }
  },
  filter: {},
  computed: {
    isNewVersion() {
      // 是否是创建新版本
      let isNew = false;
      if (this.formValue.isNewVersion) {
        isNew = true;
      }
      return isNew;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
</style>

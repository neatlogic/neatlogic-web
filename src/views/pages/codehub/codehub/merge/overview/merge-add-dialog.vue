<template>
  <TsDialog v-bind="dialogSetting" @on-close="close" @on-ok="saveEdit">
    <template v-slot>
      <div>
        <TsForm
          ref="form"
          v-model="formValue"
          :itemList="formConfig"
          :labelWidth="120"
        >
        </TsForm>
        <!-- 不创建新版本——start    -->
        <div v-if="!isNewVersion &&versionTable.tbodyList && versionData.appModuleId" class="mt-nm">
          <TsTable v-bind="versionTable" @getSelected="getversionSelected">
            <template slot="type" slot-scope="{row}">
              {{ typeTxt[row.type] }}
            </template>
          </TsTable>
        </div>
        <!-- 不创建新版本——end    -->
        <!-- 创建新版本——start    -->
        <div v-if="isNewVersion && strategyData.tbodyList && versionData.appModuleId">
          <TsTable v-bind="strategyData" @getSelected="getstrategySelected">
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
  props: {
    appModuleId: [String, Number], // 子系统id
    appSystemId: [String, Number] // 系统id
  },
  data() {
    return {
      dialogSetting: {
        title: this.$t('term.codehub.createmergerequest'),
        maskClose: false,
        isShow: true
      },
      formValue: {
        isNewversion: '1'
      },
      versionPrefix: '',
      versionTable: {
        multiple: false,
        rowKey: 'uuid', 
        theadList: [{
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
        tbodyList: null
      },
      versionData: {
        uuid: '',
        name: '',
        versionTypeId: '',
        versionStrategyId: '',
        appModuleId: this.appModuleId
      },
      formConfig: [{
        type: 'radio',
        label: this.$t('page.newversion'),
        width: '100%',
        itemWidth: '100%',
        name: 'isNewversion',
        validateList: ['required'],
        dataList: [{
          text: this.$t('page.yes'),
          value: '1'
        }, {
          text: this.$t('page.no'),
          value: '0'          
        }],
        onChange: (val) => {
          if (this.versionData.appModuleId) {
            this.getVersion(this.versionData.appModuleId);
          }
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
        value: this.appSystemId,
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
        value: this.appModuleId,
        params: {systemId: this.appSystemId},
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
          this.versionData.versionTypeId = val;
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
      strategyData: {
        multiple: false,
        rowKey: 'uuid', 
        theadList: [{
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
        tbodyList: null
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
      this.$set(this.versionData, 'appModuleId', this.appModuleId);
      this.$set(this.versionTable, 'tbodyList', null);
      if (this.appModuleId) {
        this.setVal('appModuleId', this.appModuleId);
        this.getVersion(this.appModuleId);
      }
      if (this.appSystemId) {
        this.setVal('appSystemId', this.appSystemId);
        this.changeAppModule(this.appSystemId, true);
      }
    },
    close() {
      this.$emit('close');
    },
    saveEdit() {
      if (this.$refs.form.valid()) {
        if (this.versionData.versionStrategyId) {
          let param = {};
          if (this.isNewVersion) {
            //如果是新建的要校验必填信息
            if (this.$refs.versionform && this.$refs.versionform.valid() && this.$refs.nameInput.valid()) {
              Object.assign(param, {
                version: this.versionPrefix + this.versionData.version,
                versionTypeId: this.versionData.versionTypeId,
                versionStrategyId: this.versionData.versionStrategyId,
                appModuleId: this.versionData.appModuleId
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
                  name: this.versionPrefix + this.selectedversion[0].name,
                  uuid: this.selectedversion[0].uuid,
                  versionTypeId: this.selectedversion[0].versionTypeId,
                  versionStrategyId: this.selectedversion[0].versionStrategyId,
                  appModuleId: this.versionData.appModuleId
                });
                this.gotoCreate(this.selectedversion[0].uuid, this.selectedversion[0].type);
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
        this.versionData.versionStrategyId = vals[0].uuid;
        this.versionPrefix = vals[0].versionPrefix;
        this.selectedversion = vals;
      } else {
        this.versionData.versionStrategyId = '';
        this.versionPrefix = '';
        this.selectedversion = {};
      }
      this.hideName(this.versionData.versionStrategyId);
    },
    getstrategySelected(val, vals) {
      //新建版本，策略选中的话，
      if (val.length > 0) {
        this.versionData.versionStrategyId = vals[0].uuid;
        this.versionPrefix = vals[0].versionPrefix;
        this.selectedversion = vals;
        this.autofillName();
      } else {
        this.versionData.versionStrategyId = '';
        this.versionPrefix = '';
        this.selectedversion = {};
      }
      this.hideName(this.versionData.versionStrategyId);
    },
    hideName(id) {
      this.formConfig.forEach((form, findex) => {
        if (form.name == 'version') {
          form.isHidden = !id;
        }
      });
    },
    changeAppModule(val, iskeep) {
      // 改变子系统的入参
      this.versionData.appSystemId = val;
      this.versionData.appModuleId = !iskeep ? '' : this.versionData.appModuleId;
      this.versionData.versionStrategyId = '';
      this.hideName();
      this.formConfig.forEach((form, findex) => {
        if (form.name == 'appModuleId') {
          form.isHidden = !val;
          form.params = {systemId: val};
        }
      });
    },
    getVersion(val) {
      this.versionData.appModuleId = val;
      let param = {};
      Object.assign(param, {needPage: false});
      this.versionPrefix = '';
      this.versionData.versionStrategyId = '';
      this.hideName();
      if (val) {
        Object.assign(param, {appModuleId: val});
        if (this.isNewVersion) {
          this.$api.codehub.strategy.getList(param).then(res => {
            this.isLoad = false;
            if (res && res.Status == 'OK') {
              this.$set(this.strategyData, 'tbodyList', res.Return.list);
            } else {
              this.$set(this.strategyData, 'tbodyList', []);
            }
          });
        } else {
          this.$api.codehub.version.getList(param).then(res => {
            this.isLoad = false;
            if (res && res.Status == 'OK') {
              let list = res.Return.list || [];
              if (list.length > 0) {
                list.forEach(li => {
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
              this.$set(this.versionTable, 'tbodyList', list);
            } else {
              this.$set(this.versionTable, 'tbodyList', []);
            }
          });
        }
      } else {
        this.$set(this.versionTable, 'tbodyList', null);
        this.$set(this.strategyData, 'tbodyList', null);
      }
    },
    setVal(name, val) {
      this.formConfig.forEach((form, findex) => {
        if (form.name == name) {
          this.$set(form, 'value', val);
        }
      });
    },
    gotoCreate(uuid, type) {
      this.$router.push({ path: 'merge-create', query: {versionid: uuid, type: type} });
    },
    autofillName() {
      Object.assign(this.versionData, {
        name: ''
      });
      if (this.versionData.appModuleId && this.versionData.versionStrategyId && this.versionData.versionTypeId) {
        let param = {
          appModuleId: this.versionData.appModuleId,
          versionStrategyId: this.versionData.versionStrategyId, 
          versionTypeId: this.versionData.versionTypeId
        };
        this.$api.codehub.version.autofillName(param).then((res) => {
          if (res && res.Status == 'OK' && res.Return.version) {
            Object.assign(this.versionData, {
              name: res.Return.version.replace(this.versionPrefix, '')
            });
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

<template>
  <TsDialog v-bind="setting" @on-close="close">
    <template v-slot>
      <div>
        <TsForm
          ref="editform"
          :itemList="formConfig"
          :labelWidth="120"
        >
        </TsForm>
        <TsForm
          v-if="isNew =='1'"
          ref="versionform"
          class="mt-nm"
          :itemList="versionConfig"
          :labelWidth="120"
        >
          <template slot="name">
            <TsFormInput
              ref="nameInput"
              v-model="versionData.name"
              type="text"
              :validateList="vaildConfig"
              maxlength="100"
              :prepend="versionPrefix"
              width="100%"
              @on-change="updateName"
            />
          </template>
        </TsForm>  
        <!-- 不创建新版本——start    -->
        <div v-if="isNew !='1' &&versionTable.tbodyList && versionData.subsystemUuid">
          <TsTable v-bind="versionTable" @getSelected="getversionSelected">
            <template slot="type" slot-scope="{row}">
              {{ typeTxt[row.type] }}
            </template>
          </TsTable>
        </div>
        <!-- 不创建新版本——end    -->
        <!-- 创建新版本——start    -->
        <div v-if="isNew =='1' && strategyData.tbodyList && versionData.subsystemUuid">
          <TsTable v-bind="strategyData" @getSelected="getstrategySelected">
            <template slot="type" slot-scope="{row}">
              {{ typeTxt[row.type] }}
            </template>
          </TsTable>
        </div>
        <!-- 创建新版本——end    -->
      </div>
    </template>
    <template v-slot:footer>
      <div class="footer-btn-contain">
        <Button type="text" @click="close">取消</Button>
        <Button type="primary" @click="saveEdit">确定</Button>
      </div>
    </template>
  </TsDialog>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput.vue';
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    TsFormInput
  },
  props: {
    subsystemUuid: [String, Number],
    systemUuid: [String, Number]
  },
  data() {
    let _this = this;
    return {
      setting: {
        title: '创建MR',
        maskClose: false,
        isShow: true
      },
      isNew: '1',
      vaildConfig: ['required'],
      versionStrategyUuid: null,
      versionPrefix: '',
      versionTable: {
        multiple: false,
        rowKey: 'uuid', 
        theadList: [{
          key: 'selection'
        }, {
          title: '版本号',
          key: 'name'
        }, {
          title: 'MR类型',
          key: 'type'
        }, { 
          title: '源分支',
          key: 'srcBranch'
        }, {
          title: '目标分支',
          key: 'targetBranch'
        }, {
          title: '版本类型',
          key: 'versiontypeName' //这个没有可取字段,用的版本类型名字
        }],
        tbodyList: null
      },
      versionData: {
        uuid: '',
        name: '',
        versionTypeUuid: '',
        versionStrategyUuid: '',
        subsystemUuid: _this.subsystemUuid
      },
      formConfig: [{
        type: 'radio',
        label: '创建新版本',
        width: '100%',
        itemWidth: '100%',
        name: 'isNewversion',
        validateList: ['required'],
        dataList: [{
          text: '是',
          value: '1'
        }, {
          text: '否',
          value: '0'          
        }],
        value: '1',
        onChange: function(val) {
          _this.Updateversion(val);
        }
      }, {
        type: 'select',
        label: '系统',
        width: '100%',
        name: 'systemUuid',
        transfer: true,
        validateList: ['required'],
        dynamicUrl: '/api/rest/codehub/system/search',
        rootName: 'list',
        textName: 'name',
        valueName: 'uuid',
        value: _this.systemUuid,
        onChange: function(val) {
          _this.changeSubsys(val);
        }
      }, {
        type: 'select',
        isHidden: true,
        label: '子系统',
        name: 'subsystemUuid',
        width: '100%',
        transfer: true,
        validateList: ['required'],
        dynamicUrl: '/api/rest/codehub/subsystem/search',
        rootName: 'list',
        textName: 'name',
        valueName: 'uuid',
        value: _this.subsystemUuid,
        params: {systemId: _this.systemUuid},
        onChange: function(val) {
          _this.getVersion(val);
        }   
      }],
      typeTxt: {
        'branch': '按分支合并',
        'issue': '按需求合并'
      },
      versionConfig: [{
        type: 'select',
        label: '版本类型',
        width: '100%',
        name: 'versionTypeUuid',
        transfer: true,
        validateList: ['required'],
        url: '/api/rest/codehub/versiontype/search?isActive=1',
        rootName: 'list',
        textName: 'name',
        valueName: 'uuid',
        onChange: function(val) {
          _this.versionData.versionTypeUuid = val;
          _this.autofillName();
        } 
      }, {
        type: 'slot',
        isHidden: true,
        hidden: true,
        label: '版本号',
        width: '100%',
        name: 'name',
        validateList: ['required']
      }],
      selectedversion: {},
      strategyData: {
        multiple: false,
        rowKey: 'uuid', 
        theadList: [{
          key: 'selection'
        }, {
          title: '策略名称',
          key: 'name'
        }, {
          title: '类型',
          key: 'type'
        }, { 
          title: '源分支',
          key: 'srcBranch'
        }, {
          title: '目标分支',
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
    this.$set(this.versionTable, 'tbodyList', null);
  },
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
    updateName(name) {
      this.versionData.name = name;
    },
    saveEdit() {
      let _this = this;
      if (this.$refs.editform.valid()) {
        if (this.versionData.versionStrategyUuid) {
          let param = {};
          if (this.isNew == '1') {
            //如果是新建的要校验必填信息
            if (this.$refs.versionform && this.$refs.versionform.valid() && this.$refs.nameInput.valid()) {
              Object.assign(param, {
                name: this.versionPrefix + this.versionData.name,
                versionTypeUuid: this.versionData.versionTypeUuid,
                versionStrategyUuid: this.versionData.versionStrategyUuid,
                subsystemUuid: this.versionData.subsystemUuid
              });
              this.$api.codehub.version.save(param).then(res => {
                if (res && res.Status == 'OK') {
                  _this.gotoCreate(res.Return, this.selectedversion[0].type);
                  _this.$emit('close', true);
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
                  versionTypeUuid: this.selectedversion[0].versionTypeUuid,
                  versionStrategyUuid: this.selectedversion[0].versionStrategyUuid,
                  subsystemUuid: this.versionData.subsystemUuid
                });
                this.gotoCreate(this.selectedversion[0].uuid, this.selectedversion[0].type);
                this.$emit('close', true);
              } else {
                this.$Notice.error({
                  title: '该版本无法创建新的MR'
                });
              }

              // this.$api.codehub.version.save(param).then(res => {
              //   this.$emit('close', true);
              // });
            }
          }
        } else {
          this.$Message.error('请从表格里勾选一个策略');
        }
      }
    },
    getversionSelected(val, vals) {
      //不新建版本，选中对应版本
      if (val.length > 0) {
        this.versionData.versionStrategyUuid = vals[0].uuid;
        this.versionPrefix = vals[0].versionPrefix;
        this.selectedversion = vals;
      } else {
        this.versionData.versionStrategyUuid = '';
        this.versionPrefix = '';
        this.selectedversion = {};
      }
      this.hideName(this.versionData.versionStrategyUuid);
    },
    getstrategySelected(val, vals) {
      //新建版本，策略选中的话，
      if (val.length > 0) {
        this.versionData.versionStrategyUuid = vals[0].uuid;
        this.versionPrefix = vals[0].versionPrefix;
        this.selectedversion = vals;
        this.autofillName();
      } else {
        this.versionData.versionStrategyUuid = '';
        this.versionPrefix = '';
        this.selectedversion = {};
      }
      this.hideName(this.versionData.versionStrategyUuid);
    },
    hideName(id) {
      this.versionConfig.forEach((form, findex) => {
        if (form.name == 'name') {
          form.isHidden = !id;
        }
      });
    },
    changeSubsys(val, iskeep) {
      let _this = this;
      _this.versionData.systemUuid = val;
      _this.versionData.subsystemUuid = !iskeep ? '' : _this.versionData.subsystemUuid;
      _this.versionData.versionStrategyUuid = '';
      _this.hideName();
      _this.formConfig.forEach((form, findex) => {
        if (form.name == 'subsystemUuid') {
          form.isHidden = !val;
          form.params = {systemId: val};
        }
      });
    },
    getVersion(val) {
      this.versionData.subsystemUuid = val;
      let param = {};
      Object.assign(param, {needPage: false});
      this.versionPrefix = '';
      this.versionData.versionStrategyUuid = '';
      this.hideName();
      if (val) {
        Object.assign(param, {subsystemUuid: val});
        if (this.isNew == '1') {
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
                      versionTypeUuid: li.versionTypeStrategyRelationVo.versionTypeUuid,
                      versionStrategyUuid: li.versionTypeStrategyRelationVo.versionStrategyUuid
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
      let _this = this;
      this.formConfig.forEach((form, findex) => {
        if (form.name == name) {
          _this.$set(form, 'value', val);
        }
      });
    },
    Updateversion(val) {
      this.isNew = val;
    },
    gotoCreate(uuid, type) {
      this.$router.push({ path: 'merge-create', query: {versionid: uuid, type: type} });
    },
    autofillName() {
      Object.assign(this.versionData, {
        name: ''
      });
      if (this.versionData.subsystemUuid && this.versionData.versionStrategyUuid && this.versionData.versionTypeUuid) {
        let param = {
          subsystemUuid: this.versionData.subsystemUuid,
          versionStrategyUuid: this.versionData.versionStrategyUuid, 
          versionTypeUuid: this.versionData.versionTypeUuid
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
  },
  watch: {
    subsystemUuid: {
      handler: function(val) {
        this.$set(this.versionData, 'subsystemUuid', val);
        if (val) {
          this.setVal('subsystemUuid', val);
          this.getVersion(val);
        }
      },
      immediate: true
    }, 
    systemUuid: {
      handler: function(val) {
        if (val) {
          this.setVal('systemUuid', val);
          this.changeSubsys(val, true);
        }
      },
      immediate: true
    },
    isNew: {
      handler: function(val) {
        if (this.versionData.subsystemUuid) {
          this.getVersion(this.versionData.subsystemUuid);
        }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
</style>

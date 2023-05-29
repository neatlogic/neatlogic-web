<template>
  <TsDialog v-bind="setting" :isShow="isShow" @on-close="close">
    <template v-slot>
      <div>
        <TsForm
          ref="editform"
          :itemList="formConfig"
          itemWidth="50%"
          :labelWidth="80"
        >
          <template slot="subsystemUuid">
            <TsFormSelect
              v-model="versionData.subsystemUuid"
              v-bind="subsystemConfig"
              width="75%"
              :selectItemList.sync="selectSub"
            />
          </template>
        </TsForm>
        <TsForm
          ref="versionform"
          :itemList="versionConfig"
          itemWidth="50%"
          :labelWidth="80"
        >
          <template slot="name">
            <TsFormInput
              ref="nameInput"
              v-model="versionData.name"
              type="text"
              :validateList="vaildConfig"
              maxlength="100"
              :prepend="strategyPre"
              width="100%"
              @on-change="updateName"
            />
          </template>

        </TsForm>        
        <div v-if="strategyData.tbodyList && versionData.subsystemUuid">
          <TsTable v-bind="strategyData" @getSelected="getSelected">
            <template slot="type" slot-scope="{row}">
              {{ typeTxt[row.type] }}
            </template>
          </TsTable>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <div class="footer-btn-contain">
        <Button type="text" @click="close">取消</Button>
        <Button type="primary" :disabled="saving" @click="saveEdit">确定</Button>
      </div>
    </template>
  </TsDialog>
</template>
<script>
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput.vue';
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect.vue';
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    TsTable: resolve => require(['@/resources/components/TsTable/TsTable'], resolve),
    TsFormInput,
    TsFormSelect
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    uuid: {type: [String, Boolean]},
    subsystemUuid: [String, Number],
    systemUuid: [String, Number]
  },
  data() {
    let _this = this;
    return {
      setting: {
        title: _this.uuid ? '编辑版本' : '新增版本',
        maskClose: false
      },
      vaildConfig: ['required'],
      selectSub: null,
      versionStrategyUuid: null,
      strategyPre: '',
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
      },
      versionData: {
        name: '',
        versionTypeUuid: '',
        versionStrategyUuid: '',
        subsystemUuid: ''
      },
      formConfig: [{
        type: 'select',
        label: '系统',
        width: '100%',
        name: 'systemUuid',
        transfer: true,
        validateList: ['required'],
        dynamicUrl: '/module/codehub/api/rest/system/search',
        rootName: 'list',
        textName: 'name',
        valueName: 'uuid',
        value: _this.systemUuid,
        onChange: function(val) {
          _this.changeSubsys(val);
        }
      }, {
        type: 'slot',
        label: '子系统',
        name: 'subsystemUuid',
        validateList: ['required']
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
        url: '/module/codehub/api/rest/versiontype/search?isActive=1',
        rootName: 'list',
        textName: 'name',
        valueName: 'uuid',
        onChange: function(val) {
          _this.versionData.versionTypeUuid = val;
          _this.autofillName(_this.versionData);
        } 
      }, {
        type: 'slot',
        isHidden: true,
        label: '版本号',
        width: '100%',
        name: 'name',
        validateList: ['required']
      }],
      subsystemConfig: {
        width: '100%',
        transfer: true,
        validateList: ['required'],
        dynamicUrl: '/module/codehub/api/rest/subsystem/search',
        rootName: 'list',
        textName: 'name',
        valueName: 'uuid' 
      },
      saving: false
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.$set(this.strategyData, 'tbodyList', null);
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
      if (this.$refs.editform.valid()) {
        if (this.versionData.versionStrategyUuid) {
          if (this.$refs.versionform && this.$refs.versionform.valid() && this.$refs.nameInput.valid()) {
            let param = {};
            Object.assign(param, this.versionData);
            Object.assign(param, {
              name: this.strategyPre + this.versionData.name
            });
            if (this.uuid) {
              Object.assign(param, {uuid: this.uuid});
            }
            this.saving = true;
            this.$api.codehub.version.save(param).then(res => {
              this.saving = false;
              this.$emit('close', true);
            }).catch(e => {
              this.saving = false;
            });
          }
        } else {
          this.saving = false;
          this.$Message.error('请选择策略');
        }
      }
    },
    getSelected(val, vals) {
      if (val.length > 0) {
        this.versionData.versionStrategyUuid = vals[0].uuid;
        this.strategyPre = vals[0].versionPrefix;
      } else {
        this.versionData.versionStrategyUuid = '';
        this.strategyPre = '';
      }
      this.hideName(this.versionData.versionStrategyUuid);
      this.autofillName(this.versionData);
    },
    hideName(id) {
      this.versionConfig.forEach((form, findex) => {
        if (form.name == 'name') {
          form.isHidden = !id;
        }
      });
    },
    changeSubsys(val) {
      let _this = this;
      _this.versionData.systemUuid = val;
      _this.versionData.subsystemUuid = '';
      _this.versionData.versionStrategyUuid = '';
      _this.hideName();
      if (val) {
        _this.$set(_this.subsystemConfig, 'params', {systemId: val});
        _this.$set(_this.subsystemConfig, 'dynamicUrl', '/module/codehub/api/rest/subsystem/search');
      } else {
        _this.$set(_this.subsystemConfig, 'params', {});
        _this.$set(_this.subsystemConfig, 'dynamicUrl', '');
      }
    },
    getVersion(val) {
      let param = {};
      Object.assign(param, {needPage: false});
      this.strategyPre = '';
      this.versionData.versionStrategyUuid = '';
      this.hideName();
      if (val) {
        Object.assign(param, {subsystemUuid: val});
        this.$api.codehub.strategy.getList(param).then(res => {
          this.isLoad = false;
          if (res && res.Status == 'OK') {
            this.$set(this.strategyData, 'tbodyList', res.Return.list);
          } else {
            this.$set(this.strategyData, 'tbodyList', []);
          }
        });
      } else {
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
    autofillName(config) {
      let subsystemUuid = config.subsystemUuid || '';
      let versionStrategyUuid = config.versionStrategyUuid || '';
      let versionTypeUuid = config.versionTypeUuid || '';
      Object.assign(this.versionData, {
        name: ''
      });
      if (subsystemUuid && versionStrategyUuid && versionTypeUuid) {
        let param = {
          subsystemUuid: subsystemUuid,
          versionStrategyUuid: versionStrategyUuid, 
          versionTypeUuid: versionTypeUuid
        };
        this.$api.codehub.version.autofillName(param).then((res) => {
          if (res && res.Status == 'OK' && res.Return.version) {
            Object.assign(this.versionData, {
              name: res.Return.version.replace(this.strategyPre, '')
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
    uuid: {
      handler: function(val) {
        if (val) {
          //this.getDetail(val);
        } else {
          this.formConfig.forEach(form => {
            if (form.name == 'isActive') {
              this.$set(form, 'value', 1);
            } else {
              this.$set(form, 'value', '');
            }
          });
        }
        this.$set(this.setting, 'title', val ? '编辑版本' : '新增版本');
      },
      immediate: true
    },
    subsystemUuid: {
      handler: function(val) {
        if (val) {
          this.$set(this.versionData, 'subsystemUuid', val);
        }
      },
      immediate: true
    }, 
    systemUuid: {
      handler: function(val) {
        if (val) {
          this.setVal('systemUuid', val);
          this.$set(this.subsystemConfig, 'params', {systemId: val});
          this.$set(this.subsystemConfig, 'dynamicUrl', '/module/codehub/api/rest/subsystem/search');
        }
      },
      immediate: true
    },
    selectSub: {
      handler: function(val) {
        if (val && val.uuid) {
          this.getVersion(val.uuid);
        }
      },
      deep: true
    },
    versionData: {
      handler: function(val, oldval) {
        // if (val && (oldvalval.versionStrategyUuid != oldval.versionStrategyUuid) && val.versionTypeUuid && val.subsystemUuid) {
        //   this.autofillName(val.subsystemUuid, val.versionStrategyUuid, val.versionTypeUuid);
        // }
      },
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
</style>

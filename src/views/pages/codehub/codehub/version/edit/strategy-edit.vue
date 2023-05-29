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
            @on-change="setSrcbranch"
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
      <!-- <TsForm ref="branchform" :itemList="branchConfig">
        </TsForm> -->
    </div>
    <template v-slot:footer>
      <div class="footer-btn-contain">
        <Button type="text" @click="close">取消</Button>
        <Button type="primary" :disabled="saving" @click="saveEdit">确定</Button>
      </div>
    </template>
  </TsDialog>
</template>
<script>
import TsFormSelect from '@/resources/plugins/TsForm/TsFormSelect.vue';
import TsFormRadio from '@/resources/plugins/TsForm/TsFormRadio.vue';
import TsFormInput from '@/resources/plugins/TsForm/TsFormInput.vue';
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    TsFormSelect,
    TsFormRadio,
    TsFormInput
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
    let _this = this;
    return {
      setting: {
        title: _this.uuid ? '编辑策略' : '新增策略',
        maskClose: false
      },
      selectSub: null,
      vaildConfig: ['required'],
      statusVal: [], //需求状态
      formConfig: [{
        type: 'text',
        label: '名称',
        name: 'name',
        validateList: ['required'],
        onChange: function(val) {
          _this.editvalList.name = val;
        }
      }, {
        type: 'text',
        label: '版本前缀',
        name: 'versionPrefix',
        // validateList: ['required'],
        onChange: function(val) {
          _this.editvalList.versionPrefix = val;
        }
      }, {
        type: 'select',
        label: '版本类型',
        transfer: true,
        name: 'versionTypeUuid',
        dynamicUrl: '/module/codehub/api/rest/versiontype/search?isActive=1',
        rootName: 'list',
        textName: 'name',
        valueName: 'uuid',
        idListName: 'uuid',
        onChange: function(val) {
          _this.editvalList.versionTypeUuid = val;
        }
      }, {
        type: 'select',
        label: '策略类型',
        name: 'type',
        transfer: true,
        validateList: ['required'],
        dataList: [{
          text: '分支',
          value: 'branch'
        },
        {
          text: '需求',
          value: 'issue'
        }],
        value: 'branch',
        onChange: function(val) {
          _this.editvalList.type = val;
        }
      }, {
        type: 'select',
        label: '系统',
        name: 'systemUuid',
        transfer: true,
        dynamicUrl: '/module/codehub/api/rest/system/search',
        rootName: 'list',
        textName: 'name',
        valueName: 'uuid',
        idListName: 'uuid',
        validateList: ['required'],
        value: '',
        onChange: function(val) {
          _this.changeSubsys(val);
        }
      }, {
        type: 'slot',
        label: '子系统',
        name: 'subsystemUuid',
        validateList: ['required'],
        isHidden: true
      }, {
        type: 'slot',
        label: '需求状态',
        name: 'issueStatusUuid',
        isHidden: true
      },  
      {
        type: 'slot',
        label: '固定源分支',
        name: 'usePattern',
        validateList: ['required'],
        isHidden: true       
      }, {
        type: 'slot',
        label: '源分支',
        name: 'srcBranch',
        isHidden: true
      }, {
        type: 'slot',
        label: '目标分支',
        name: 'targetBranch',
        //validateList: ['required'],
        isHidden: true
      }
      ],
      typeTxt: {
        'branch': '按分支合并',
        'issue': '按需求合并'
      },
      subsystemConfig: {
        transfer: true,
        isHidden: true,
        dynamicUrl: '/module/codehub/api/rest/subsystem/search',
        rootName: 'list',
        textName: 'name',
        valueName: 'uuid',
        idListName: 'uuid',
        validateList: ['required']
      },
      usepatternConfig: {
        validateList: ['required'],
        dataList: [{
          text: '是',
          value: '0'
        },
        {
          text: '否',
          value: '1'
        }],
        value: '1'
      }, 
      srcbranchConfig: {
        transfer: true,
        dynamicUrl: '/module/codehub/api/rest/repository/branch/search',
        rootName: 'list',
        textName: 'name',
        valueName: 'name',
        idListName: 'keyword',
        params: {}
      },
      targetbranchConfig: {
        transfer: true,
        dynamicUrl: '/module/codehub/api/rest/repository/branch/search',
        rootName: 'list',
        textName: 'name',
        valueName: 'name',
        idListName: 'keyword',
        // validateList: ['required'],
        params: {}
      },
      editvalList: {
        name: '',
        srcBranch: '',
        subsystemUuid: _this.subsystemUuid,
        targetBranch: '',
        type: '',
        usePattern: '1',
        uuid: '',
        versionPrefix: '',
        versionTypeUuid: '' 
      },
      issueStatusconfig: {
        transfer: true,
        url: '/module/codehub/api/rest/issue/status/get',
        rootName: 'list',
        textName: 'displayName',
        valueName: 'uuid',
        multiple: true,
        params: {}
      },
      saving: false
    };
  },
  beforeCreate() {},
  created() {
  },
  beforeMount() {},
  mounted() {
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
    updatesystemsetting(val) {
      let _this = this;
      let hideList = ['usePattern', 'srcBranch', 'targetBranch', 'issueStatusUuid'];
      _this.editvalList.subsystemUuid = val;
      _this.editvalList.usePattern = '1';
      _this.editvalList.srcBranch = '';
      _this.editvalList.targetBranch = '';
      _this.statusVal = [];
      _this.formConfig.forEach((form, findex) => {
        if (hideList.indexOf(form.name) > -1) {
          _this.$set(form, 'isHidden', !val);
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
      let _this = this;
      let hideList = ['subsystemUuid', 'usePattern', 'srcBranch', 'targetBranch', 'issueStatusUuid'];
      _this.editvalList.subsystemUuid = '';
      _this.editvalList.usePattern = '1';
      _this.editvalList.srcBranch = '';
      _this.editvalList.targetBranch = '';
      this.formConfig.forEach((form, findex) => {
        // if (form.name == 'subsystemUuid') {
        //   _this.$set(form, 'isHidden', !val);
        // }
        if (hideList.indexOf(form.name) > -1) {
          _this.$set(form, 'isHidden', !val);
        }
      });
      this.$set(this.subsystemConfig, 'params', {systemId: val}); 
      this.updatesystemsetting('');
    },
    getDetail(val) {
      let _this = this;
      _this.$set(_this.editvalList, 'subsystemUuid', '');
      if (val) {
        this.$api.codehub.strategy.getDetail({uuid: val}).then(res => {
          if (res && res.Status == 'OK') {
            if (res.Return.subsystemUuid) {
              _this.updatesystemsetting(res.Return.subsystemUuid);
            }
            Object.assign(_this.editvalList, {
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
            _this.statusVal = res.Return.issueStatusUuid ? res.Return.issueStatusUuid.split(',') : [];
          } else {
            _this.editvalList = {};
            _this.statusVal = [];
          }
        });
      } else {
        _this.editvalList = {};
      }
    },
    updataVal(name, val) {
      let _this = this;
      _this.formConfig.forEach(form => {
        if (form.name == name) {
          _this.$set(form, 'value', val);
          val && _this.$set(form, 'isHidden', false);
        }
      });
    },
    updateRelate(val) {
      //单独更新子系统相关的参数（不改变值）
      let _this = this;
      let hideList = ['usePattern', 'srcBranch', 'targetBranch', 'issueStatusUuid'];
      _this.formConfig.forEach((form, findex) => {
        if (hideList.indexOf(form.name) > -1) {
          _this.$set(form, 'isHidden', !val);
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
    setSrcbranch(val) {
      // if (val == '1') {
      //   this.srcbranchConfig.type = 'select';
      // } else {
      //   this.srcbranchConfig.type = 'text';
      // }
    }

  },
  computed: {
  },
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
        this.$set(this.setting, 'title', val ? '编辑策略' : '新增策略');
      },
      immediate: true
    },
    selectSub: {
      handler: function(val, oldeval) {
        let _this = this;
        if (val && val.systemVo) {
          _this.updataVal('systemUuid', val.systemVo.uuid);
          _this.$set(_this.subsystemConfig, 'params', {systemId: val.systemVo.uuid});
        }
        // if (val && val.uuid) {
        //   _this.updatesystemsetting(val.uuid);
        // }
      },
      immediate: true,
      deep: true
    },
    editvalList: {
      handler: function(val) {
        let _this = this;
        if (val && val.name) {
          if (val.subsystemUuid) {
            _this.$set(this.setting, 'height', '500px');
            Object.assign(_this.srcbranchConfig.params, {
              subsystemUuid: val.subsystemUuid
            });
            Object.assign(_this.targetbranchConfig.params, {
              subsystemUuid: val.subsystemUuid
            });
          } else {
            this.$set(this.setting, 'height', '300px');
          }
          _this.formConfig.forEach(form => {
            if (val[form.name]) {
              _this.$set(form, 'value', val[form.name]);
              _this.$set(form, 'isHidden', false);
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

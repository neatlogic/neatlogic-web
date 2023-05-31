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
        <Button type="text" @click="close">{{ $t('page.cancel') }}</Button>
        <Button type="primary" :disabled="saving" @click="saveEdit">{{ $t('page.confirm') }}</Button>
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
    return {
      setting: {
        title: this.uuid ? this.$t('dialog.title.edittarget', {'target': this.$t('page.versions')}) : this.$t('page.newtarget', {'target': this.$t('page.versions')}),
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
      },
      versionData: {
        name: '',
        versionTypeUuid: '',
        versionStrategyUuid: '',
        subsystemUuid: ''
      },
      formConfig: [{
        type: 'select',
        label: this.$t('page.system'),
        width: '100%',
        name: 'systemUuid',
        transfer: true,
        validateList: ['required'],
        dynamicUrl: '/api/rest/codehub/system/search',
        rootName: 'list',
        textName: 'name',
        valueName: 'uuid',
        value: this.systemUuid,
        onChange: (val) => {
          this.changeSubsys(val);
        }
      }, {
        type: 'slot',
        label: this.$t('page.subsystem'),
        name: 'subsystemUuid',
        validateList: ['required']
      }],
      typeTxt: {
        branch: this.$t('term.codehub.branchmerge'),
        issue: this.$t('term.codehub.issuemerge')
      },
      versionConfig: [{
        type: 'select',
        label: this.$t('page.versiontype'),
        width: '100%',
        name: 'versionTypeUuid',
        transfer: true,
        validateList: ['required'],
        url: '/api/rest/codehub/versiontype/search?isActive=1',
        rootName: 'list',
        textName: 'name',
        valueName: 'uuid',
        onChange: (val) => {
          this.versionData.versionTypeUuid = val;
          this.autofillName(this.versionData);
        } 
      }, {
        type: 'slot',
        isHidden: true,
        label: this.$t('term.framework.pkgversion'),
        width: '100%',
        name: 'name',
        validateList: ['required']
      }],
      subsystemConfig: {
        width: '100%',
        transfer: true,
        validateList: ['required'],
        dynamicUrl: '/api/rest/codehub/subsystem/search',
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
          this.$Message.error(this.$t('form.validate.required', {target: this.$t('term.process.policy')}));
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
      this.versionData.systemUuid = val;
      this.versionData.subsystemUuid = '';
      this.versionData.versionStrategyUuid = '';
      this.hideName();
      if (val) {
        this.$set(this.subsystemConfig, 'params', {systemId: val});
        this.$set(this.subsystemConfig, 'dynamicUrl', '/api/rest/codehub/subsystem/search');
      } else {
        this.$set(this.subsystemConfig, 'params', {});
        this.$set(this.subsystemConfig, 'dynamicUrl', '');
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
      this.formConfig.forEach((form, findex) => {
        if (form.name == name) {
          this.$set(form, 'value', val);
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
  computed: {},
  watch: {
    uuid: {
      handler: function(val) {
        if (!val) {
          this.formConfig.forEach(form => {
            if (form.name == 'isActive') {
              this.$set(form, 'value', 1);
            } else {
              this.$set(form, 'value', '');
            }
          });
        }
        this.$set(this.setting, 'title', val ? this.$t('dialog.title.edittarget', {'target': this.$t('page.versions')}) : this.$t('page.newtarget', {'target': this.$t('page.versions')}));
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
          this.$set(this.subsystemConfig, 'dynamicUrl', '/api/rest/codehub/subsystem/search');
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
    }
  }
};
</script>
<style lang="less" scoped>
</style>

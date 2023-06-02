<template>
  <TsDialog v-bind="setting" :isShow="isShow" @on-close="close">
    <template v-slot>
      <div>
        <TsForm ref="editform" :itemList="formConfig">
          <template slot="subsystemUuid">
            <TsFormSelect
              v-model="subsystemUuid"
              v-bind="subsystemConfig"
              width="75%"
              :selectItemList.sync="selectSub"
            />
          </template>
        </TsForm>
        <TsForm ref="projectForm" :itemList="projectConfig">
          <template v-for="(project,pindex) in projectConfig" :slot="project.name">
            <TsFormSelect
              :key="pindex"
              v-model="project.value"
              v-bind="project"
              width="75%"
            />
          </template>
        </TsForm>
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
export default {
  name: '',
  components: {
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm.vue'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  filters: {},
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    projectList: Array, //项目分类对应数据
    list: Object, //如果是从行点击进来的有数据
    uuid: String, //外部携带的子系统uuid
    systemUuid: String//外部携带的系统uuid
  },
  data() {
    let _this = this;
    return {
      setting: {//弹窗设置
        title: this.$t('dialog.title.edittarget', {'target': this.$t('page.mapping')}),
        maskClose: false
      },
      selectSub: null,
      vaildConfig: ['required'],
      subsystemUuid: '',
      systemId: '',
      statusVal: [],
      formConfig: [{
        type: 'select',
        label: this.$t('page.system'),
        name: 'systemUuid',
        transfer: true,
        dynamicUrl: '/api/rest/codehub/system/search',
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'id',
        idListName: 'id',
        validateList: ['required'],
        onChange: function(val) {
          _this.changeSubsys(val);
        }
      }, {
        type: 'slot',
        label: this.$t('page.subsystem'),
        name: 'subsystemUuid',
        isHidden: true
      }],
      projectConfig: [],
      projectValuelist: {},
      subsystemConfig: {
        transfer: true,
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'id',
        idListName: 'id',
        dynamicUrl: '/api/rest/codehub/appmodule/search'
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
    saveEdit() {
      if (this.$refs.editform.valid()) {
        let projectList = [];
        let isValidproject = false;
        for (var i in this.projectValuelist) {
          if (this.projectValuelist[i].length > 0) {
            isValidproject = true;
            let li = this.projectValuelist[i].map(p => {
              return {
                sourceUuid: p.sourceUuid,
                projectKey: p.projectKey,
                projectName: p.projectName
              };
            }); 
            projectList = projectList.concat(li);
          }
        }
        if (isValidproject) {
          let param = {
            subsystemUuid: this.subsystemUuid || '0',
            projectList: projectList,
            systemUuid: this.systemId || '0'
          };
          this.saving = true;
          this.$api.codehub.project.save(param).then(res => {
            this.saving = false;
            this.$Message.success(this.$t('message.executesuccess'));
            this.$emit('close', true);
          }).catch(e => {
            this.saving = false;
          });
        } else {
          this.$Message.error(this.$t('term.codehub.pleaseselectaproject'));
        }
      }
    },
    changeSubsys(val) {
      let _this = this;
      _this.systemId = val;
      _this.subsystemUuid = '';
      if (val) {
        this.$set(this.subsystemConfig, 'params', {systemId: val});
        this.$set(this.subsystemConfig, 'dynamicUrl', '/api/rest/codehub/appmodule/search');
        this.showSub(true);
      } else {
        this.$set(this.subsystemConfig, 'params', {});
        this.$set(this.subsystemConfig, 'dynamicUrl', '');        
        this.showSub(false);
      }
    },
    showSub(isshow) {
      this.formConfig.forEach(fo => {
        if (fo.name == 'subsystemUuid') {
          this.$set(fo, 'isHidden', !isshow);
        }
      });
    },
    updataVal(name, val) {
      this.formConfig.forEach(fo => {
        if (fo.name == name) {
          this.$set(fo, 'value', val);
          this.$set(fo, 'isHidden', !val);
        }
      });
      if (name == 'systemUuid') {
        this.systemId = val;
        this.$set(this.subsystemConfig, 'dynamicUrl', '/api/rest/codehub/appmodule/search');
        this.$set(this.subsystemConfig, 'params', {systemId: val});
        this.showSub(true);
      }
    },
    changeProject(li, uuid) {
      this.projectValuelist['source-' + uuid.toString()] = li;
    },
    initProjectconfig(list) {
      let _this = this;
      this.projectConfig = [];
      if (list.length > 0) {
        list.forEach(d => {
          let dataLi = [];
          if (d.dataList.length > 0) {
            dataLi = d.dataList.filter(da => {
              da.sourceUuid = d.sourceUuid;
              return da;
            });
          }
          this.projectValuelist['source-' + d.sourceUuid.toString()] = [];
          this.projectConfig.push({
            type: 'slot',
            label: d.sourceName,
            name: d.sourceUuid,
            transfer: true,
            multiple: true,
            valueName: 'projectKey',
            textName: 'projectName',
            dataList: dataLi,
            search: true,
            value: '',
            onChange: function(val, vals, items) {
              _this.changeProject(items, d.sourceUuid);
            }
          });
        });
      }
    },
    setProjectval(uuid, value) {
      let _this = this;
      this.projectConfig.forEach(pro => {
        if (pro.name == uuid) {
          _this.$set(pro, 'value', value);
        }
      });
    }
  },
  computed: {},
  watch: {
    selectSub: {
      handler: function(val) {
        let _this = this;
        if (val && val.systemVo) {
          _this.updataVal('systemUuid', val.systemVo.uuid);
        }
      },
      immediate: true,
      deep: true
    },
    projectList: {
      handler: function(val) {
        this.projectConfig = [];
        if (val && val.length > 0) {
          this.initProjectconfig(val);
        }
      },
      immediate: true,
      deep: true    
    },
    list: {
      handler: function(val) {
        let _this = this;
        if (val && Object.keys(val).length) {
          if (val.systemVo) {
            _this.updataVal('systemUuid', val.systemVo.uuid);
            _this.changeSubsys(val.systemVo.uuid);
          }
          if (val.uuid) {
            _this.subsystemUuid = val.uuid;
            _this.updataVal('subsystemUuid', val.uuid);
          }
        }
        this.setting.title = this.$t('dialog.title.edittarget', {'target': this.$t('page.mapping')});
        if (val.projectList && val.projectList.length > 0) {
          if (this.projectConfig && this.projectConfig.length > 0) {
            this.projectConfig.forEach((pro) => {
              let lis = val.projectList.filter((p) => {
                return p.sourceUuid == pro.name;
              });
              let li = lis.map((r) => {
                return r.projectKey;
              });
              Object.assign(pro, {
                value: li
              });
              _this.changeProject(lis, pro.name);
            });
            this.$forceUpdate();
          }
        }
      },
      immediate: true,
      deep: true      
    },
    uuid: {
      handler: function(val) {
        if (!this.list || !this.list.uuid && val) {
          this.subsystemUuid = val;
        }
      },
      immediate: true
    },
    systemUuid: {
      handler: function(val) {
        if (!this.list || !this.list.uuid && val) {
          this.updataVal('systemUuid', val);
        }
      },
      immediate: true      
    }

  }
};
</script>

<template>
  <TsDialog v-bind="setting" @on-close="close">
    <template v-slot>
      <div>
        <TsForm ref="editform" :itemList="formConfig">
          <template slot="appModuleId">
            <TsFormSelect :selectItemList.sync="selectSub" />
          </template>
        </TsForm>
        <TsForm ref="projectForm" :itemList="projectConfig">
          <template v-for="(project, pindex) in projectConfig" :slot="project.name">
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
    projectList: Array, //项目分类对应数据
    rowLi: Object //如果是从行点击进来的有数据
  },
  data() {
    let _this = this;
    return {
      setting: {
        //弹窗设置
        title: this.$t('dialog.title.edittarget', { target: this.$t('page.mapping') }),
        maskClose: false,
        isShow: true
      },
      selectSub: null,
      vaildConfig: ['required'],
      appModuleId: null,
      appSystemId: null,
      statusVal: [],
      formValue: {},
      formConfig: [
        {
          type: 'select',
          label: this.$t('page.system'),
          name: 'appSystemId',
          transfer: true,
          dynamicUrl: 'api/rest/deploy/app/config/appsystem/search',
          rootName: 'tbodyList',
          dealDataByUrl: this.$utils.getAppForselect,
          validateList: ['required'],
          value: this.appSystemId,
          onChange: function(val) {
            _this.changeAppModule(val);
          }
        },
        {
          type: 'select',
          label: this.$t('page.module'),
          name: 'appModuleId',
          isHidden: false,
          transfer: true,
          value: this.appModuleId,
          dealDataByUrl: this.$utils.getAppForselect,
          dynamicUrl: '/api/rest/deploy/app/config/module/list',
          onChange: function(val) {
            _this.setModule(val);
          }
        }
      ],
      projectConfig: [],
      projectValuelist: {},
      saving: false
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
    close() {
      this.$emit('close');
    },

    initData() {
      if (this.rowLi && this.rowLi.id) {
        this.appSystemId = this.rowLi.appSystemVo.id;
        this.appModuleId = this.rowLi.id;
        if (this.appSystemId) {
          this.setVal('appSystemId', this.appSystemId);
          this.changeAppModule(this.appSystemId);
        }
        if (this.appModuleId) {
          this.setVal('appModuleId', this.appModuleId);
        }
      }
      
      if (this.projectList && this.projectList.length > 0) {
        this.initProjectconfig(this.projectList);
      }

      let val = this.rowLi;
      let _this = this;
      this.setting.title = this.$t('dialog.title.edittarget', {'target': this.$t('page.mapping')});
      if (val.projectList && val.projectList.length > 0) {
        if (this.projectConfig && this.projectConfig.length > 0) {
          this.projectConfig.forEach((pro) => {
            let lis = val.projectList.filter((p) => {
              return p.sourceId == pro.name;
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

    setVal(name, val) {
      this.formConfig.forEach((form, findex) => {
        if (form.name == name) {
          this.$set(form, 'value', val);
        }
      });
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
                sourceId: p.sourceId,
                projectKey: p.projectKey,
                projectName: p.projectName
              };
            });
            projectList = projectList.concat(li);
          }
        }
        if (isValidproject) {
          let param = {
            appModuleId: this.appModuleId || 0,
            projectList: projectList,
            appSystemId: this.appSystemId || 0
          };
          this.saving = true;
          this.$api.codehub.project
            .save(param)
            .then(res => {
              this.saving = false;
              this.$Message.success(this.$t('message.executesuccess'));
              this.$emit('close', true);
            })
            .catch(e => {
              this.saving = false;
            });
        } else {
          this.$Message.error(this.$t('term.codehub.pleaseselectaproject'));
        }
      }
    },
    changeAppModule(val) {
      let _this = this;
      _this.appSystemId = val;
      if (val) {
        this.formConfig.forEach(fo => {
          if (fo.name == 'appModuleId') {
            //this.$set(fo, 'isHidden', !isshow);
            this.$set(fo, 'params', { appSystemId: val });
            this.$set(fo, 'dynamicUrl', '/api/rest/deploy/app/config/module/list');
            this.showSub(true);
          }
        });
      } else {
        this.formConfig.forEach(fo => {
          if (fo.name == 'appModuleId') {
            this.$set(fo, 'params', {});
            this.$set(fo, 'dynamicUrl', '');
            this.showSub(true);
          }
        });
      }
    },

    setModule(val) {
      let _this = this;
      _this.appModuleId = val;
    },

    showSub(isshow) {
      this.formConfig.forEach(fo => {
        if (fo.name == 'appModuleId') {
          this.$set(fo, 'isHidden', !isshow);
        }
      });
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
              da.sourceId = d.sourceId;
              return da;
            });
          }
          this.projectValuelist['source-' + d.sourceId.toString()] = [];
          this.projectConfig.push({
            type: 'select',
            label: d.sourceName,
            name: d.sourceId.toString(),
            transfer: true,
            multiple: true,
            valueName: 'projectKey',
            textName: 'projectName',
            dataList: dataLi,
            search: true,
            validateList: ['required'],
            onChange: function(val, vals, items) {
              _this.changeProject(items, d.sourceId);
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
  }
};
</script>

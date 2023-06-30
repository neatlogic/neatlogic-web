<template>
  <TsDialog v-bind="setting" @on-close="close" @on-ok="saveEdit">
    <template v-slot>
      <div>
        <TsForm ref="editform" v-model="formValue" :itemList="formConfig">
        </TsForm>
        <TsForm
          ref="projectForm"
          :itemList="projectConfig"
          class="mt-nm"
        >
          <template v-for="(project, pindex) in projectConfig" :slot="project.name">
            <TsFormSelect
              :key="pindex" 
              v-model="project.value"
              v-bind="project"
            />
          </template>
        </TsForm>
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
    projectData: Object
  },
  data() {
    return {
      setting: {
        //弹窗设置
        title: this.projectData && this.projectData.id ? this.$t('dialog.title.edittarget', { target: this.$t('page.mapping') }) : this.$t('dialog.title.addtarget', {'target': this.$t('page.mapping')}),
        maskClose: false,
        isShow: true
      },
      formValue: {
        appSystemId: null,
        appModuleId: null
      },
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
          onChange: (val) => {
            this.formValue.appModuleId = null;
            this.changeAppModule(val);
          }
        },
        {
          type: 'select',
          label: this.$t('page.module'),
          name: 'appModuleId',
          transfer: true,
          dynamicUrl: '/api/rest/deploy/app/config/module/list',
          dealDataByUrl: this.$utils.getAppForselect
        }
      ],
      projectList: [],
      projectConfig: [],
      projectValuelist: {}
    };
  },
  beforeCreate() {},
  async created() {
    await this.getProjectList();
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
    getProjectList() {
      return this.$api.codehub.project.getProject().then(res => {
        this.projectList = res.Return || [];
      });
    },
    initData() {
      if (this.projectData && this.projectData.appSystemVo) {
        let appSystemId = this.projectData.appSystemVo.id;
        let appModuleId = this.projectData.id;
        if (appSystemId) {
          this.formValue.appSystemId = appSystemId;
          this.changeAppModule(appSystemId);
        }
        if (appModuleId) {
          this.formValue.appModuleId = appModuleId;
        }
      }
      if (this.projectList && this.projectList.length > 0) {
        this.initProjectConfig(this.projectList);
      }
      let projectData = this.projectData;
      if (projectData.projectList && projectData.projectList.length > 0 && (this.projectConfig && this.projectConfig.length > 0)) {
        // 设置项目回显值
        this.projectConfig.forEach((pro) => {
          let filterList = projectData.projectList.filter((p) => {
            return p.sourceId == pro.name;
          });
          let valueList = filterList.map((r) => {
            return r.projectKey; // 拿到回显值
          });
          this.$set(pro, 'value', valueList);
          this.changeProject(filterList, pro.name);
        });
      }
    },
    saveEdit() {
      if (!this.$refs.editform.valid() || !this.$refs.projectForm.valid()) {
        return false;
      }
      let projectList = [];
      for (let key in this.projectValuelist) {
        if (this.projectValuelist[key].length > 0) {
          let li = this.projectValuelist[key].map(p => {
            return {
              sourceId: p.sourceId,
              projectKey: p.projectKey,
              projectName: p.projectName
            };
          });
          projectList = projectList.concat(li);
        }
      }
      this.$api.codehub.project
        .save({
          ...this.formValue,
          projectList: projectList
        })
        .then(res => {
          if (res && res.Status == 'OK') {
            this.$Message.success(this.$t('message.executesuccess'));
            this.$emit('close', true);
          }
        });
    },
    changeAppModule(appSystemId) {
      this.formConfig.forEach(item => {
        if (appSystemId) {
          if (item.name == 'appModuleId') {
            this.$set(item, 'params', { appSystemId: appSystemId });
            this.$set(item, 'dynamicUrl', '/api/rest/deploy/app/config/module/list');
          }
        } else {
          if (item.name == 'appModuleId') {
            this.$set(item, 'params', {});
            this.$set(item, 'dynamicUrl', '');
          }
        }
      });
    },
    changeProject(li, sourceId) {
      this.projectValuelist['source-' + sourceId.toString()] = li;
    },
    initProjectConfig(list) {
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
            onChange: (val, vals, items) => {
              this.changeProject(items, d.sourceId);
            }
          });
        });
      }
    }
  },
  computed: {},
  watch: {}
};
</script>

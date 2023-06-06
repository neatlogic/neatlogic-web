<template>
  <TsDialog
    v-bind="dialogSetting"
    @on-close="close"
    @on-ok="saveEdit"
  >
    <template v-slot>
      <div>
        <TsForm ref="editform" v-model="editData" :itemList="formConfig">
          <template slot="address">
            <div v-if="repoName">
              <TsFormInput
                v-model="editData.address"
                type="text"
                :validateList="vaildConfig"
                maxlength="50"
                :prepend="getRepositoryUrl(serveObj)"
                width="75%"
              />
            </div>
            <div v-else class="text-tip">{{ $t('term.codehub.pleaserepositoryservice') }}</div>
          </template>
          <template slot="appModuleId">
            <TsFormSelect v-model="editData.appModuleId" v-bind="subsysConfig" />
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
    TsFormInput: resolve => require(['@/resources/plugins/TsForm/TsFormInput'], resolve),
    TsFormSelect: resolve => require(['@/resources/plugins/TsForm/TsFormSelect'], resolve)
  },
  props: {
    id: {type: Number},
    appModuleId: String,
    appSystemId: String
  },
  data() {
    return {
      vaildConfig: ['required'],
      repoName: '',
      dialogSetting: {
        title: this.id ? this.$t('dialog.title.edittarget', {'target': this.$t('term.deploy.warehouse')}) : this.$t('page.newtarget', {'target': this.$t('term.deploy.warehouse')}),
        maskClose: false,
        width: 'medium',
        isShow: true
      },
      editData: {
        repoServiceId: '',
        name: '',
        address: '',
        mainBranch: '',
        branchesPath: '',
        createMode: 'import',
        appModuleId: null,
        appSystemId: null,
        tagsPath: ''
      },
      formConfig: [{
        type: 'select',
        label: this.$t('term.codehub.warehouseservices'),
        name: 'repoServiceId',
        validateList: ['required'],
        transfer: true,
        url: '/api/rest/codehub/repositoryservice/search',
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'id',
        onChange: (id, valueObject, selectItem) => {
          this.serveObj = selectItem;
          this.changeRepository(selectItem);
        }
      },
      {
        type: 'radio',
        label: this.$t('term.deploy.creationmode'),
        name: 'createMode',
        validateList: ['required'],
        value: 'import',
        dataList: [{
          text: this.$t('page.import'),
          value: 'import'
        }, {
          text: this.$t('page.manualcreation'),
          value: 'manual',
          disabled: true
        }],
        onChange: (val) => {
          this.editData.createMode = val;
        }
      },
      {
        type: 'slot',
        label: this.$t('page.warehouseaddress'),
        name: 'address',
        validateList: ['required']
      },
      {
        type: 'text',
        label: this.$t('term.deploy.warehousename'),
        name: 'name',
        validateList: ['required'],
        onChange: (val) => {
          this.editData.name = val;
        }
      },
      {
        type: 'select',
        label: this.$t('term.codehub.associatedsystem'),
        name: 'appSystemId',
        transfer: true,
        dynamicUrl: '/api/rest/codehub/appsystem/search',
        rootName: 'tbodyList',
        dealDataByUrl: this.$utils.getAppForselect,
        validateList: ['required'],
        onChange: (val) => {
          this.changeAppModule(val);
        }
      },
      {
        type: 'slot',
        label: this.$t('term.codehub.associatedsubsystems'),
        name: 'appModuleId',
        isHidden: true
      },
      {
        type: 'text',
        label: this.$t('page.trunk'),
        name: 'mainBranch',
        isHidden: true,
        onChange: (val) => {
          this.editData.mainBranch = val;
        }
      },
      {
        type: 'text',
        label: this.$t('term.codehub.branchpath'),
        name: 'branchesPath',
        isHidden: true,
        onChange: (val) => {
          this.editData.branchesPath = val;
        }
      },
      {
        type: 'text',
        label: this.$t('term.codehub.tagpath'),
        name: 'tagsPath',
        isHidden: true,
        onChange: (val) => {
          this.editData.tagsPath = val;
        }
      }
      ],
      subsysConfig: {
        transfer: true,
        dynamicUrl: '/api/rest/codehub/appmodule/search',
        rootName: 'tbodyList',
        dealDataByUrl: this.$utils.getAppForselect
      },
      serviceType: null,
      serveObj: {}
    };
  },
  beforeCreate() {},
  created() {
    if (this.id) {
      this.getDetail(this.id);
    } else {
      Object.assign(this.editData, {
        repoServiceId: '',
        createMode: 'import',
        address: '',
        name: '',
        appModuleId: this.appModuleId || '',
        appSystemId: this.appSystemId || ''
      });
      if (this.appSystemId) {
        this.$set(this.subsysConfig, 'params', {appSystemId: this.appSystemId});
      }
      this.updataVal(this.editData);
    }
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
    changeRepository(selectedItem) {
      // 仓库改变
      if (selectedItem && selectedItem.id) {
        if (selectedItem.type == 'svn') {
          this.formConfig.forEach(form => {
            if (form.name == 'createMode') {
              this.$set(form.dataList[1], 'disabled', true);
              this.$set(form, 'value', 'import');
            }
          });
          this.$api.codehub.service.getDetail({id: selectedItem.id, getDelegation: true}).then(res => {
            if (res && res.Status == 'OK') {
              this.formConfig.forEach(form => {
                if (form.name == 'createMode') {
                  this.$set(form.dataList[1], 'disabled', !res.Return.delegation);
                  if (!res.Return.delegation) {
                    this.$set(form, 'value', 'import');
                  }
                }
              });
            }
          });
        } else {
          this.formConfig.forEach(form => {
            if (form.name == 'createMode') {
              this.$set(form.dataList[1], 'disabled', false);
            }
          });
        }
      }
      this.editData.repoServiceId = selectedItem.id;
      this.repoName = selectedItem.name;
      this.serviceType = selectedItem.type;
    },
    close() {
      this.$emit('close');
    },
    saveEdit() {
      if (this.$refs.editform.valid()) {
        let param = this.$utils.deepClone(this.editData);
        if (this.serviceType != 'svn') {
          this.$delete(param, 'mainBranch');
          this.$delete(param, 'branchesPath');
          this.$delete(param, 'tagsPath');
        }
        if (param && param.address) {
          param.address = param.address + '/' + param.name;
        }
        this.id && Object.assign(param, {id: this.id});
        this.$api.codehub.repository.save(param).then((res) => {
          this.$emit('close', true);
        });
      }
    },
    getDetail(id) {
      let param = {};
      if (id) {
        Object.assign(param, {id: id});
      }
      this.$api.codehub.repository.getDetail(param).then(res => {
        if (res.Return) {
          this.serviceType = res.Return.repositoryServiceVo.type;
          Object.assign(this.editData, {
            repoServiceId: res.Return.repoServiceId || '',
            createMode: res.Return.createMode || 'import',
            address: res.Return.address || '',
            name: res.Return.name || '',
            appModuleId: res.Return.subSystemVo && res.Return.subSystemVo.uuid || '',
            appSystemId: res.Return.systemVo && res.Return.systemVo.uuid || '',
            mainBranch: res.Return.mainBranch || '',
            branchesPath: res.Return.branchesPath || '',
            tagsPath: res.Return.tagsPath || ''
          });

          this.updataVal(this.editData);
        }
      });
    },
    updataVal(data) {
      this.formConfig.forEach(form => {
        if (form.name && data[form.name]) {
          this.$set(form, 'value', data[form.name]);
        }
      });
      if (data.repoServiceId) { //回显服务名称
        this.repoName = this.serveObj.name;
      }
      if (data.appSystemId) { //系统的话显示子系统Q、
        this.formConfig.forEach(form => {
          if (form.name == 'appModuleId') {
            this.$set(form, 'isHidden', false);
          }
        });
        this.$set(this.subsysConfig, 'params', {appSystemId: data.appSystemId});
      }
    },
    changeAppModule(val) {
      this.editData.appSystemId = val;
      this.$set(this.editData, 'appModuleId', '');
      this.formConfig.forEach(form => {
        if (form.name == 'appModuleId') {
          this.$set(form, 'isHidden', !val);
        }
      });
      this.$set(this.subsysConfig, 'params', {appSystemId: val});
    },
    updateServe(val, list, alllist) {
      this.editData.repoServiceId = val;
      this.repoName = list.text;
      this.serviceType = alllist.type;
    },
    initSvnsetting(isShow) {
      let items = ['mainBranch', 'branchesPath', 'tagsPath'];
      this.formConfig.forEach((form) => {
        if (items.indexOf(form.name) > -1) {
          this.$set(form, 'isHidden', !isShow);
          if (!isShow) {
            this.$set(form, 'value', '');
            this.$set(this.editData, form.name, '');
          }
        }
      });
    }

  },
  filter: {},
  computed: {
    getRepositoryUrl() {
      // 获取仓库地址
      return function(serveObj) {
        let urlpre = '';
        if (serveObj && serveObj.address) {
          urlpre = serveObj.address;
        }
        return urlpre;
      };
    }
  },
  watch: {
    serviceType: {
      handler: function(val) {
        this.initSvnsetting(!!(val && val == 'svn'));
      },
      immediate: true
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .ivu-input-group > .ivu-input{
  min-width: 200px;
}
</style>

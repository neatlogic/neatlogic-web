<template>
  <TsDialog
    v-bind="dialogSetting"
    @on-close="close"
    @on-ok="saveRepository"
  >
    <template v-slot>
      <div>
        <Loading
          v-if="loadingShow"
          :loadingShow="loadingShow"
          type="fix"
        ></Loading>
        <TsForm
          v-else
          ref="editform"
          v-model="editData"
          :itemList="formConfig"
        >
          <template slot="repoServiceId">
            <TsFormSelect
              v-model="editData.repoServiceId"
              :validateList="['required']"
              :transfer="true"
              url="/api/rest/codehub/repositoryservice/search"
              rootName="tbodyList"
              textName="name"
              valueName="id"
              border="border"
              @update:selectItemList="updateSelectItemList"
              @on-change="changeRepoService"
            ></TsFormSelect>
          </template>
          <template slot="address">
            <div v-if="!$utils.isEmpty(selectedReposService)">
              <TsFormInput
                v-model="editData.address"
                type="text"
                :validateList="['required']"
                maxlength="50"
                :prepend="getRepositoryUrlPrepend"
              />
            </div>
            <div v-else class="text-tip">{{ $t('term.codehub.pleaserepositoryservice') }}</div>
          </template>
          <template slot="appModuleId">
            <TsFormSelect v-model="editData.appModuleId" v-bind="appModuleConfig" />
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
    id: {type: Number}
  },
  data() {
    return {
      loadingShow: true,
      dialogSetting: {
        title: this.id ? this.$t('dialog.title.edittarget', {'target': this.$t('term.deploy.warehouse')}) : this.$t('page.newtarget', {'target': this.$t('term.deploy.warehouse')}),
        maskClose: false,
        width: 'medium',
        isShow: true
      },
      editData: {
        id: null,
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
        type: 'slot',
        label: this.$t('term.codehub.warehouseservices'),
        name: 'repoServiceId'
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
        }]
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
        validateList: [
          'required', 
          'name-special',
          { name: 'searchUrl',
            url: '/api/rest/codehub/repository/save', 
            key: 'name',
            message: this.$t('message.targetisexists', {target: this.$t('page.name')}),
            params: { id: this.id}
          }]
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
        isHidden: true
      },
      {
        type: 'text',
        label: this.$t('term.codehub.branchpath'),
        name: 'branchesPath',
        isHidden: true
      },
      {
        type: 'text',
        label: this.$t('term.codehub.tagpath'),
        name: 'tagsPath',
        isHidden: true
      }
      ],
      appModuleConfig: {
        transfer: true,
        rootName: 'tbodyList',
        dealDataByUrl: this.$utils.getAppForselect
      },
      serviceType: null,
      selectedReposService: {} // 选中的仓库服务，主要是拿到服务地址的前缀
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
    initData() {
      if (this.id) {
        this.getRepositoryDetail(this.id);
      } else {
        Object.assign(this.editData, {
          repoServiceId: '',
          createMode: 'import',
          address: '',
          name: '',
          appModuleId: '',
          appSystemId: ''
        });
        this.hiddenFormByValue(this.editData);
        this.loadingShow = false;
      }
    },
    changeRepoService(id, valueObject, selectItem) {
      this.changeRepository(selectItem);
    },
    updateSelectItemList(selectedObj) {
      // 主要为了拿到仓库地址前缀
      this.selectedReposService = selectedObj;
    },
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
      this.serviceType = selectedItem.type;
    },
    close() {
      this.$emit('close');
    },
    saveRepository() {
      if (this.$refs.editform.valid()) {
        let param = this.$utils.deepClone(this.editData);
        if (this.serviceType != 'svn') {
          this.$delete(param, 'mainBranch');
          this.$delete(param, 'branchesPath');
          this.$delete(param, 'tagsPath');
        }
        this.$api.codehub.repository.save(param).then((res) => {
          if (res && res.Status == 'OK') {
            this.$emit('close', true);
          }
        });
      }
    },
    getRepositoryDetail(id) {
      this.loadingShow = true;
      this.$api.codehub.repository.getDetail({id: id}).then(res => {
        if (res && res.Status == 'OK') {
          Object.assign(this.editData, res.Return);
          this.serviceType = this.editData.repositoryServiceVo.type;
          if (this.editData && this.editData.appSystemVo) {
            this.editData.appSystemId = this.editData.appSystemVo.id;
          }
          this.hiddenFormByValue(this.editData);
        }
      }).finally(() => {
        this.loadingShow = false;
      });
    },
    hiddenFormByValue(data) {
      this.formConfig.forEach(form => {
        if (form.name && data[form.name]) {
          this.$set(form, 'value', data[form.name]);
        }
      });
      if (data.appSystemId) { //系统的话显示子系统Q、
        this.formConfig.forEach(form => {
          if (form.name == 'appModuleId') {
            this.$set(form, 'isHidden', false);
          }
        });
        this.$set(this.appModuleConfig, 'params', {appSystemId: data.appSystemId});
        this.$set(this.appModuleConfig, 'dynamicUrl', '/api/rest/codehub/appmodule/search');
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
      this.$set(this.appModuleConfig, 'params', {appSystemId: val});
      this.$set(this.appModuleConfig, 'dynamicUrl', '/api/rest/codehub/appmodule/search');
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
    getRepositoryUrlPrepend() {
      // 获取仓库地址前缀
      let urlPrepend = '';
      if (!this.$utils.isEmpty(this.selectedReposService) && this.selectedReposService.address) {
        urlPrepend = this.selectedReposService.address;
      }
      return urlPrepend;
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

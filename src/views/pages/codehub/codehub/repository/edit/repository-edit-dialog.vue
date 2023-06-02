<template>
  <TsDialog
    v-bind="setting"
    @on-close="close"
  >
    <template v-slot>
      <div>
        <TsForm ref="editform" v-model="editData" :itemList="formConfig">
          <template slot="repoServiceUuid">
            <TsFormSelect
              v-model="editData.repoServiceUuid"
              v-bind="serviceConfig"
              :selectItemList.sync="serveList"
            />
          </template>
          <template slot="address">
            <div v-if="repoName">
              <TsFormInput
                v-model="editData.address"
                type="text"
                :validateList="vaildConfig"
                maxlength="100"
                :prepend="getUrl(serveList)"
                width="75%"
              />
            </div>
            <div v-else class="text-tip">{{ $t('term.codehub.pleaserepositoryservice') }}</div>
          </template>
          <template slot="subsystemUuid">
            <TsFormSelect v-model="editData.subsystemUuid" v-bind="subsysConfig" />
          </template>
        </TsForm>
      </div>
    </template>
    <template v-slot:footer>
      <div class="footer-btn-contain">
        <Button type="text" @click="close">{{ $t('page.cancel') }}</Button>
        <Button type="primary" @click="saveEdit">{{ $t('page.confirm') }}</Button>
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
    id: {type: [String, Number]},
    subsystemUuid: String,
    systemUuid: String
  },
  data() {
    return {
      vaildConfig: ['required'],
      repoName: '',
      setting: {
        title: this.id ? this.$t('dialog.title.edittarget', {'target': this.$t('term.deploy.warehouse')}) : this.$t('page.newtarget', {'target': this.$t('term.deploy.warehouse')}),
        maskClose: false,
        width: 'medium',
        height: '360px',
        isShow: true
      },
      editData: {
        repoServiceUuid: '',
        createMode: 'import',
        address: '',
        name: '',
        subsystemUuid: '',
        systemUuid: '',
        mainBranch: '',
        branchesPath: '',
        tagsPath: ''
      },
      formConfig: [{
        type: 'slot',
        label: this.$t('term.codehub.warehouseservices'),
        name: 'repoServiceUuid',
        validateList: ['required']
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
        name: 'systemUuid',
        transfer: true,
        dynamicUrl: '/api/rest/codehub/appsystem/search',
        rootName: 'tbodyList',
        dealDataByUrl: this.$utils.getAppForselect,
        validateList: ['required'],
        onChange: (val) => {
          this.changeSubsys(val);
        }
      },
      {
        type: 'slot',
        label: this.$t('term.codehub.associatedsubsystems'),
        name: 'subsystemUuid',
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
        textName: 'name',
        valueName: 'id'
      },
      serviceType: null,
      serviceConfig: {
        transfer: true,
        validateList: ['required'],
        url: '/api/rest/codehub/repositoryservice/search',
        rootName: 'tbodyList',
        textName: 'name',
        valueName: 'id'
      },
      serveList: {}
    };
  },
  beforeCreate() {},
  created() {
    if (this.id) {
      this.getDetail(this.id);
    } else {
      Object.assign(this.editData, {
        repoServiceUuid: '',
        createMode: 'import',
        address: '',
        name: '',
        subsystemUuid: this.subsystemUuid || '',
        systemUuid: this.systemUuid || ''
      });
      if (this.systemUuid) {
        this.$set(this.subsysConfig, 'params', {systemId: this.systemUuid});
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
            repoServiceUuid: res.Return.repoServiceUuid || '',
            createMode: res.Return.createMode || 'import',
            address: res.Return.address || '',
            name: res.Return.name || '',
            subsystemUuid: res.Return.subSystemVo && res.Return.subSystemVo.uuid || '',
            systemUuid: res.Return.systemVo && res.Return.systemVo.uuid || '',
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
      if (data.repoServiceUuid) { //回显服务名称
        this.repoName = this.serveList.name;
      }
      if (data.systemUuid) { //系统的话显示子系统Q、
        this.formConfig.forEach(form => {
          if (form.name == 'subsystemUuid') {
            this.$set(form, 'isHidden', false);
          }
        });
        this.$set(this.subsysConfig, 'params', {systemId: data.systemUuid});
      }
    },
    changeSubsys(val) {
      this.editData.systemUuid = val;
      this.$set(this.editData, 'subsystemUuid', '');
      this.formConfig.forEach(form => {
        if (form.name == 'subsystemUuid') {
          this.$set(form, 'isHidden', !val);
        }
      });
      this.$set(this.subsysConfig, 'params', {systemId: val});
    },
    updateServe(val, list, alllist) {
      this.editData.repoServiceUuid = val;
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
    getUrl() {
      return function(serveList) {
        let urlpre = '';
        if (serveList && serveList.address) {
          urlpre = serveList.address;
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
    },
    serveList: {
      handler: function(val) {
        if (val && val.id) {
          if (val.type == 'svn') {
            this.formConfig.forEach(form => {
              if (form.name == 'createMode') {
                this.$set(form.dataList[1], 'disabled', true);
                this.$set(form, 'value', 'import');
              }
            });
            this.$api.codehub.service.getDetail({id: val.id, getDelegation: true}).then(res => {
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
        this.editData.repoServiceUuid = val.id;
        this.repoName = val.name;
        this.serviceType = val.type;
      },
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .ivu-input-group > .ivu-input{
  min-width: 200px;
}
</style>

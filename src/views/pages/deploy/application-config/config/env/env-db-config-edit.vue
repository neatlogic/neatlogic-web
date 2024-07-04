<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      @on-ok="okDialog"
      @on-close="closeDialog"
    >
      <template v-slot:header>
        <div v-if="id">{{ $t('dialog.title.edittarget', {target: $t('term.deploy.dbconfig')}) }}</div>
        <div v-else>{{ $t('dialog.title.addtarget', {target: $t('term.deploy.dbconfig')}) }}</div>
      </template>
      <template v-slot>
        <Loading :loadingShow="isLoading" type="fix"></Loading>
        <div v-if="!isLoading">
          <TsForm
            ref="form"
            v-model="formValue"
            :item-list="formItemList"
          >
            <template v-slot:accountId>
              <div class="action-icon text-right">
                <template v-if="getDisabled">
                  <Tooltip :content="$t('term.deploy.pleasechoosedatabase')" transfer>
                    <span class="tsfont-rotate-right text-tip-active" :class="getDisabledClassName"></span>
                  </Tooltip>
                  <Tooltip :content="$t('term.deploy.pleasechoosedatabase')" transfer>
                    <span class="tsfont-edit text-tip-active pl-md" :class="getDisabledClassName"></span>
                  </Tooltip>
                </template>
                <template v-else>
                  <span class="tsfont-rotate-right text-tip-active" @click="refreshAccountList"></span>
                  <span class="tsfont-edit text-tip-active pl-md" :class="getDisabledClassName" @click="toAssetManageEditAccount"></span>
                </template>
              </div>
              <TsFormItem :label="$t('page.account')" :required="true">
                <TsFormSelect
                  ref="formSelect"
                  v-model="formValue.accountId"
                  v-bind="accountSetting"
                  @first="toAssetManageEditAccount"
                  @searchCallback="refreshSuccess()"
                >
                </TsFormSelect>
              </TsFormItem>
            </template>
          </TsForm>
          <TsForm
            v-if="hasConfig"
            v-model="config"
            :item-list="configFormList"
          ></TsForm>
        </div>
      </template>
    </TsDialog>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect')
  },
  props: {
    id: {
      type: Number,
      default: null
    },
    params: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      isLoading: false,
      dialogSetting: {
        isShow: true,
        type: 'modal',
        okText: this.$t('page.save'),
        width: 'medium'
      },
      formValue: {
        accountId: null,
        dbResourceId: null
      },
      accountSetting: {
        transfer: true,
        multiple: false,
        firstText: this.$t('term.deploy.bindaccount'),
        firstLi: true,
        dataList: [],
        params: {protocol: 'database'},
        needCallback: false,
        errorMessage: '',
        disabled: !this.id,
        disabledHoverTitle: !this.id ? this.$t('form.placeholder.pleaseselect', {target: this.$t('page.account')}) : '',
        validateList: ['required'],
        firstSelect: false
      },

      config: {},
      hasConfig: false,
      databaseList: [],
      dbResourceId: null,
      formItemList: [
        {
          name: 'dbSchema',
          type: 'text',
          label: this.$t('term.deploy.databaseschema'),
          maxlength: 50,
          validateList: [
            'required',
            'key-special',
            {
              name: 'regex',
              message: this.$t('term.deploy.inputformatisnotstandardpleaseenter'),
              pattern: /^[A-Za-z\d_-]+[.]+[A-Za-z\d_-]+$/
            },
            {
              name: 'custom',
              trigger: 'change',
              message: this.$t('term.deploy.thereisoneandonlyonedot'),
              validator: (rule, value) => {
                // 验证有且只有一个点号
                let potsNumber = value ? value.split('.').length : 0;
                return !(potsNumber > 2);
              }
            },
            {
              name: 'searchUrl',
              url: '/api/rest/deploy/app/config/env/db/config/save',
              key: 'dbSchema',
              message: this.$t('form.validate.repeat', {target: this.$t('term.deploy.databaseschema')}),
              params: {id: this.id, ...this.params}
            }
          ],
          desc: this.$t('term.deploy.schemaformatdesc')
        },
        {
          name: 'dbResourceId',
          type: 'select',
          label: this.$t('page.database'),
          validateList: ['required'],
          dynamicUrl: '/api/rest/deploy/app/config/env/database/search',
          params: {...this.params},
          rootName: 'tbodyList',
          firstSelect: false,
          dealDataByUrl: (nodeList) => { return this.dealDataByUrl(nodeList); },
          onChange: (dbResourceId) => {
            this.getDBList(null);
            if (dbResourceId) {
              this.handleSpecialFields(dbResourceId);
              this.dbResourceId = dbResourceId;
              this.$set(this.accountSetting, 'disabled', false);
              this.$set(this.accountSetting, 'disabledHoverTitle', '');
              this.$set(this.accountSetting.params, 'resourceId', dbResourceId);
              this.getAccountList();
            } else {
              this.dbResourceId = null;
              this.$set(this.accountSetting, 'disabled', true);
              this.$set(this.accountSetting, 'disabledHoverTitle', this.$t('form.placeholder.pleaseselect', {target: this.$t('page.database')}));
              this.$set(this.accountSetting.params, 'resourceId', null);
              this.$set(this.formValue, 'accountId', null); // 清空账号
            }
          }
        },
        {
          name: 'accountId',
          type: 'slot',
          label: '',
          labelWidth: 1
        },
        {
          name: 'config',
          type: 'switch',
          label: this.$t('page.advancedsettings'),
          falseValue: 0,
          trueValue: 1,
          onChange: (isOpen) => {
            if (isOpen) {
              this.hasConfig = true;
              this.config = {};
            } else {
              this.hasConfig = false;
              this.config = {};
            }
          }
        }
      ],
      configFormList: [
        {
          name: 'custom',
          type: 'text',
          label: this.$t('term.deploy.customparameter'),
          maxlength: 256
        },
        {
          name: 'logonTimeout',
          type: 'text',
          label: this.$t('term.deploy.connectiontimeout'),
          maxlength: 256
        },
        {
          name: 'locale',
          type: 'text',
          label: 'DBLocale',
          maxlength: 256,
          validateList: ['key-special']
        },
        {
          name: 'fileCharset',
          type: 'text',
          label: this.$t('page.filecoding'),
          maxlength: 256
        },
        {
          name: 'autocommit',
          type: 'select',
          label: this.$t('term.deploy.autocommit'),
          transfer: true,
          dataList: [
            {
              text: this.$t('page.yes'),
              value: 1
            },
            {
              text: this.$t('page.no'),
              value: 0
            }
          ]
        },
        {
          name: 'dbVersion',
          type: 'text',
          label: this.$t('term.deploy.dbversion'),
          maxlength: 256
        },
        {
          name: 'ignoreErrors',
          type: 'text',
          label: this.$t('term.deploy.ignoreerrors'),
          maxlength: 256
        },
        {
          name: 'dbaRole',
          type: 'text',
          label: this.$t('term.deploy.dbarole'),
          maxlength: 256
        }
      ],
      oracleList: [
        {
          name: 'oraWallet',
          type: 'select',
          label: 'oraWallet',
          transfer: true,
          dataList: [
            {
              text: this.$t('page.yes'),
              value: 1
            },
            {
              text: this.$t('page.no'),
              value: 0
            }
          ]
        }
      ],
      db2List: [
        {
          name: 'db2SqlTerminator',
          type: 'text',
          label: 'db2SqlTerminator',
          maxlength: 256
        },
        {
          name: 'db2ProcTerminator',
          type: 'text',
          label: 'db2ProcTerminator',
          maxlength: 256
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
    if (this.id) {
      this.searchDbConfig();
    } else {
      this.getDBList(null);
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
    async getAccountList() {
      // 获取协议是database的账号列表
      let accountList = [];
      await this.$api.cmdb.asset.listAccount({...this.accountSetting.params, type: 'public'}).then(res => {
        // 拥有账号
        if (res && res.Status == 'OK') {
          accountList = res.Return || [];
        }
      });
      await this.$api.cmdb.asset.listAccount({...this.accountSetting.params, type: 'private'}).then(res => {
        // 私有账号
        if (res && res.Status == 'OK') {
          accountList.push(...(res.Return || []));
        }
      });
      this.$set(this.accountSetting, 'dataList', this.$utils.getAccountNodeList(accountList));
    },
    dealDataByUrl(nodeList) {
      let databaseList = [];
      if (nodeList && nodeList.length > 0) {
        nodeList.forEach(item => {
          databaseList.push({
            text: this.getText(item),
            value: item.id
          });
        });
      }
      return databaseList;
    },
    getText(item) {
      // 模型/ip:port/名称
      let textName = '';
      if (item) {
        const {typeLabel, ip, port, name} = item;
        let ipPort = ip ? (port ? `${ip}:${port}` : ip) : '';
        textName = ipPort ? (typeLabel ? (name ? `${typeLabel}/${ipPort}/${name}` : `${typeLabel}/${ipPort}`) : (name ? `${ipPort}/${name}` : `${ipPort}`)) : (typeLabel || (name || ''));
      }
      return textName;
    },
    async getDBList(dbResourceId = null) {
      let params = {
        ...this.params
      };
      if (dbResourceId) {
        params.defaultValue = [dbResourceId];
      }
      await this.$api.deploy.applicationConfig.getDbList(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.databaseList = res.Return.tbodyList || [];
        }
      });
    },
    okDialog() {
      let form = this.$refs.form;
      if ((form && !form.valid()) || (this.formValue && !this.formValue.accountId)) {
        if (this.formValue && !this.formValue.accountId) {
          this.$set(this.accountSetting, 'errorMessage', this.$t('form.validate.pleaseenterthecontent'));
        }
        return false;
      }
      let params = {
        ...this.params,
        ...this.formValue,
        config: this.config
      };
      if (this.id) {
        params.id = this.id;
      }
      if (this.formValue && this.formValue.accountId) {
        this.$set(this.accountSetting, 'errorMessage', '');
      }
      this.$api.deploy.env.saveEnvDbConfig(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.closeDialog(true);
        }
      });
    },
    searchDbConfig() {
      if (this.id) {
        this.isLoading = true;
        this.$api.deploy.env.getEnvDbConfig({id: this.id}).then((res) => {
          if (res && res.Status == 'OK') {
            let {dbSchema, dbResourceId, accountId, config} = res.Return;
            this.formValue = {
              dbSchema,
              dbResourceId,
              accountId,
              config: config ? 1 : 0
            };
            this.dbResourceId = dbResourceId;
            this.getDBList(dbResourceId).then(() => {
              this.handleSpecialFields(dbResourceId);
              this.config = config;
              this.hasConfig = !!config;
            });
            this.$set(this.accountSetting.params, 'resourceId', dbResourceId);
            this.getAccountList();
          }
        }).finally(() => {
          this.isLoading = false;
        });
      }
    },
    handleSpecialFields(dbResourceId) {
      // 处理特殊字段
      let currentList = this.databaseList.filter((item) => {
        return item.id == dbResourceId;
      });
      if (currentList && !this.$utils.isEmpty(currentList)) {
        const {typeName} = currentList[0];
        if (typeName) {
          const typeNameLowerCase = typeName.toLowerCase();
          const delFields = {
            db2SqlTerminator: 'db2SqlTerminator',
            db2ProcTerminator: 'db2ProcTerminator',
            oraWallet: 'oraWallet'
          };
          for (let i = 0; i < this.configFormList.length; i++) {
            if (delFields[this.configFormList[i].name]) {
              this.configFormList.splice(i, 1);
              i--;
            }
          }
          if (typeNameLowerCase.includes('db2')) {
            this.configFormList.push(...this.db2List);
          } else if (typeNameLowerCase.includes('oracle')) {
            this.configFormList.push(...this.oracleList);
          }
        }
      }
    },
    closeDialog(needRefresh = false) {
      this.$emit('close', needRefresh);
    },
    toAssetManageEditAccount() {
      // 跳转到资产清单页面，打开单个账号管理弹窗
      if (this.getDisabled) {
        return false;
      }
      window.open(HOME + '/cmdb.html#/asset-manage?resourceId=' + this.dbResourceId, '_blank');
    },
    refreshAccountList() {
      if (this.getDisabled) {
        return false;
      }
      this.$set(this.accountSetting, 'params', {refreshUuid: this.$utils.setUuid(), protocol: 'database', resourceId: this.dbResourceId });
      this.$set(this.accountSetting, 'needCallback', true);
      this.getAccountList();
    },
    refreshSuccess() {
      this.$Message.success(this.$t('message.refreshsuccess'));
      this.$set(this.accountSetting, 'needCallback', false);
      if (this.accountSetting.params && this.accountSetting.params.hasOwnProperty('refreshUuid')) {
        delete this.accountSetting.params.refreshUuid;
      }
    }
  },
  filter: {},
  computed: {
    getDisabledClassName() {
      return this.accountSetting.disabled ? 'text-disabled' : '';
    },
    getDisabled() {
      return !!this.accountSetting.disabled;
    }
  },
  watch: {}
};
</script>
<style lang="less" scoped>
.execute-list-box {
  position: relative;
  .del-text {
    position: absolute;
    right: 2px;
    top: -27px;
  }
  .show-del {
    display: inline-block;
  }
  .hidden-del {
    display: none;
  }
}
</style>

<template>
  <div>
    <TsDialog
      v-bind="dialogSetting"
      :loading="saving"
      :okBtnDisable="isLoading"
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
            <template v-slot:dbResourceId>
              <TsFormItem :label="$t('page.database')" :required="true" :tooltip="$t('term.deploy.dbviewdatasource')">
                <div class="flex-start">
                  <TsFormSelect
                    ref="formSelect"
                    v-model="formValue.dbResourceId"
                    v-bind="dbResourceSetting"
                    :historyValue="dbResourceHistory"
                    style="flex: 1;"
                    @first="addDbResource"
                  >
                  </TsFormSelect>
                  <div v-if="formValue.dbResourceId">
                    <span class="tsfont-edit text-tip-active pl-md" @click="editDbResource()"></span>
                  </div>
                </div>
              </TsFormItem>
            </template>
            <template v-slot:accountId>
              <TsFormItem :label="$t('page.account')" :required="true" :tooltip="$t('term.deploy.accountprotocoldatabase')">
                <div class="flex-start">
                  <TsFormSelect
                    ref="formSelect"
                    v-model="formValue.accountId"
                    v-bind="accountSetting"
                    style="flex: 1;"
                    @first="editAccount"
                    @searchCallback="refreshSuccess()"
                  >
                  </TsFormSelect>
                  <div class="pl-sm">
                    <template v-if="getDisabled">
                      <Tooltip :content="$t('term.deploy.pleasechoosedatabase')" transfer>
                        <span class="tsfont-rotate-right text-tip-active" :class="getDisabledClassName"></span>
                      </Tooltip>
                      <Tooltip :content="$t('term.deploy.pleasechoosedatabase')" transfer>
                        <span class="tsfont-edit text-tip-active pl-sm" :class="getDisabledClassName"></span>
                      </Tooltip>
                    </template>
                    <template v-else>
                      <span class="tsfont-rotate-right text-tip-active" @click="refreshAccountList"></span>
                      <span class="tsfont-edit text-tip-active pl-sm" :class="getDisabledClassName" @click="editAccount"></span>
                    </template>
                  </div>
                </div>
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
    <DbResourceSettingDialog
      v-if="isShowDbResourceDialog"
      :isNewData="isAddDbResource"
      :dbResourceData="dbResourceData"
      :params="params"
      @close="closeDbResourceSettingDialog"
    ></DbResourceSettingDialog>
    <AccountEditDialog
      v-if="isShowAccountEditDialog"
      :params="params"
      :resourceId="resourceId"
      @close="closeAccountEditDialog"
    ></AccountEditDialog>
  </div>
</template>
<script>
import {databaseOptions, schemaField} from './database-form-fields';
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm'),
    TsFormItem: () => import('@/resources/plugins/TsForm/TsFormItem'),
    TsFormSelect: () => import('@/resources/plugins/TsForm/TsFormSelect'),
    DbResourceSettingDialog: () => import('./db-resource-setting-dialog.vue'),
    AccountEditDialog: () => import('./account-edit-dialog')
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
    const options = databaseOptions.call(this);
    return {
      isLoading: false,
      saving: false,
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
        schemaField.call(this, {
          name: 'searchUrl',
          url: '/api/rest/deploy/app/config/env/db/config/save',
          key: 'dbSchema',
          message: this.$t('form.validate.repeat', {target: this.$t('term.deploy.databaseschema')}),
          params: {id: this.id, ...this.params}
        }),
        {
          name: 'dbResourceId',
          type: 'slot',
          label: '',
          labelWidth: 1
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
      configFormList: options.common,
      oracleList: options.oracle,
      db2List: options.db2,
      dbResourceSetting: {
        validateList: ['required'],
        dynamicUrl: '/api/rest/deploy/app/config/env/database/search',
        params: {...this.params, onlySelectable: true},
        rootName: 'tbodyList',
        firstSelect: false,
        firstLi: true,
        firstText: this.$t('page.database'),
        transfer: true,
        dealDataByUrl: (nodeList) => { return this.dealDataByUrl(nodeList); },
        onChange: (dbResourceId, item, selectItem) => {
          this.changeDbResourceId(dbResourceId, selectItem);
        }
      },
      dbResourceData: null,
      isAddDbResource: false,
      isShowDbResourceDialog: false,
      isShowAccountEditDialog: false,
      resourceId: null
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
            ...item,
            text: this.getText(item),
            value: item.id
          });
        });
        if (!this.dbResourceData && this.dbResourceId) {
          this.dbResourceData = nodeList.find(item => item.id == this.dbResourceId);
        }
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
    // 数据库详情用于历史回显和类型参数，不作为下拉候选查询。
    async getDBList(dbResourceId = null) {
      let params = {
        ...this.params,
        onlySelectable: false
      };
      if (dbResourceId) {
        params.defaultValue = [dbResourceId];
      }
      await this.$api.deploy.applicationConfig.getDbList(params).then((res) => {
        if (res && res.Status == 'OK') {
          this.databaseList = res.Return.tbodyList || [];
          if (dbResourceId) {
            this.dbResourceData = this.databaseList.find(item => item.id == dbResourceId) || null;
          }
        }
      });
    },
    // 保存期间防止重复提交，失败保留输入并可靠释放按钮加载状态。
    async okDialog() {
      if (this.saving || this.isLoading) return;
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
      this.saving = true;
      try {
        const res = await this.$api.deploy.env.saveEnvDbConfig(params);
        if (res && res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.closeDialog(true);
        }
      } finally {
        this.saving = false;
      }
    },
    // 先加载原数据库详情，再展示编辑表单，避免候选过滤影响历史名称回显。
    searchDbConfig() {
      if (this.id) {
        this.isLoading = true;
        this.$api.deploy.env.getEnvDbConfig({id: this.id}).then(async(res) => {
          if (res && res.Status == 'OK') {
            let {dbSchema, dbResourceId, accountId, config} = res.Return;
            this.formValue = {
              dbSchema,
              dbResourceId,
              accountId,
              config: config ? 1 : 0
            };
            this.dbResourceId = dbResourceId;
            await this.getDBList(dbResourceId);
            this.handleSpecialFields(dbResourceId);
            this.config = config;
            this.hasConfig = !!config;
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
    editAccount() {
      // 资产清单，打开单个账号管理弹窗
      if (this.getDisabled) {
        return false;
      }
      this.resourceId = this.dbResourceId;
      this.isShowAccountEditDialog = true;
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
    },
    changeDbResourceId(dbResourceId, selectItem) {
      this.getDBList(null);
      if (dbResourceId) {
        this.handleSpecialFields(dbResourceId);
        this.dbResourceId = dbResourceId;
        this.$set(this.accountSetting, 'disabled', false);
        this.$set(this.accountSetting, 'disabledHoverTitle', '');
        this.$set(this.accountSetting.params, 'resourceId', dbResourceId);
        this.getAccountList();
        this.dbResourceData = selectItem;
      } else {
        this.dbResourceId = null;
        this.$set(this.accountSetting, 'disabled', true);
        this.$set(this.accountSetting, 'disabledHoverTitle', this.$t('form.placeholder.pleaseselect', {target: this.$t('page.database')}));
        this.$set(this.accountSetting.params, 'resourceId', null);
        this.$set(this.formValue, 'accountId', null); // 清空账号
        this.dbResourceData = null;
      }
    },
    addDbResource() {
      this.isAddDbResource = true;
      this.isShowDbResourceDialog = true;
    },
    editDbResource() {
      this.isAddDbResource = false;
      this.isShowDbResourceDialog = true;
    },
    closeDbResourceSettingDialog(id) {
      this.isLoading = true;
      this.dbResourceData = null;
      if (id && !this.dbResourceId) {
        this.$set(this.formValue, 'dbResourceId', id);
        this.changeDbResourceId(id);
      }
      this.isShowDbResourceDialog = false;
      this.$nextTick(() => {
        this.isLoading = false;
      });
    },
    closeAccountEditDialog(needFresh) {
      this.resourceId = null;
      this.isShowAccountEditDialog = false;
      if (needFresh) {
        this.refreshAccountList();
      }
    }
  },
  filter: {},
  computed: {
    // 历史值只用于展示已选数据库，候选列表仍由后端独立过滤。
    dbResourceHistory() {
      const item = this.dbResourceData;
      return item && item.id == this.formValue.dbResourceId ? [{value: item.id, text: this.getText(item)}] : [];
    },
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

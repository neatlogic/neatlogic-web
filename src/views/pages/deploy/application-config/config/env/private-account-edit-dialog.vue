<template>
  <TsDialog v-bind="dialogConfig" @on-close="closeDialog" @on-ok="savePrivateAccount">
    <TsForm ref="form" v-model="formValue" :item-list="formConfig">
    </TsForm>
  </TsDialog>
</template>
<script>
import {accountFields, accountValidation} from './database-account-fields';
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  filters: {},
  mixins: [accountValidation],
  props: {
    accountId: {
      // 账号id
      type: Number,
      default: null
    },
    resourceId: {
      // 资产id
      type: Number,
      default: null
    },
    accountList: {
      // 账号列表
      type: Array,
      default: function() {
        return [];
      }
    },
    params: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      protocol: '', // 协议
      formValue: {
        id: this.accountId,
        name: '', // 前端拼接：用户名[协议]
        account: '',
        passwordPlain: null,
        passwordConfirm: null, // 确认密码仅用于前端一致性校验。
        protocolId: null,
        tagIdList: []
      },
      // 备份查询接口返回的原始混合密文，避免编辑密码框时覆盖原值。
      passwordCipherBackup: '',
      dialogConfig: {
        type: 'modal',
        isShow: true,
        title: this.accountId ? this.$t('dialog.title.edittarget', {'target': this.$t('page.privateaccount')}) : this.$t('page.newtarget', {'target': this.$t('page.privateaccount')})
      },
      formConfig: {
        id: {
          type: 'text',
          name: 'id',
          isHidden: true,
          value: this.accountId
        },
        name: {
          type: 'text',
          name: 'name',
          width: '100%',
          label: this.$t('page.name'),
          maxlength: 50,
          isHidden: true
        },
        ...accountFields.call(this),
        tagIdList: {
          type: 'select',
          name: 'tagIdList',
          width: '100%',
          label: this.$t('page.tag'),
          transfer: true,
          multiple: true,
          search: true,
          allowCreate: true,
          dynamicUrl: '/api/rest/resourcecenter/tag/list/forselect',
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id'
        }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getAccountInfoById();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    getProtocalName(protocalPort) {
      let protocolName = protocalPort;
      return protocolName;
    },
    async savePrivateAccount() {
      const form = this.$refs['form'];
      let formValue = this.$refs.form.getFormValue();
      if (!form.valid()) {
        return;
      }
      // 提交前再次校验两次密码，避免绕过控件校验后发送不一致的数据。
      if (formValue.passwordPlain !== formValue.passwordConfirm) {
        this.$Message.error(this.$t('term.framework.pwdnotsame'));
        return;
      }
      try {
        const requestData = {
          ...formValue,
          appSystemId: this.params.appSystemId,
          appModuleId: this.params.appModuleId,
          envId: this.params.envId,
          type: 'private',
          resourceId: this.resourceId,
          name: `${formValue.account}[${this.protocol}]`
        };
        // 确认密码仅用于前端一致性校验，禁止传递到后端接口。
        delete requestData.passwordConfirm;
        if (requestData.passwordPlain) {
          // 当前RSA.AES密文都只能来自查询接口回显，禁止伪造或修改。
          const isEncryptedPassword = requestData.passwordPlain.startsWith('RSA.AES:');
          if (isEncryptedPassword && requestData.passwordPlain !== this.passwordCipherBackup) {
            this.$Message.error(this.$t('page.passwordinvalid'));
            return;
          }
          if (this.passwordCipherBackup && requestData.passwordPlain === this.passwordCipherBackup) {
            // 密码未修改时，将查询接口返回的原始混合密文通过专用字段回传。
            requestData.passwordCipher = this.passwordCipherBackup;
          } else {
            // 用户输入新密码时，由全局工具生成AES-GCM与RSA-OAEP混合密文。
            requestData.passwordCipher = await this.$utils.encryptPassword(requestData.passwordPlain);
          }
          delete requestData.passwordPlain;
        }
        // 部署环境私有账号使用独立保存接口，但密码密文格式与资源中心保持一致。
        const res = await this.$api.deploy.env.saveEnvDbPrivateaccount(requestData);
        if (res && (res.Status == 'OK')) {
          this.handleTipsMessage(res.Return);
        }
      } catch (error) {
        if (error.data && error.data.Message) {
          this.$Message.error(error.data.Message);
        } else {
          this.$Message.error(error.message || this.$t('message.savefailed'));
        }
      }
    },
    handleTipsMessage(res) {
      // 失败，错误提示
      if (res && res.failureReasonList && res.failureReasonList instanceof Array && res.failureReasonList.length > 0) {
        this.$Notice.error({
          title: this.$t('term.framework.errorinfo'),
          duration: 10,
          render: h => {
            return h('div', [
              h(
                'ul',
                { class: 'pb-md'},
                res.failureReasonList.map(item => {
                  return h('li', {}, item || '');
                })
              ),
              h('div', {}, this.$t('term.cmdb.repeataccount'))
            ]);
          }
        });
      } else {
        this.$Message.success(this.$t('message.savesuccess'));
        this.closeDialog(true);
      }
    },
    getAccountInfoById() {
      if (this.accountId) {
        this.$api.cmdb.accountManage.getAccountById(this.accountId).then(res => {
          this.tableData = res.Return;
          // 单独备份接口返回的passwordCipher，表单中的密码值变化不会修改该备份。
          this.passwordCipherBackup = this.tableData.passwordCipher || '';
          for (let key in this.formConfig) {
            this.$set(this.formValue, [key], this.tableData[key]);
          }
          if (this.passwordCipherBackup) {
            // 编辑已有账号时，两个密码控件同步回显密文，未修改时可直接通过一致性校验。
            this.$set(this.formValue, 'passwordPlain', this.passwordCipherBackup);
            this.$set(this.formValue, 'passwordConfirm', this.passwordCipherBackup);
          }
          if (this.tableData.tagList && this.tableData.tagList.length > 0) {
            let idList = [];
            this.tableData.tagList.forEach(v => {
              idList.push(v.id);
            });
            this.$set(this.formValue, 'tagIdList', idList);
          }
        });
      }
    },
    closeDialog(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  computed: {},
  watch: {}
};
</script>

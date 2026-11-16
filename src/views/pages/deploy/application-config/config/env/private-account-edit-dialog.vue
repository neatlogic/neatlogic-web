<template>
  <TsDialog v-bind="dialogConfig" @on-close="closeDialog" @on-ok="savePrivateAccount">
    <TsForm ref="form" v-model="formValue" :item-list="formConfig">
    </TsForm>
  </TsDialog>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')
  },
  filters: {},
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
        account: {
          type: 'text',
          name: 'account',
          width: '100%',
          label: this.$t('page.username'),
          maxlength: 50,
          validateList: ['required', {
            name: 'custom',
            trigger: 'change',
            message: this.$t('term.cmdb.repeataccount'),
            validator: (rule, val) => {
              return this.validAccountProtocalUnique(val);
            }
          }],
          isHidden: false
        },
        passwordPlain: {
          type: 'password',
          name: 'passwordPlain',
          width: '100%',
          showPassword: false, // 密码框始终隐藏明文，不提供明文切换。
          label: this.$t('page.password')
        },
        passwordConfirm: {
          type: 'password',
          name: 'passwordConfirm',
          width: '100%',
          showPassword: false, // 确认密码框同样始终隐藏明文。
          label: this.$t('term.framework.confirmpwd'),
          validateList: [
            {
              name: 'custom',
              trigger: 'change', // 输入或删除确认密码时触发校验，避免校验组件读取空trigger。
              message: this.$t('term.framework.pwdnotsame'),
              // 两个密码都为空时允许保存；任意一个有值时必须完全一致。
              validator: (rule, value) => {
                return value === this.formValue.passwordPlain;
              }
            }
          ]
        },
        protocolId: {
          type: 'select',
          width: '100%',
          label: this.$t('term.autoexec.protocol'),
          placeholder: this.$t('form.validate.selectprotocol'),
          dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
          rootName: 'tbodyList',
          dealDataByUrl: (nodeList) => { return this.dealProtocolIdDataByUrl(nodeList); },
          name: 'protocolId',
          errorMessage: '',
          validateList: ['required', {
            name: 'custom',
            trigger: 'change',
            message: this.$t('term.cmdb.repeataccount'),
            validator: (rule, protocolId) => {
              return this.validAccountProtocalUnique();
            }
          }],
          transfer: true,
          onChangelabel: (label) => {
            this.protocol = label;
          },
          onChange: (val, objectValue) => {
            this.protocol = objectValue ? objectValue.text : '';
            if (!this.validAccountProtocalUnique()) {
              this.$set(this.formConfig['protocolId'], 'errorMessage', this.$t('term.cmdb.repeataccount'));
            } else {
              this.$set(this.formConfig['protocolId'], 'errorMessage', '');
            }
            if (val == '478184378212353') {
              // 如果选择为 tagent 的时候，用户名为非必填
              this.formConfig.account.validateList = [];
              this.formConfig.account.isHidden = true; // 隐藏账号字段
            } else {
              this.formConfig.account.validateList = ['required',
                {
                  name: 'custom',
                  trigger: 'change',
                  message: this.$t('term.cmdb.repeataccount'),
                  validator: (rule, val) => {
                    return this.validAccountProtocalUnique(val);
                  }
                }];
              this.formConfig.account.isHidden = false;
            }
          }
        },
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
    validAccountProtocalUnique(account) {
      // 验证协议和账号唯一
      let isValid = true;
      let accountName = '';
      let accountList = this.$utils.deepClone(this.accountList) || []; // 编辑私有账号时，不验证自身协议和账号唯一
      accountList = accountList.filter((item) => {
        return item.value != this.accountId;
      });
      if (this.protocol && (account || (this.formValue && this.formValue.account))) {
        accountName = account || (this.formValue && this.formValue.account);
        for (let i = 0; i < accountList.length; i++) {
          if (accountList[i] && accountList[i].config && accountList[i].config.account && (accountList[i].config.account == accountName) && (accountList[i].config.protocol == this.protocol)) {
            isValid = false;
          }
        }
      }
      if (isValid) {
        this.$set(this.formConfig['protocolId'], 'errorMessage', '');
      }
      return isValid;
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
    dealProtocolIdDataByUrl(nodeList) {
      // 处理协议id下拉列表
      let dataList = [];
      if (nodeList && nodeList.length > 0) {
        nodeList.forEach((item) => {
          dataList.push({
            text: item.name,
            value: item.id,
            _disabled: item.id == '445524809146368'
          });
        });
      }
      return dataList;
    },
    closeDialog(needRefresh) {
      this.$emit('close', needRefresh);
    }
  },
  computed: {},
  watch: {}
};
</script>

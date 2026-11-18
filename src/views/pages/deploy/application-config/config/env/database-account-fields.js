// 资源账号与申请共用账号、协议和密码确认字段，保存策略由表单所属页面提供。
export function accountFields() {
  return {
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
    }
  };
}

export const accountValidation = {
  methods: {
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
    }
  }
};

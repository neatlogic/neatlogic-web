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
    TsForm: resolve => require(['@/resources/plugins/TsForm/TsForm'], resolve)
  },
  filters: {},
  props: {
    accountId: {
      // 帐号id
      type: Number,
      default: null
    },
    resourceId: {
      // 资产id
      type: Number,
      default: null
    },
    accountList: {
      // 帐号列表
      type: Array,
      default: function() {
        return [];
      }
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
        protocolId: null,
        tagIdList: []
      },
      dialogConfig: {
        type: 'modal',
        isShow: true,
        title: this.accountId ? '编辑私有帐号' : '新增私有帐号'
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
          label: '名称',
          maxlength: 50,
          isHidden: true
        },
        account: {
          type: 'text',
          name: 'account',
          width: '100%',
          label: '用户名',
          maxlength: 50,
          validateList: ['required', {
            name: 'custom',
            trigger: 'change',
            message: '协议相同且用户名相同，同一资产不可绑定多个协议相同且用户名相同的帐号。',
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
          label: '密码'
        },
        protocolId: {
          type: 'select',
          width: '100%',
          label: '协议',
          placeholder: this.$t('form.validate.selectprotocol'),
          dynamicUrl: '/api/rest/resourcecenter/account/protocol/search',
          rootName: 'tbodyList',
          dealDataByUrl: (nodeList) => { return this.dealProtocolIdDataByUrl(nodeList); },
          name: 'protocolId',
          errorMessage: '',
          validateList: ['required', {
            name: 'custom',
            trigger: 'change',
            message: '协议相同且用户名相同，同一资产不可绑定多个协议相同且用户名相同的帐号。',
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
              this.$set(this.formConfig['protocolId'], 'errorMessage', '协议相同且用户名相同，同一资产不可绑定多个协议相同且用户名相同的帐号。');
            } else {
              this.$set(this.formConfig['protocolId'], 'errorMessage', '');
            }
            if (val == '478184378212353') {
              // 如果选择为 tagent 的时候，用户名为非必填
              this.formConfig.account.validateList = [];
              this.formConfig.account.isHidden = true; // 隐藏帐号字段
            } else {
              this.formConfig.account.validateList = ['required',
                {
                  name: 'custom',
                  trigger: 'change',
                  message: '协议相同且用户名相同，同一资产不可绑定多个协议相同且用户名相同的帐号。',
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
          label: '标签',
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
      // 验证协议和帐号唯一
      let isValid = true;
      let accountName = '';
      let accountList = this.$utils.deepClone(this.accountList) || []; // 编辑私有帐号时，不验证自身协议和帐号唯一
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
    savePrivateAccount() {
      const form = this.$refs['form'];
      let formValue = this.$refs.form.getFormValue();
      if (!form.valid()) {
        return;
      }
      this.$api.cmdb.accountManage
        .saveAccount({...formValue, type: 'private', resourceId: this.resourceId, name: `${formValue.account}[${this.protocol}]`}) // 私有帐号
        .then(res => {
          if (res && (res.Status == 'OK')) {
            this.handleTipsMessage(res.Return);
          }
        });
    },
    handleTipsMessage(res) {
      // 失败，错误提示
      if (res && res.failureReasonList && res.failureReasonList instanceof Array && res.failureReasonList.length > 0) {
        this.$Notice.error({
          title: '错误提示',
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
              h('div', {}, '协议相同且用户名相同，同一资产不可绑定多个协议相同且用户名相同的帐号。')
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
          for (let key in this.formConfig) {
            this.$set(this.formValue, [key], this.tableData[key]);            
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

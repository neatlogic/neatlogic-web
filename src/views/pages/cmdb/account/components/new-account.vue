<template>
  <TsDialog v-bind="dialogConfig" @on-close="close" @on-ok="save">
    <TsForm ref="form" :item-list="formConfig">
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
    id: { type: Number },
    title: String
  },
  data() {
    return {
      dialogConfig: {
        type: 'modal',
        isShow: true,
        title: this.title
      },
      tableData: {
        dataList: []
      },
      // 备份查询接口返回的原始密码密文，避免用户编辑密码框时覆盖原值。
      passwordCipherBackup: '',
      formConfig: {
        id: {
          type: 'text',
          name: 'id',
          isHidden: true
        },
        name: {
          type: 'text',
          name: 'name',
          width: '100%',
          label: this.$t('page.name'),
          maxlength: 50,
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', {target: this.$t('page.name')}), url: '/api/rest/resourcecenter/account/save', key: 'name' }]
        },
        account: {
          type: 'text',
          name: 'account',
          width: '100%',
          label: this.$t('page.username'),
          maxlength: 50,
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', {target: this.$t('page.username')})}]
        },
        passwordPlain: {
          type: 'password',
          name: 'passwordPlain',
          width: '100%',
          label: this.$t('page.password')
        },
        protocolId: {
          type: 'select',
          width: '100%',
          label: this.$t('page.protocol'),
          placeholder: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.protocol')}),
          dynamicUrl: 'api/rest/resourcecenter/account/protocol/search',
          dealDataByUrl: this.$utils.getProtocolDataList,
          params: {isExcludeTagent: 1}, // 是否排除tagent
          rootName: 'tbodyList',
          name: 'protocolId',
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseselect', {target: this.$t('page.protocol')}) }],
          transfer: true
        },
        isDefault: {
          type: 'switch',
          name: 'isDefault',
          label: this.$t('page.isdefault'), // 默认账号
          value: 0,
          validateList: ['required']
        },
        tagIdList: {
          type: 'select',
          name: 'tagIdList',
          width: '100%',
          label: this.$t('page.tag'),
          transfer: true,
          multiple: true,
          value: [],
          search: true,
          allowCreate: true,
          dynamicUrl: 'api/rest/resourcecenter/tag/list/forselect',
          rootName: 'tbodyList',
          textName: 'name',
          valueName: 'id'
        }
        // port: {
        //   type: 'text',
        //   name: 'port',
        //   width: '100%',
        //   label: this.$t('page.port'),
        //   maxlength: 50,
        //   tooltip: '主机账号需要填写端口，应用账号无需填写端口',
        //   validateList: [
        //     { name: 'port', message: this.$t('form.validate.inputcorrectport') }
        //   ]
        // }
      }
    };
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.getAccountType();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async save() {
      const form = this.$refs['form'];
      let data = this.$refs.form.getFormValue();
      if (!form.valid()) {
        return;
      }
      try {
        const requestData = {...data, type: 'public'};
        if (requestData.passwordPlain) {
          const isRsaPassword = requestData.passwordPlain.startsWith('{RSA}');
          // 以{RSA}开头的内容只能是查询接口回显的原始密文，禁止伪造或修改密文。
          if (isRsaPassword && requestData.passwordPlain !== this.passwordCipherBackup) {
            this.$Message.error('密码不合法');
            return;
          }
          if (this.passwordCipherBackup && requestData.passwordPlain === this.passwordCipherBackup) {
            // 密码未修改时直接回传原始密文，同时兼容历史RC4密文和新的RSA密文。
            requestData.passwordCipher = this.passwordCipherBackup;
          } else {
            // 用户输入新密码时，提交前获取公钥并生成新的RSA密文。
            const publicKeyRes = await this.$api.cmdb.accountManage.getAccountPasswordPublicKey();
            requestData.passwordCipher = await this.encryptPassword(requestData.passwordPlain, publicKeyRes.Return.publicKey);
          }
          delete requestData.passwordPlain;
        }
        const res = await this.$api.cmdb.accountManage.saveAccount(requestData);
        if (res.Status == 'OK') {
          this.$Message.success(this.$t('message.savesuccess'));
          this.close(true);
        }
      } catch (error) {
        if (error.data && error.data.Message) {
          this.$Message.error(error.data.Message);
        } else {
          this.$Message.error(error.message || this.$t('message.savefailed'));
        }
      }
    },
    async encryptPassword(password, publicKey) {
      if (password.startsWith('{RSA}')) {
        return password;
      }
      if (!window.crypto || !window.crypto.subtle || typeof TextEncoder === 'undefined') {
        throw new Error('当前浏览器不支持密码安全加密');
      }
      const publicKeyBinary = window.atob(publicKey);
      const publicKeyBytes = new Uint8Array(publicKeyBinary.length);
      for (let i = 0; i < publicKeyBinary.length; i++) {
        publicKeyBytes[i] = publicKeyBinary.charCodeAt(i);
      }
      const cryptoKey = await window.crypto.subtle.importKey(
        'spki',
        publicKeyBytes.buffer,
        {name: 'RSA-OAEP', hash: 'SHA-256'},
        false,
        ['encrypt']
      );
      const passwordBytes = new TextEncoder().encode(password);
      if (passwordBytes.length > 190) {
        throw new Error('密码内容过长，无法进行安全加密');
      }
      const encrypted = await window.crypto.subtle.encrypt(
        {name: 'RSA-OAEP'},
        cryptoKey,
        passwordBytes
      );
      const encryptedBytes = new Uint8Array(encrypted);
      let encryptedBinary = '';
      for (let i = 0; i < encryptedBytes.length; i++) {
        encryptedBinary += String.fromCharCode(encryptedBytes[i]);
      }
      let passwordEncrypt = window.btoa(encryptedBinary);
      return '{RSA}' + passwordEncrypt;
    },
    close: function(needRefresh, formValue = null) {
      this.$emit('close', needRefresh, formValue);
    },
    getAccountType() {
      this.formConfig.passwordPlain.passwordPlain = false;
      if (this.id) {
        this.$api.cmdb.accountManage.getAccountById(this.id).then(res => {
          this.tableData = res.Return;
          // 单独备份接口返回的passwordCipher，表单中的密码值变化不会修改该备份。
          this.passwordCipherBackup = this.tableData.passwordCipher || '';
          for (let key in this.formConfig) {
            this.$set(this.formConfig[key], 'value', this.tableData[key]);
          }
          if (this.passwordCipherBackup) {
            // 编辑已有账号时，在密码控件中回显接口返回的密文。
            this.$set(this.formConfig.passwordPlain, 'value', this.passwordCipherBackup);
          }
          if (this.tableData.tagList && this.tableData.tagList.length > 0) {
            let idList = [];
            this.tableData.tagList.forEach(v => {
              idList.push(v.id);
            });
            this.$set(this.formConfig.tagIdList, 'value', idList);
          }
        });
      }
    }
  },
  computed: {},
  watch: {}
};
</script>

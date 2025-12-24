<template>
  <div>
    <TsForm ref="password" :itemList="pwdSetting"></TsForm>
    <Button class="save" type="primary" @click="save()">{{ $t('page.save') }}</Button>
  </div>
</template>
<script>
export default {
  name: '',
  components: {
    TsForm: () => import('@/resources/plugins/TsForm/TsForm')

  },
  props: {},
  data() {
    return {
      userInfo: {},
      pwdSetting: [
        {
          type: 'password',
          name: 'password',
          value: '',
          readonly: false,
          disabled: false,
          isHidden: false,
          placeholder: '',
          width: 250,
          label: this.$t('term.framework.currentpwd'),
          showPassword: true,
          validateList: [{ name: 'required', message: this.$t('form.placeholder.pleaseinput', { target: this.$t('term.framework.currentpwd') }) }]
        },
        {
          type: 'password',
          name: 'newpwd',
          value: '',
          readonly: false,
          disabled: false,
          isHidden: false,
          placeholder: '',
          width: 250,
          label: this.$t('term.framework.newpwd'),
          showPassword: true,
          validateList: [
            { name: 'required', message: this.$t('form.placeholder.pleaseinput', { target: this.$t('term.framework.newpwd') }) },
            {
              name: 'passcode',
              message: this.$t('message.passcode')
            }
          ]
        },
        {
          type: 'password',
          name: 'confirmpwd',
          value: '',
          readonly: false,
          disabled: false,
          isHidden: false,
          placeholder: '',
          width: 250,
          label: this.$t('term.framework.confirmpwd'),
          showPassword: true,
          validateList: [
            { name: 'required', message: this.$t('term.framework.pleaseconfirmnewpwd') },
            {
              name: 'passcode',
              message: this.$t('message.passcode')
            }
          ]
        }
      ]
    };
  },
  beforeCreate() {},
  created() {
  
  },
  beforeMount() {},
  mounted() {
    this.userInfo = this.$utils.getUserInfo();
  },
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    save() {
      let refsName = this.$refs['password'];
      if (!refsName.valid()) {
        return;
      }
      let data = refsName.getFormValue();
      let oldpwd = '{MD5}' + this.$md5(data.password);
      let newpwd = '{MD5}' + this.$md5(data.confirmpwd);
      if (data.newpwd !== data.confirmpwd) {
        this.$Notice.error({
          title: this.$t('message.savefailed'),
          desc: this.$t('term.framework.pwdnotsame'),
          duration: 2
        });
        return;
      }
      let pwdData = {
        oldPassword: oldpwd,
        userId: this.userInfo.userId,
        password: newpwd
      };
      this.$api.framework.user
        .updatePwd(pwdData)
        .then(res => {
          if (res.Status == 'OK') {
            this.$Message.success(this.$t('message.updatesuccess'));
            if (this.getRedirect()) {
              window.location.href = HOME + '/' + this.getRedirect();
            } else {
              window.location.reload();
            }
          }
        });
    },
    getRedirect() {
      let redirecturl = null;
      try {
        redirecturl = window.location.href.split('redirect=')[1];
      } catch (e) {
        console.log(e);
      }
      return redirecturl;
    }
  },
  filter: {},
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
.save {
  margin-left: 120px;
}
</style>

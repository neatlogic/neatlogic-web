<template>
  <div style="display: inline-block;">
    <TsForm ref="password" :itemList="pwdSetting"></TsForm>
    <div class="pt-sm text-right">
      <Button class="save" type="primary" @click="save()">{{ $t('page.save') }}</Button>
      <Button v-if="$store.state.isPwdRedirected" class="logout ml-sm" @click="logout()">{{ $t('page.logout') }}</Button>
    </div>
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
            this.$store.commit('setPwdRedirected', false);
            if (this.getRedirect()) {
              window.location.href = HOME + '/' + decodeURIComponent(this.getRedirect());
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
    },
    logout() {
      let data = {};
      this.$api.common.logout(data).then(res => {
        if (res.Status == 'OK') {
          sessionStorage.removeItem('neatlogic_authorization');
          this.$utils.removeCookie('neatlogic_authorization');
          this.$store.commit('setPwdRedirected', false);
          let url = res.Return.url || '';
          if (url) {
            url = url.indexOf('http://') == -1 && url.indexOf('https://') == -1 ? 'http://' + url : url;
            window.open(url, '_self');
          } else {
            window.location.href = HOME + '/login.html';
          }
        }
      });
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

<template>
  <div id="login" class="login-bg" @keydown.enter="login">
    <div id="loginContainer">
      <form
        id="loginForm"
        method="GET"
        name="loginForm"
        class="input-border"
      >
        <p class="text-title">{{ title }}</p>
        <div class="title-bottom text-grey">For your better IT service</div>
        <div class="form-wrap">
          <div class="user-input">
            <Input
              v-model.trim="loginForm.username"
              prefix="i-icon ts-user"
              clearable
              type="text"
              placeholder="Username"
              class="login-int"
            />
          </div>
          <div>
            <Input
              v-model.trim="loginForm.password"
              prefix="i-icon ts-lock"
              password
              type="password"
              placeholder="Password"
              class="login-int"
            />
          </div>
          <!-- <div>
            <Checkbox v-model="remember">
              <span class="text-grey">Remember me</span>
            </Checkbox>
          </div> -->
          <div>
            <Button id="btnLogin" :loading="logining" @click="login">{{ $t('page.login') }}</Button>
          </div>
        </div>
        <div v-show="error" class="err-block">
          {{ errortxt }}
        </div>
      </form>
    </div>
    <div class="switch-theme">
      <div class="action-group">
        <span class="action-item tsfont-flow" @click.stop="changeLanguage">{{ $t('page.language') }}</span>
        <span class="action-item" :class="themeClass == 'theme-default' ? 'tsfont-night':'tsfont-day'" @click.stop="changeTheme">
          {{ themeClass == 'theme-default' ? $t('page.themedark'): $t('page.themelight') }}
        </span>
      </div>
    </div>
  </div>
</template>
<script>
import ThemeUtils from '@/views/pages/framework/theme/themeUtils.js';
import {mutations} from '@/views/pages/framework/theme/state.js';

export default {
  name: '',
  components: {},
  props: {
    authtype: String,
    encrypt: String
  },
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      title: process.env.VUE_APP_LOGINTITLE,
      error: false,
      errortxt: '',
      remember: false,
      logining: false,
      themeClass: localStorage.getItem('themeClass') || 'theme-default'
    };
  },
  beforeCreate() {},
  created() {
    document.onkeydown = (e) => {
      let key = window.event.keyCode;
      if (key == 13) {
        this.login();
      }
    };
    // 解决从IE跳转到chrome，token等数据丢失的问题
    let fullPath = this.$route.fullPath;
    if (fullPath.indexOf('/sso1/') != -1) {
      let replaceUrl = fullPath.replace('/sso1/', '/sso/');
      this.$router.push({
        path: replaceUrl,
        replace: true
      });
    }
  },
  beforeMount() {
    ThemeUtils.activeTheme();
  },
  mounted() {
    document.documentElement.classList.add(this.themeClass);
  },
  methods: {
    login() {
      if (this.loginForm.username === '') {
        this.error = true;
        this.errortxt = this.$t('form.placeholder.pleaseinput', {target: this.$t('page.username')});
      } else if (this.loginForm.password === '') {
        this.error = true;
        this.errortxt = this.$t('form.placeholder.pleaseinput', {target: this.$t('page.password')});
      } else {
        this.error = false;
        let psd = '{MD5}' + this.$md5(this.loginForm.password);
        if (this.encrypt === 'base64') {
          psd = '{BS}' + this.$base64.encode(this.loginForm.password);
        }
        let param = {
          userid: this.loginForm.username, 
          password: psd,
          authType: this.authtype
        };
        this.logining = true;
        this.$axios({method: 'post', url: '/login/check', data: param}).then(res => { //登录页面的接口不在全局（获取租户等，还有减少登录页面不必要的资源加载）
          this.logining = false;
          if (res.data) {
            if (res.data.Status == 'OK') {
              if (res.data.JwtToken) {
                sessionStorage.setItem('neatlogic_authorization', 'Bearer_' + res.data.JwtToken);
              }
              if (this.getRedirect()) {
                window.location.href = HOME + '/' + this.getRedirect();
              } else {
                window.location.href = HOME + '/index.html';
              }
              if (!localStorage.themeClass) {
                localStorage.themeClass = 'theme-default';
              }
            } else if (res.data.Status == 'ERROR') {
              this.error = true;
              this.errortxt = res.data.Message;
              sessionStorage.removeItem('neatlogic_authorization');
            }
          }
        }).catch(error => {
          this.logining = true;
          this.error = true;
          this.errortxt = this.$t('page.accountorpwderror');
          sessionStorage.removeItem('neatlogic_authorization');
        });
      }
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
    changeTheme() {
      let htmlClassList = document.documentElement.classList;
      htmlClassList.toggle('theme-default');
      htmlClassList.toggle('theme-dark');
      localStorage.setItem('themeClass', htmlClassList[0]);
      ThemeUtils.activeTheme(); //获取定制主题
      ThemeUtils.updateThemeValue(mutations, 'setLogo', 'logo'); // 这个方法，主要是更新状态管理器，setlogo 是参数名称
      this.$store.commit('setThemeType', htmlClassList[0]);
      this.themeClass = htmlClassList[0];
    },
    changeLanguage() {
      let lang = this.$i18n.locale;
      if (lang == 'zh') {
        this.$i18n.locale = 'en';
      } else {
        this.$i18n.locale = 'zh';
      }
      this.$utils.setCookie('neatlogic_language', this.$i18n.locale, 7);
      this.reloadRouter && this.reloadRouter();
    }
  },
  computed: {},
  watch: {}
};
</script>
<style lang="less" scoped>
@import (reference) '~@/resources/assets/css/variable.less';
.theme(@primary-color, @login-bg-color, @bg-op, @input-border, @text-color) {
html,
body {
  width: 100%;
  height: 100%;
}
.login-bg {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  // background-image: url("../../../resources/assets/images/login/login-bg.png");
  background-position: center center;
  background-size: cover;
  background: var(--login-bg-color, @login-bg-color);
}
.switch-theme {
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 2;
}
#loginContainer {
  width: 100%;
  height: 100%;
  z-index: 1;
}
#loginContainer:before {
  content: '';
  height: 50%;
  width: 100%;
  bottom: 8%;
  left: 0;
  position: absolute;
  background: url('~img-module/login-pic.png') no-repeat center center;
  background-size: auto 100%;
}
.form-wrap {
  display: flex;
  margin: 0 auto;
  .user-input{
    margin-right: 32px;
  }
}
.form-block {
  float: none;
  padding: 6px 0;
}
.err-block {
  margin: 0 auto;
    color:@default-error-color
}
#loginForm {
 display: block;
  width: 827px;
  height: 360px;
  margin: 0 auto;
  position: relative;
  top: 38%;
  margin-top: -180px;
}
#loginForm p {
  padding-top: 40px;
  padding-bottom: 6px;
  font-size: 24px;
}
#loginForm .title-bottom {
  margin-left: 0;
  font-size: 14px;
  padding-bottom: 20px;
  color: #8E949F;
}
#btnLogin {
  width: 102px;
  height: 42px;
  line-height: 41px;
  font-size: 16px;
  background: var(--primary-color, @primary-color);
  border-color: var(--primary-color, @primary-color);
  color: #fff;
  margin-left: 20px;
  &:focus {
    box-shadow: none;
  }
}
.form-wrap{
  /deep/.ivu-btn > span{
    vertical-align: top;
  }
}
.login-int{
  width: 336px;
  /deep/.ivu-input {
    border: 1px solid var(--input-border, @input-border)!important;
    height: 42px;
    line-height: 42px;
    border-radius: 8px;
    background: var(--bg-op, @bg-op);
    color: var(--text-color, @text-color);
  }
  /deep/.ivu-input:focus{
    // box-shadow: none;
    box-shadow: 0 0 0 2px @default-primary-color 0.2!important;
    background: transparent!important;
  }
  /deep/input:focus:-webkit-autofill, /deep/input:-webkit-autofill{
    background: @default-primary-grey!important;
    -webkit-text-fill-color: var(--text-color, @text-color) !important;
    // box-shadow: 0 0 0px 1000px @primary-grey inset !important;
    transition: background-color 500000s ease-in-out 50000s;
  }
  /deep/.ivu-input-prefix i,
  /deep/.ivu-input-suffix i{
    line-height: 40px;
  }
}
}
html {
  .theme(@default-primary-color, @default-login-bg-color, @default-op, @default-input-border, @default-text);
  &.theme-dark {
    .theme(@dark-primary-color, @dark-login-bg-color, @dark-op, @dark-input-border, @dark-text);
  }
}

</style>

import Vue from 'vue';
import VueRouter from 'vue-router';
import 'neatlogic-ui/iview/styles/index.less';
import ViewUI from 'neatlogic-ui/iview/index.js';
import Login from './Login.vue';
import axios from 'axios';
import VueI18n from 'vue-i18n';
import CompareUtil from '@/resources/assets/js/compareUtil.js';
import md5 from 'js-md5';
import { Base64 } from 'js-base64';
import { initI18n } from '@/resources/init.js';
import ThemeUtils from '@/views/pages/framework/theme/themeUtils.js';
import store from '@/resources/store';
import '@/resources/base.js'; // 全局样式

Vue.use(ViewUI);
Vue.use(VueI18n);
Vue.use(CompareUtil);//必须要在use router之后执行

Vue.config.productionTip = false;
Vue.prototype.$md5 = md5;
Vue.prototype.$base64 = Base64;
Vue.prototype.$axios = axios;

axios.defaults.baseURL = BASEURLPREFIX; //默认接口前缀
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.Tenant = TENANT;

let encrypt = 'md5';
let authtype = 'default';
axios({
  method: 'post',
  url: '/tenant/check',
  data: {}
}).then(res => {
  let data = res.data;
  if (data) {
    if (data.Status != 'OK') {
      window.location.href = '/404.html';
    } else {
      // 存储主题配置
      if (data.themeConfig && Object.values(data.themeConfig).length > 0) {
        let themeConfig = {
          light: data.themeConfig.light,
          dark: data.themeConfig.dark
        };
        ThemeUtils.configTheme(themeConfig);
        ThemeUtils.activeTheme();
      } else {
        ThemeUtils.resetTheme();
      }
      authtype = data.authType;
      encrypt = data.encrypt;
    }

    let i18n = initI18n(VueI18n, {});//语言包配置
    Vue.prototype.i18n = i18n;
    new Vue({
      router,
      i18n,
      store,
      render: h => h(Login, {props: {'authtype': authtype, 'encrypt': encrypt}})
    }).$mount('#index');
  }
}).catch(error => {
  window.location.href = '/404.html';
});

Vue.use(VueRouter);
const router = new VueRouter({
  mode: 'history',
  base: '/' + TENANT + '/'
});

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  next();
});

// 解决登录页面，路由重定向保存问题
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(locatoin) {
  return originalPush.call(this, locatoin).catch(err => err);
};

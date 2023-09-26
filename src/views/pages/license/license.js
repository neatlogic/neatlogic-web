import Vue from 'vue';
import VueRouter from 'vue-router';
import 'neatlogic-ui/iview/styles/index.less';
import ViewUI from 'neatlogic-ui/iview/index.js';
import utils from '@/resources/assets/js/util.js';
import CompareUtil from '@/resources/assets/js/compareUtil.js';
import api from '@/resources/api/api.js';

import TsContain from '@/resources/components/TsContain/TsContain.js';
import TsRow from '@/resources/components/TsRow/TsRow';
import License from './License.vue';
import axios from 'axios';
import VueI18n from 'vue-i18n';
import 'assets/index.js';
import md5 from 'js-md5';

//公共的全局组件、样式等
import '@/resources/base.js';
import {initRouter, initI18n} from '@/resources/init.js';

Vue.use(ViewUI);
Vue.use(VueI18n);
Vue.use(CompareUtil);//必须要在use router之后执行

Vue.use(TsContain);
Vue.use(TsRow);

Vue.config.productionTip = false;
Vue.prototype.$md5 = md5;
Vue.prototype.$axios = axios;
axios.defaults.baseURL = BASEURLPREFIX; //默认接口前缀
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.Tenant = TENANT;

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
let i18n = initI18n(VueI18n, {});//语言包配置
Vue.prototype.i18n = i18n;
Vue.prototype.$utils = utils;
Vue.prototype.$api = api;

new Vue({
  router,
  i18n,
  render: h => h(License)
}).$mount('#index');

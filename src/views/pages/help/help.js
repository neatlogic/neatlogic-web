import Vue from 'vue';
import VueRouter from 'vue-router';
import Help from './help.vue';
import indexRouter from './router.js';
import store from '@/resources/store';
import VueI18n from 'vue-i18n';
import CompareUtil from '@/resources/assets/js/compareUtil.js';
import md5 from 'js-md5';
import api from '@/resources/api/index/index.js';

import {initRouter, initI18n} from '@/resources/init.js';

MODULEID = 'help';
MENULIST = indexRouter;

Vue.use(VueRouter);
Vue.use(VueI18n);
Vue.use(CompareUtil);//必须要在use router之后执行

import '@/resources/base.js';

let router = initRouter(VueRouter, store);//路由拦截处理
let i18n = initI18n(VueI18n, {});//语言包配置

Vue.config.productionTip = false;
Vue.prototype.$api = api;
Vue.prototype.$md5 = md5;

new Vue({
  router,
  store,
  i18n,
  render: h => h(Help)
}).$mount('#index');


import Vue from 'vue';
import VueRouter from 'vue-router';
import '@/resources/base.js';
import Dashboard from './dashboard.vue';
import routers from './router.js';
import store from '@/resources/store';
import VueI18n from 'vue-i18n';
import CompareUtil from '@/resources/assets/js/compareUtil.js';
import md5 from 'js-md5';
import api from '@/resources/api/api.js';
import LocalStore from '@/resources/assets/js/localStore.js';
import State from '@/resources/assets/js/state.js';
import commonRouters from '@/views/pages/common/router.js';
import { buildMergedRoutes } from '@/resources/import/router-config.js';

//公共的全局组件、样式等
import { initRouter, initI18n } from '@/resources/init.js';

Vue.use(VueRouter);
Vue.use(VueI18n);
Vue.use(CompareUtil); //必须要在use router之后执行

import { config } from './config.js';
MODULEID = config.module;
MENULIST = buildMergedRoutes(MODULEID, routers, commonRouters);
MENUTYPE = config.menuType;

let router = initRouter(VueRouter, store); //路由拦截处理
let i18n = initI18n(VueI18n, {}); //语言包配置

Vue.prototype.$tsrouter = router;
Vue.config.productionTip = false;
Vue.prototype.$api = api;
Vue.prototype.$md5 = md5;
Vue.prototype.$localStore = new LocalStore('dashboard', router);
Vue.prototype.$state = new State('dashboard');

new Vue({
  router,
  store,
  i18n,
  render: h => h(Dashboard)
}).$mount('#index');

import Vue from 'vue';
import VueRouter from 'vue-router';
import Framework from './framework.vue';
import routers from './router.js';
import store from '@/resources/store';
import CompareUtil from '@/resources/assets/js/compareUtil.js';
import api from '@/resources/api/api.js';
import VueI18n from 'vue-i18n';
import md5 from 'js-md5';
import frameworkUtils from '@/views/pages/framework/matrix/utils/utils';
import LocalStore from '@/resources/assets/js/localStore.js';

//公共的全局组件、样式等
import '@/resources/base.js';
import {initRouter, initI18n} from '@/resources/init.js';

Vue.use(VueRouter);
Vue.use(VueI18n);
Vue.use(CompareUtil);//必须要在use router之后执行

import {config} from './config.js';
MODULEID = config.module;
MENULIST = routers;
MENUTYPE = config.menuType;

let router = initRouter(VueRouter, store);//路由拦截处理
let i18n = initI18n(VueI18n, {});//语言包配置

Vue.prototype.$tsrouter = router;
Vue.config.productionTip = false;
Vue.prototype.$api = api;
Vue.prototype.$md5 = md5;
Vue.prototype.$frameworkUtils = frameworkUtils;
Vue.prototype.$localStore = new LocalStore('framework', router);

new Vue({
  router,
  store,
  i18n,
  render: h => h(Framework)
}).$mount('#index');

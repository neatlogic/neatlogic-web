import Vue from 'vue';
import VueRouter from 'vue-router';
import Report from './report.vue';
import routers from './router.js';
import store from '@/resources/store';
import VueI18n from 'vue-i18n';
import CompareUtil from '@/resources/assets/js/compareUtil.js';
import api from '@/resources/api/api.js';
import LocalStore from '@/resources/assets/js/localStore.js';

import md5 from 'js-md5';

//公共的全局组件、样式等
import '@/resources/base.js';
import {initRouter, initI18n} from '@/resources/init.js';

Vue.use(VueRouter);
Vue.use(VueI18n);
Vue.use(CompareUtil);//必须要在use router之后执行

let newRouters = routers;
if (location.hostname != 'localhost') {
  // demo 只在本地环境显示，线上环境不显示
  newRouters = [];
  routers.forEach((v, i) => {
    if (v.name != 'demo') {
      newRouters.push(v);
    }
  });
}
import {config} from './config.js';
MODULEID = config.module;
MENULIST = newRouters;
// MENULIST = routers;
MENUTYPE = config.menuType;

let router = initRouter(VueRouter, store);//路由拦截处理
let i18n = initI18n(VueI18n, {});//语言包配置

Vue.config.productionTip = false;
Vue.prototype.$api = api;
Vue.prototype.$md5 = md5;
Vue.prototype.$tsrouter = router;
Vue.prototype.$localStore = new LocalStore('report', router);

new Vue({
  router,
  store,
  i18n,
  render: h => h(Report)
}).$mount('#index');

import Vue from 'vue';
import VueRouter from 'vue-router';
import Knowledge from './knowledge.vue';
import routers from './router.js';
import store from '@/resources/store';
import CompareUtil from '@/resources/assets/js/compareUtil.js';
import api from '@/resources/api/api.js';
import { $t } from '@/resources/init.js';
import LocalStore from '@/resources/assets/js/localStore.js';
import mavonEditor from 'mavon-editor';
import 'mavon-editor/dist/css/index.css';

import VueI18n from 'vue-i18n';
//公共的全局组件、样式等
import '@/resources/base.js';
import { initRouter, initI18n } from '@/resources/init.js';

Vue.use(VueRouter);
Vue.use(VueI18n);
Vue.use(CompareUtil); //必须要在use router之后执行
Vue.use(mavonEditor);

import { config } from './config.js';
MODULEID = config.module;
MENULIST = routers;
MENUTYPE = config.menuType;

let router = initRouter(VueRouter, store); //路由拦截处理
let i18n = initI18n(VueI18n, {}); //语言包配置

Vue.prototype.$tsrouter = router;
Vue.config.productionTip = false;
Vue.prototype.$api = api;
Vue.prototype.$localStore = new LocalStore('knowledge', router);

//知识库的路由拦截有自己逻辑，因此需要覆盖公共方法
const gettingUserInfo = store.dispatch('getUserInfo');
const gettingModuleList = store.dispatch('getModuleList');
const gettingKnowledgeTypeMenu = store.dispatch('leftMenu/getKnowledgeTypeMenu');

router.beforeEach(async(to, from, next) => {
  let title = to.meta.title ? to.meta.title : to.name || to.path;
  document.title = $t(title);
  let usertoken = Vue.prototype.$utils.getCookie('neatlogic_authorization');
  //如果是租户不存在，进路由前拦截统一外层404
  if (!usertoken) {
    if (to.fullPath && to.fullPath != '/') {
      window.location.href = HOME + '/login.html?tenant=' + TENANT + '&redirect=' + MODULEID + '.html#' + to.fullPath;
    } else {
      window.location.href = HOME + '/login.html?tenant=' + TENANT + '&redirect=' + MODULEID + '.html#';
    }
  } else {
    await gettingUserInfo;
    await gettingKnowledgeTypeMenu;
    const auth = to.meta ? to.meta.authority : null;
    if (!auth || store.getters.userAuthList.includes(auth)) {
      next();
    } else {
      next({ path: '/404', replace: true, query: { des: $t('page.acessdenine') } });
    }
  }
});

new Vue({
  router,
  store,
  i18n,
  render: h => h(Knowledge)
}).$mount('#index');

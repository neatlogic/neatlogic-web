import Vue from 'vue';
import utils from '@/resources/assets/js/util.js';
import Zh from '@/resources/assets/languages/zh.js';
import En from '@/resources/assets/languages/en.js';
import VueI18n from 'vue-i18n';

let config = {
  locale: BASELANGUAGES, // 定义默认语言为中文
  messages: {
    zh: {
      //...commonZn,
      ...Zh
    },
    en: {
      //...commonEn,
      ...En
    }
  },
  silentTranslationWarn: true
};

export function initI18n(VueI18n, moduleConfig) {
  if (Object.keys(moduleConfig).length) {
    for (let key in moduleConfig) {
      config.messages[key][MODULEID] = moduleConfig[key];
    }
  }
  let i18n = new VueI18n(config);
  return i18n;
}

Vue.use(VueI18n);
let i18n = new VueI18n(config);
Vue.prototype.i18n = i18n;
export function $t(value, targetObj) {
  if (Vue.prototype.i18n) { // 解决初始化保存问题
    return Vue.prototype.i18n.t(value, targetObj);
  }
}

export function initRouter(VueRouter, store) {
  //20191128_zqp 修复路由跳转的时候两次push的path地址相同导致的控制台报错
  const originalPush = VueRouter.prototype.push;
  VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err);
  };

  let router = new VueRouter({
    mode: 'hash',
    base: '/' + TENANT + '/' + MODULEID + '.html',
    routes: MENULIST
  });
  const gettingUserInfo = store.dispatch('getUserInfo');
  const gettingModuleList = store.dispatch('getModuleList');
  // 返回的路由(包含所有模块)
  let routerFromPageConfig = sessionStorage.getItem('routerFromPageConfig') ? JSON.parse(sessionStorage.getItem('routerFromPageConfig')) : {};
  let currentModuleFromPageConfig = {}; //当前模块路由记录
  if (routerFromPageConfig && routerFromPageConfig[MODULEID]) {
    currentModuleFromPageConfig = routerFromPageConfig[MODULEID];
  }
  router.beforeEach(async(to, from, next) => {
    let title = to.meta.title ? to.meta.title : to.name || to.path;
    document.title = $t(title);
    let usertoken = utils.getCookie('neatlogic_authorization');
    //如果是租户不存在，进路由前拦截统一外层404
    if (SSOTICKETKEY && SSOTICKETVALUE) {
      usertoken = 'Bearer_' + SSOTICKETVALUE;
    }

    if (!usertoken) {
      if (to.fullPath && to.fullPath != '/') {
        window.location.href = HOME + '/login.html?tenant=' + TENANT + '&redirect=' + MODULEID + '.html#' + to.fullPath;
      } else {
        window.location.href = HOME + '/login.html?tenant=' + TENANT + '&redirect=' + MODULEID + '.html#';
      }
    } else {
      await gettingUserInfo;
      let auth = to.meta ? to.meta.authority : [];
      auth = typeof auth == 'string' ? (auth.trim() ? [auth.trim()] : []) : auth; //字符串转数组，主要是兼容string array两种情况的数据
      if (!auth || !auth.length || utils.checkHasSomeitem(store.getters.userAuthList, auth)) {
        let fromPageList = from.meta.fromPageList; //undefined代表没有来源路由，这时才需要从LocalStorage中加载fromPageList数据
        if (!fromPageList && to.name && to.name.trim() && currentModuleFromPageConfig[to.name]) {
          fromPageList = currentModuleFromPageConfig[to.name];
        }
        if (!fromPageList) {
          fromPageList = [];
        }
        if (!from.meta.clearHistory) {
          if (!from.meta.isSkip) {
            //console.log('#', to.fullPath, from.fullPath);
            const frompath = from.fullPath.replace('&isBack=true', '').replace('?isBack=true', '');
            const topath = to.fullPath.replace('&isBack=true', '').replace('?isBack=true', '');
            //为了支持同页面不同数据之间的跳转，改成了用fullpath判断
            if (from.path != '/' && frompath != topath /*to.name != from.name*/) {
              if (fromPageList.length > 0) {
                //如果历史最后一个页面和要访问的页面path一致，代表需要回退，需要pop掉最后一个fromPage，否则就是正常访问
                if (fromPageList[fromPageList.length - 1].path != to.path) {
                  fromPageList.push({ name: from.name, path: from.path, fullPath: from.fullPath, title: from.meta.title });
                } else {
                  fromPageList.pop();
                }
              } else {
                fromPageList.push({ name: from.name, path: from.path, fullPath: from.fullPath, title: from.meta.title });
              }
            }
            to.meta.fromPageList = fromPageList;
            if (to.name && to.name.trim() && routerFromPageConfig) {
              currentModuleFromPageConfig[to.name] = fromPageList;
              routerFromPageConfig[MODULEID] = currentModuleFromPageConfig;
              sessionStorage.setItem('routerFromPageConfig', JSON.stringify(routerFromPageConfig));
            }
          } else {
            delete from.meta.isSkip;
          }
        } else {
          to.meta.fromPageList = [];
          if (to.name && to.name.trim() && routerFromPageConfig) {
            currentModuleFromPageConfig[to.name] = [];
            routerFromPageConfig[MODULEID] = currentModuleFromPageConfig;
            sessionStorage.setItem('routerFromPageConfig', JSON.stringify(routerFromPageConfig));
          }
        }
        //重置clearHistory参数
        delete to.meta.clearHistory;
        next();
      } else {
        next({ path: '/404', replace: true, query: { des: '无访问权限' } });
      }
    }
  });
  return router;
}


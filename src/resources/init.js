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
  if (Vue.prototype.i18n) {
    // 初始化报错问题
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

  // 返回的路由(包含所有模块)
  let routerFromPageConfig = sessionStorage.getItem('moduleFromPage') ? JSON.parse(sessionStorage.getItem('moduleFromPage')) : {};
  let fromPageList = []; //历史页面记录
  if (routerFromPageConfig && routerFromPageConfig[MODULEID]) {
    fromPageList = routerFromPageConfig[MODULEID];
  }
  // eslint-disable-next-line space-before-function-paren
  router.beforeEach(async (to, from, next) => {
    let title = to.meta.title ? to.meta.title : to.name || to.path;
    document.title = $t(title);
    let usertoken = utils.getCookie('neatlogic_authorization');
    if (store.getters && store.getters.userAuthList && store.getters.userAuthList.length == 0) {
      await store.dispatch('getUserInfo');
      await store.dispatch('getModuleList');
    }
    //如果是租户不存在，进路由前拦截统一外层404
    if ((AUTHTYPE || SSOTICKETKEY) && SSOTICKETVALUE) {
      usertoken = 'Bearer_' + SSOTICKETVALUE;
    }

    if (!usertoken) {
      window.location.href = `${HOME}/login.html?tenant=${TENANT}${HTTP_RESPONSE_STATUS_CODE ? '&httpresponsestatuscode=' + HTTP_RESPONSE_STATUS_CODE : ''}&redirect=${MODULEID}.html#${to.fullPath ? to.fullPath : ''}`;
    } else {
      /**
       * 以下逻辑用语自动生成回退路径：
       * 场景一：正常路由跳转，有完整的to和from
       * 全局维护一个fromPageList,遇到isBack时，找到fromPageList最后一个match的path开始截断。
       * fromPageList同时保存到Localstrage里。每个MODULE一份数据，防止跨模块直接URL访问时出现不可达的fromPage
       *
       *
       * 场景二：刷新页面和直接粘贴URL访问，这是的from的path都是”/“
       * 直接从localstrage调出fromPageList,后续访问使用场景一的处理方式。
       *
       */
      let auth = to.meta ? to.meta.authority : [];
      auth = typeof auth == 'string' ? (auth.trim() ? [auth.trim()] : []) : auth; //字符串转数组，主要是兼容string array两种情况的数据
      if (!auth || !auth.length || utils.checkHasSomeitem(store.getters.userAuthList, auth)) {
        const isBack = !!to.query.isBack;
        //console.log('b', isBack, fromPageList);
        //处理回退请求，从最后匹配的路径开始截断
        //debugger;
        if (isBack) {
          const toFullPath = to.fullPath.replace('&isBack=true', '').replace('?isBack=true', '');
          if (fromPageList.length > 0) {
            if (fromPageList[fromPageList.length - 1].fullPath === toFullPath) {
              fromPageList.splice(fromPageList.length - 1);
              routerFromPageConfig[MODULEID] = fromPageList;
              sessionStorage.setItem('moduleFromPage', JSON.stringify(routerFromPageConfig));
            }
          }
        } else {
          if (!from.meta.clearHistory) {
            if (!from.meta.isSkip) {
              const frompath = from.fullPath.replace('&isBack=true', '').replace('?isBack=true', '');
              const topath = to.fullPath.replace('&isBack=true', '').replace('?isBack=true', '');
              //防止通过浏览器的back到达，判断formPageList最后一个对象是否和当前路径匹配，如果是则按照back处理
              let isBack = false;
              if (fromPageList.length > 0) {
                if (fromPageList[fromPageList.length - 1].fullPath === topath) {
                  fromPageList.splice(fromPageList.length - 1);
                  isBack = true;
                }
              }
              if (!isBack) {
                if (from.path != '/' && frompath != topath) {
                  fromPageList.push({ name: from.name, path: from.path, fullPath: frompath, title: from.meta.title });
                }
              }
              routerFromPageConfig[MODULEID] = fromPageList;
              sessionStorage.setItem('moduleFromPage', JSON.stringify(routerFromPageConfig));
            } else {
              //重置isSkip参数
              delete from.meta.isSkip;
            }
          } else {
            //正常请求，并且需要清除历史记录，一般来自最左侧菜单和最上面菜单进入
            fromPageList = [];
            routerFromPageConfig[MODULEID] = fromPageList;
            sessionStorage.setItem('moduleFromPage', JSON.stringify(routerFromPageConfig));
            //重置clearHistory参数
            delete to.meta.clearHistory;
            delete from.meta.clearHistory; // 解决左侧菜单页面作为详情页面，clearHistory没有清空，导致下榻页面路由数据被清空，返回有问题
          }
        }
        //console.log('a', isBack, fromPageList);
        //console.log(to, JSON.stringify(fromPageList, null, 2));
        next();
      } else {
        next({ path: '/no-authority', replace: true, query: { des: '无访问权限' } });
      }
    }
  });
  return router;
}

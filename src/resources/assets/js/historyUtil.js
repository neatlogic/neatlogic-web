const HistoryUtil = {};
const Storage = sessionStorage.getItem('routeStorage') ? JSON.parse(sessionStorage.getItem('routeStorage')) : {};
import { $t } from '@/resources/init.js';

HistoryUtil.install = function (Vue, options) {
  //判断当前页面是否需要active左侧菜单
  Vue.prototype.$isMenuActive = function (url) {
    //处理掉isBack的两种情况：?isBack=true|&isBack=true
    let path = this.$route.fullPath;
    path = path.replace('&isBack=true', '');
    path = path.replace('?isBack=true', '');

    if (url === path) {
      return true;
    }
    const fromPageList = this.$route.meta.fromPageList;

    if (fromPageList && fromPageList.length > 0) {
      for (let i = 0; i < fromPageList.length; i++) {
        const fromRoute = fromPageList[i];
        let fpath = fromRoute.fullPath;
        fpath = fpath.replace('&isBack=true', '');
        fpath = fpath.replace('?isBack=true', '');
        if (url === fpath) {
          return true;
        }
      }
    }
    return false;
  };
  Vue.prototype.$hasBack = function () {
    return !!(this.$route.meta.fromPageList && this.$route.meta.fromPageList.length > 0 && this.$route.meta.fromPageList.filter(d => d.path !== this.$route.path).length > 0);
  };
  Vue.prototype.$back = function (defaultPath) {
    const fromPageList = this.$route.meta.fromPageList;
    let backPath = defaultPath;
    let index = fromPageList?.length - 1;
    if (fromPageList && fromPageList.length > 0) {
      while (index >= 0) {
        if (this.$route.path != fromPageList[index].path) {
          backPath = fromPageList[index].fullPath;
          break;
        }
        index -= 1;
      }
    }
    //const backPath = this.$route.meta.fromPage && this.$route.meta.fromPage.path && this.$route.meta.fromPage.path != '/' ? this.$route.meta.fromPage.path : defaultPath;
    if (backPath) {
      this.$router.push({
        path: backPath,
        query: { isBack: true }
      });
    }
  };
  //从本路由跳出时不把当前路由放入历史记录，仅生效一次
  Vue.prototype.$skipHistory = function () {
    this.$route.meta.isSkip = true;
  };
  Vue.prototype.$backTo = function (defaultPath) {
    this.$router.push({
      path: defaultPath,
      query: { isBack: true }
    });
  };
  Vue.prototype.$getFromPage = function (defaultName, aliasName) {
    let name = defaultName;
    let hasBack = false;
    const fromPageList = this.$route.meta.fromPageList;
    let index = fromPageList?.length - 1;
    if (fromPageList && fromPageList.length > 0) {
      while (index >= 0) {
        if (this.$route.path != fromPageList[index].path) {
          name = fromPageList[index].title;
          hasBack = true;
          break;
        }
        index -= 1;
      }
    }
    if (hasBack && aliasName) {
      //有回退历史却设置了别名，则直接使用别名
      name = aliasName;
    }
    return $t(name);
  };
  Vue.prototype.$setHistory = function (historyData) {
    if (historyData && this.$vnode && this.$vnode.tag) {
      Storage[this.$vnode.tag] = historyData;
      sessionStorage.setItem('routeStorage', JSON.stringify(Storage));
    }
  };
  Vue.prototype.$addHistoryData = function (key, value) {
    if (key && this.$vnode && this.$vnode.tag) {
      if (!Storage[this.$vnode.tag]) {
        Storage[this.$vnode.tag] = {};
      }
      Storage[this.$vnode.tag][key] = value;
      sessionStorage.setItem('routeStorage', JSON.stringify(Storage));
    }
  };
  Vue.prototype.$isBack = function () {
    return !!this.$route.query['isBack'];
  };
  Vue.mixin({
    created: function () {
      if (this.$vnode && this.$vnode.tag && this.restoreHistory && typeof this.restoreHistory == 'function' && (this.$route.params['isBack'] || this.$route.query['isBack'])) {
        let historyData = Storage[this.$vnode.tag];
        if (historyData) {
          try {
            this.restoreHistory(historyData);
          } catch (e) {
            console.error(e);
          }
        }
      } else if (this.$vnode && this.$vnode.tag) {
        delete Storage[this.$vnode.tag];
        sessionStorage.setItem('routeStorage', JSON.stringify(Storage));
      }
    }
  });
};
export default HistoryUtil;

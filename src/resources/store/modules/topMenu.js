import menuApi from '@/resources/api/common';

const state = {
  moduleList: [], //所有的模块及其描述、菜单、默认页等
  gettingModuleList: new Promise(() => {}), //模块列表获取状态
  dynamicMenu: {},
  gettingCmdbMenu: new Promise(() => {})
};

const getters = {
  // 默认模块对象
  defaultModule(state) {
    return state.moduleList.find(module => module.isDefault === 1) || { moduleId: 'index' };
  },
  // 当前页面所属模块
  currentModule(state) {
    return state.moduleList.find(module => module.moduleId === MODULEID) || { moduleId: 'index' };
  }
};

const mutations = {
  // 设置模块列表
  setModuleList(state, moduleList = []) {
    state.moduleList = moduleList;
    localStorage.setItem('moduleList', JSON.stringify(state.moduleList));
  },
  updateMenu(state, { module, newMenuGroup, startIndex }) {
    const oldMenuGroup = state.dynamicMenu[module.moduleId] || [];
    const index = startIndex < 0 ? module.menuGroupList.length + startIndex : startIndex;
    module.menuGroupList.splice(index, oldMenuGroup.length, ...newMenuGroup);
    state.moduleList = [...state.moduleList];
    state.dynamicMenu = {
      ...state.dynamicMenu,
      [module.moduleId]: newMenuGroup
    };
  }
};

const actions = {
  // 获取模块列表
  async getModuleList({ commit, state }) {
    const routerConfig = getRouterConfig();
    const menuConfigList = getAllMenuTypeList();
    let moduleList = [];
    state.gettingModuleList = menuApi.getModuleList();
    const res = await state.gettingModuleList;
    let showModuleList = null; //可以显示的模块，如果不是单独命令行的就默认null全部需要展示，如果有单独配置的获取配置
    if (process.env.VUE_APP_PAGE_LIST && JSON.parse(process.env.VUE_APP_PAGE_LIST)) {
      //如果是指定编译模块的，要过滤掉不在模块列表里的
      showModuleList = JSON.parse(process.env.VUE_APP_PAGE_LIST);
    }
    res.Return.forEach(moduleGroup => {
      try {
        let { group: moduleId, groupName: moduleName, authList = [], description, isDefault, defaultPage } = moduleGroup;
        if (!description || !description.trim()) {
          description = `${moduleName}平台`;
        }
        const authorizedMenuList = getMenuList(routerConfig[moduleId], authList, moduleId);
        const menuGroupList = sortMenuList(authorizedMenuList, moduleId, menuConfigList);
        if (routerConfig[moduleId]) {
          const hasAuthorizedDynamicMenu = routerConfig[moduleId].some(route => route.meta && route.meta.istitle && authList.length > 0);
          if (((hasAuthorizedDynamicMenu || authorizedMenuList.length > 0) && !showModuleList) || (showModuleList && (hasAuthorizedDynamicMenu || authorizedMenuList.length > 0) && showModuleList.indexOf(moduleId) > -1 && authList.length > 0)) {
            //有权限菜单的模块才让显示
            moduleList.push({ moduleId, moduleName, menuGroupList, description, isDefault, defaultPage });
          }
        }
      } catch (e) {
        console.log(moduleGroup.groupName + '模块加载异常，' + e);
      }
    });
    commit('setModuleList', moduleList);
    return res;
  },

  // 更新模块菜单
  updateMenu({ dispatch }, { forceUpdate = false } = {}) {
    dispatch('updateProcessMenu', { forceUpdate });
    dispatch('updateKnowledgeMenu', { forceUpdate });
    dispatch('updateDashboardMenu', { forceUpdate });
    dispatch('updateReportMenu', { forceUpdate });
    dispatch('updateCmdbMenu', { forceUpdate });
    dispatch('updateInspectMenu', { forceUpdate }); // 巡检结果
  },

  // process
  async updateProcessMenu({ commit, state, rootState }, { forceUpdate = true } = {}) {
    await state.gettingModuleList;
    const processModule = state.moduleList.find(item => item.moduleId === 'process');
    if (!processModule) return;
    if (!forceUpdate && state.dynamicMenu.hasOwnProperty('process')) return;
    const res = await menuApi.updateProcessMenu({ isAll: 0 });
    if (!res.Return || !res.Return.workcenterList || res.Return.workcenterList.length === 0) return;
    const processType = res.Return.workcenterList.map(type => ({
      name: type.name,
      path: `/task-overview-${type.uuid}`,
      url: `/task-overview-${type.uuid}`,
      icon: 'tsfont-task'
    }));
    const newMenuGroup = [
      {
        menuTypeName: '工单中心',
        menuList: processType
      }
    ];
    commit('updateMenu', { module: processModule, startIndex: 0, newMenuGroup });
    return res;
  },
  // knowledge
  async updateKnowledgeMenu({ commit, state, rootState }, { forceUpdate = true } = {}) {
    await state.gettingModuleList;
    const knowledgeModule = state.moduleList.find(item => item.moduleId === 'knowledge');
    if (!knowledgeModule) return;
    if (!forceUpdate && state.dynamicMenu.hasOwnProperty('knowledge')) return;
    const res = await menuApi.updateKnowledgeMenu();
    if (!res.Return || res.Return.length === 0) return;
    const knowledgeType = res.Return.map(type => ({
      name: type.text,
      path: `/knowledge-overview-${type.value}`,
      icon: 'tsfont-book'
    }));
    const newMenuGroup = [
      {
        menuTypeName: '知识分类',
        menuList: knowledgeType
      }
    ];
    commit('updateMenu', { module: knowledgeModule, startIndex: 0, newMenuGroup });
    return res;
  },

  // dashboard
  async updateDashboardMenu({ commit, state, rootState }, { forceUpdate = true } = {}) {
    await state.gettingModuleList;
    const dashboardModule = state.moduleList.find(item => item.moduleId === 'dashboard');
    if (!dashboardModule) return;
    if (!forceUpdate && state.dynamicMenu.hasOwnProperty('dashboard')) {
      return;
    }
    const res = await menuApi.updateDashboardMenu({ limit: 6 });
    if (!res.Return.tbodyList || res.Return.tbodyList.length === 0) {
      return;
    }
    const topVisit = res.Return.tbodyList.map(item => ({
      name: item.name,
      path: '/dashboard-detail/' + item.id,
      icon: 'tsfont-type'
    }));
    const newMenuGroup = [
      {
        menuTypeName: '仪表板列表',
        menuList: topVisit
      }
    ];
    commit('updateMenu', { module: dashboardModule, startIndex: -1, newMenuGroup });
    return res;
  },

  // report
  async updateReportMenu({ commit, state, rootState }, { forceUpdate = true } = {}) {
    await state.gettingModuleList;
    const reportModule = state.moduleList.find(item => item.moduleId === 'report');
    if (!reportModule) return;
    if (!forceUpdate && state.dynamicMenu.hasOwnProperty('report')) return;
    const res = await menuApi.updateReportMenu({ pageSize: 6 });
    if (res.Return.tbodyList.length === 0) return;
    const reportInstanceList = res.Return.tbodyList.map(item => ({
      name: item.name,
      path: '/reportinstance-show/' + item.id,
      icon: 'tsfont-report'
    }));
    const newMenuGroup = [
      {
        menuTypeName: '报表',
        menuList: reportInstanceList
      }
    ];
    commit('updateMenu', { module: reportModule, startIndex: 0, newMenuGroup });
    return res;
  },

  // cmdb
  async updateCmdbMenu({ commit, state, rootState }, { forceUpdate = true } = {}) {
    await state.gettingModuleList;
    const cmdbModule = state.moduleList.find(item => item.moduleId === 'cmdb');
    if (!cmdbModule) return;
    if (!forceUpdate && state.dynamicMenu.hasOwnProperty('cmdb')) return;
    state.gettingCmdbMenu = menuApi.updateCmdbMenu();
    const res = await state.gettingCmdbMenu;
    if (res.Return.length === 0) return;
    let newMenuGroup = [];
    for (let citype of res.Return) {
      if (!citype.isMenu) continue;
      let menuList = [];
      for (let ci of citype.ciList) {
        if (!ci.isMenu) continue;
        menuList.push({
          id: ci.id,
          name: ci.label,
          path: '/ci-view/' + ci.id,
          url: '/ci-view/' + ci.id, //兼容全局跳转方法
          icon: ci.icon
        });
      }
      if (menuList.length === 0) continue;
      newMenuGroup.push({
        menuTypeName: citype.name,
        menuList
      });
    }
    commit('updateMenu', { module: cmdbModule, startIndex: 0, newMenuGroup });
    return res;
  },
  // inspect(巡检)
  async updateInspectMenu({ commit, state, rootState }, { forceUpdate = true } = {}) {
    // 巡检结果，需要拿到自定义菜单+巡检结果分类下的其他菜单
    await state.gettingModuleList;
    const inspectModule = state.moduleList.find(item => item.moduleId === 'inspect');
    if (!inspectModule) return;
    if (!forceUpdate && state.dynamicMenu.hasOwnProperty('inspect')) return;
    const res = await menuApi.updateInspectMenu();
    let recentIssuesRouteList = []; // 最新问题路由列表
    if (res.Return && res.Return.length > 0) {
      recentIssuesRouteList = res.Return.map(type => ({
        name: type.name,
        path: `/recent-issues-${type.id}`,
        url: `/recent-issues-${type.id}`,
        icon: 'tsfont-baobiao'
      }));
    }
    const firstRouteList = []; // 巡检结果分类，排在第一个路由
    const otherRouteList = []; // 巡检结果分类，其他路由列表
    const routerConfig = getRouterConfig();
    const inspectRouterList = routerConfig['inspect'];
    if (inspectRouterList && inspectRouterList.length > 0) {
      inspectRouterList.forEach(item => {
        if (item && item.hasOwnProperty('meta')) {
          if (item.meta && item.meta.type == 'inspectResult') {
            if (item.meta.sort && item.meta.sort == 1) {
              // 排在第一个
              let recentIssuesPath = item.path ? (item.path.split(':') ? item.path.split(':')[0] : '/') : '/'; // 处理特殊
              firstRouteList.push({
                name: item.meta.title,
                path: recentIssuesPath,
                url: recentIssuesPath,
                icon: item.meta.icon
              });
            } else {
              // 其他路由
              otherRouteList.push({
                name: item.meta.title,
                path: item.path,
                url: item.path,
                icon: item.meta.icon
              });
            }
          }
        }
      });
    }
    const newMenuGroup = [
      {
        menuTypeName: '巡检结果',
        menuList: [...firstRouteList, ...recentIssuesRouteList, ...otherRouteList]
      }
    ];
    commit('updateMenu', { module: inspectModule, startIndex: 0, newMenuGroup });
    return res;
  }
};

function getRouterConfig() {
  let routerConfig = {};
  let routerPathList = [require.context('@/views/pages', true, /router.js$/)];
  try {
    routerPathList.push(require.context('commercial-module', true, /router.js$/));
  } catch (error) {
    // 模块找不到
  }
  routerPathList.forEach(item => {
    if (item && item.keys()) {
      item.keys().forEach(routerPath => {
        const moduleNames = routerPath.split('/')[1];
        const lastValue = moduleNames.split('-');
        const moduleName = lastValue?.pop() || moduleNames;
        const routeList = item(routerPath).default || [];
        routerConfig[moduleName] = routeList;
      });
    }
  });
  return routerConfig;
}
function getAllMenuTypeList() {
  // 获取菜单分类名称
  let menuTypeList = [];
  const configPathList = [require.context('@/views/pages', true, /config.js$/)];
  try {
    configPathList.push(require.context('commercial-module', true, /config.js$/));
  } catch (error) {
    //
  }
  configPathList.forEach(configItem => {
    configItem.keys().forEach(pathItem => {
      const pathConfig = configItem(pathItem);
      if (pathConfig && pathConfig.config) {
        menuTypeList.push(pathConfig.config);
      }
    });
  });
  return menuTypeList;
}
function getMenuTypeList(module, list) {
  let menuType = {};
  if (list && list.length) {
    let currentConfig = list.find(l => l.module == module);
    if (currentConfig) {
      menuType = currentConfig.menuType || {};
    }
  }
  return menuType;
}
function isAuthMenu(route, authList = []) {
  if (route.meta && route.meta.ismenu) {
    if (!route.meta.authority || !route.meta.authority.length) {
      return true;
    } else if (
      typeof route.meta.authority == 'string' &&
      authList.some(auth => {
        return route.meta.authority === auth.name;
      })
    ) {
      return true;
    } else if (typeof route.meta.authority == 'object') {
      let isSame = authList.filter(a => {
        let repeatItem = route.meta.authority.indexOf(a.name) > -1;
        return repeatItem;
      });
      if (isSame && isSame.length) {
        return true;
      }
    }
  }
  return false;
}

function hasAuthNoMenu(route, authList = []) {
  // 有权限自定义详情页菜单
  if (
    route.meta &&
    typeof route.meta.authority == 'string' &&
    authList.some(auth => {
      return route.meta.authority === auth.name;
    })
  ) {
    return true;
  } else if (route.meta && typeof route.meta.authority == 'object') {
    let isSame = authList.filter(a => {
      let repeatItem = route.meta.authority.indexOf(a.name) > -1;
      return repeatItem;
    });
    if (isSame && isSame.length) {
      return true;
    }
  }
  return false;
}

function getMenuList(routeList = [], authList, moduleId) {
  let moduleIdList = ['dashboard'];
  const menuList = [];
  routeList.forEach(route => {
    if (isAuthMenu(route, authList)) {
      menuList.push(route);
    } else if (moduleId && moduleIdList.includes(moduleId) && hasAuthNoMenu(route, authList)) {
      menuList.push({ path: route.path, meta: { title: '', icon: '' } }); // 解决权限并且自定义菜单不显示问题
    }
  });
  return menuList;
}

function sortMenuList(menuList, module, configList) {
  const menuGroupList = [];
  let currentMenuGroup;
  let typeConfig = getMenuTypeList(module, configList) || null;
  menuList.forEach(menu => {
    const {
      path: path,
      meta: { title: name, icon: icon, istitle: istitle, type }
    } = menu;
    let typeName = typeConfig && Object.keys(typeConfig).length && typeConfig[type] ? typeConfig[type] : null;
    currentMenuGroup = menuGroupList.find(menuGroup => menuGroup.menuType === type);
    if (!currentMenuGroup) {
      currentMenuGroup = { menuTypeName: typeName, menuList: [], menuType: type };
      menuGroupList.push(currentMenuGroup);
    }
    currentMenuGroup.menuList.push({ name, path, icon, istitle });
  });
  return menuGroupList;
}

export default {
  state,
  getters,
  actions,
  mutations
};

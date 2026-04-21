import ComponentManager from '@/resources/import/component-manager.js';

function collect(contexts = []) {
  const config = {};
  contexts.forEach(ctx => {
    if (ctx && ctx.keys) {
      ctx.keys().forEach(p => {
        const names = p.split('/')[1];
        const moduleName = names.split('-').pop() || names;
        const list = ctx(p).default || [];
        config[moduleName] = list;
      });
    }
  });
  return config;
}

function mergeModuleRoutes(base = [], extra = []) {
  const nameSet = new Set(base.map(r => r && r.name));
  const pathSet = new Set(base.map(r => r && r.path));
  const filtered = Array.isArray(extra) ? extra.filter(r => {
    const hasName = r && r.name && nameSet.has(r.name);
    const hasPath = r && r.path && pathSet.has(r.path);
    return !(hasName || hasPath);
  }) : [];
  return [...base, ...filtered];
}

function mergeMenuTypeConfig(base = {}, extra = {}) {
  return {
    module: extra.module || base.module,
    menuType: {
      ...(base.menuType || {}),
      ...(extra.menuType || {})
    }
  };
}

export function getRouterConfig() {
  const contexts = [require.context('@/views/pages', true, /router.js$/)];
  let config = collect(contexts);
  let extContexts = [];
  try {
    extContexts = [
      require.context('@/commercial-module', true, /router.js$/),
      require.context('@/community-module', true, /router.js$/)
    ];
  } catch (e) {
    extContexts = [];
  }
  const extConfig = collect(extContexts);
  Object.keys(extConfig).forEach(key => {
    if (!config[key]) {
      config[key] = extConfig[key];
    }
  });
  Object.keys(config).forEach(key => {
    const base = Array.isArray(config[key]) ? config[key] : [];
    const extra = ComponentManager.getRouterComponent(key) || [];
    config[key] = mergeModuleRoutes(base, extra);
  });
  return config;
}

export function getModuleRoutes(moduleName) {
  const config = getRouterConfig();
  return config[moduleName] || [];
}

export function buildMergedRoutes(moduleName, routers = [], commonRouters = []) {
  const base = [...(Array.isArray(commonRouters) ? commonRouters : []), ...(Array.isArray(routers) ? routers : [])];
  const extra = ComponentManager.getRouterComponent(moduleName) || [];
  return mergeModuleRoutes(base, extra);
}

export function buildMergedMenuType(moduleName, baseConfig = {}) {
  const extraConfig = ComponentManager.getMenuTypeConfig(moduleName) || {};
  return {
    ...(baseConfig.menuType || {}),
    ...(extraConfig.menuType || {})
  };
}

export function geRouterMenuTypeList() {
  // 获取菜单分类名称
  const menuTypeMap = {};
  const configPathList = [require.context('@/views/pages', true, /config.js$/)];
  try {
    configPathList.push(require.context('@/commercial-module', true, /config.js$/));
    configPathList.push(require.context('@/community-module', true, /config.js$/));
  } catch (error) {
    //
  }
  configPathList.forEach(configItem => {
    configItem.keys().forEach(pathItem => {
      const pathConfig = configItem(pathItem);
      if (pathConfig && pathConfig.config) {
        const currentConfig = pathConfig.config;
        const moduleName = currentConfig.module;
        if (!moduleName) {
          return;
        }
        menuTypeMap[moduleName] = mergeMenuTypeConfig(menuTypeMap[moduleName] || { module: moduleName }, currentConfig);
      }
    });
  });
  const extraMenuTypeConfig = ComponentManager.getMenuTypeConfig() || {};
  Object.keys(extraMenuTypeConfig).forEach(moduleName => {
    menuTypeMap[moduleName] = mergeMenuTypeConfig(menuTypeMap[moduleName] || { module: moduleName }, {
      module: moduleName,
      menuType: extraMenuTypeConfig[moduleName].menuType || {}
    });
  });
  return Object.keys(menuTypeMap).map(moduleName => menuTypeMap[moduleName]);
}


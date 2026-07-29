const GLOBAL_SCOPE = 'global';
const MODULE_SCOPE = 'module';
const providerContributionList = [];
const definitionMapCache = new WeakMap();
const conflictWarningSet = new Set();

function getProviderSourcePriority(sourceKey) {
  if (sourceKey.includes('/views/components/portal/providers/common/')) {
    return 0;
  }
  if (sourceKey.includes('/views/pages/')) {
    return 10;
  }
  if (sourceKey.includes('/community-module/')) {
    return 20;
  }
  if (sourceKey.includes('/commercial-module/')) {
    return 30;
  }
  return 40;
}

function registerProvider(provider, sourceKey = '') {
  if (!provider || !provider.moduleGroup) {
    return;
  }
  const providerId = provider.providerId || sourceKey || `${provider.moduleGroup}:${providerContributionList.length}`;
  if (providerContributionList.some(item => item.providerId === providerId)) {
    return;
  }
  providerContributionList.push({
    scopes: [GLOBAL_SCOPE],
    widgetList: [],
    ...provider,
    providerId,
    sourcePriority: getProviderSourcePriority(sourceKey),
    registerOrder: providerContributionList.length
  });
}

function loadProviderContext(context) {
  context.keys()
    .sort((a, b) => getProviderSourcePriority(a) - getProviderSourcePriority(b) || a.localeCompare(b))
    .forEach(key => {
      const providerModule = context(key);
      registerProvider(providerModule.default || providerModule, key);
    });
}

loadProviderContext(require.context('@/', true, /(?:workbench|portal\/providers\/common)\/provider\.js$/));

function isProviderAvailable(provider, moduleList) {
  if (provider.moduleGroup === 'common') {
    return true;
  }
  return (moduleList || []).some(module => {
    return module.moduleId === provider.moduleGroup && module.isDisabled !== 1;
  });
}

function normalizeDefinition(provider, definition, index) {
  const group = definition.group || {};
  const presentation = { ...(definition.presentation || {}) };
  delete presentation.previewData;
  delete presentation.useCaseList;
  const name = definition.name || '';
  let categoryLabel = group.label || provider.moduleName;
  if (provider.moduleName && categoryLabel.indexOf(provider.moduleName) === 0) {
    categoryLabel = categoryLabel
      .slice(provider.moduleName.length)
      .replace(/^[\s·•/|｜—-]+/, '');
  }
  const category = {
    name: group.name || `${provider.moduleGroup}.default`,
    label: categoryLabel || '其他组件',
    sort: group.sort === undefined ? index : group.sort
  };
  return {
    version: 1,
    icon: 'tsfont-component',
    scopes: provider.scopes,
    ownerModule: provider.moduleGroup,
    ownerModuleName: provider.moduleName,
    sort: index,
    ...definition,
    dataSource: definition.dataSource || (definition.dataMode === 'mock' ? 'mock' : 'api'),
    presentation: {
      type: 'list',
      isRecommended: false,
      ...presentation
    },
    name,
    category,
    // 保留 group 字段兼容已有授权接口；编辑器使用 ownerModule + category 构建两级组件库。
    group: category
  };
}

export function mergeWorkbenchProviderContributions(contributionList = [], scope = GLOBAL_SCOPE) {
  const providerMap = new Map();
  contributionList
    .slice()
    .sort((a, b) => (a.sourcePriority || 0) - (b.sourcePriority || 0) || (a.registerOrder || 0) - (b.registerOrder || 0))
    .forEach(provider => {
      if (!providerMap.has(provider.moduleGroup)) {
        providerMap.set(provider.moduleGroup, {
          ...provider,
          scopes: [scope],
          widgetList: [],
          providerIdList: []
        });
      }
      const mergedProvider = providerMap.get(provider.moduleGroup);
      mergedProvider.providerIdList.push(provider.providerId);
      (provider.widgetList || []).forEach(definition => {
        mergedProvider.widgetList.push({
          ...definition,
          scopes: definition.scopes || provider.scopes
        });
      });
    });
  return Array.from(providerMap.values());
}

export function getWorkbenchProviderList({ scope = GLOBAL_SCOPE, targetModuleGroup = '', moduleList = [] } = {}) {
  const availableContributionList = providerContributionList.filter(provider => {
    if (!provider.scopes.includes(scope) || !isProviderAvailable(provider, moduleList)) {
      return false;
    }
    if (scope === MODULE_SCOPE && targetModuleGroup) {
      return provider.moduleGroup === 'common' || provider.moduleGroup === targetModuleGroup;
    }
    return true;
  });
  const availableProviderList = mergeWorkbenchProviderContributions(availableContributionList, scope);
  if (scope === MODULE_SCOPE && targetModuleGroup) {
    return availableProviderList.sort((a, b) => {
      const getProviderSort = provider => provider.moduleGroup === targetModuleGroup ? 0 : 1;
      return getProviderSort(a) - getProviderSort(b);
    });
  }
  return availableProviderList;
}

export function getWorkbenchScopeList({ moduleList = [] } = {}) {
  const moduleScopeList = getWorkbenchProviderList({
    scope: MODULE_SCOPE,
    moduleList
  })
    .filter(provider => provider.moduleGroup !== 'common')
    .map(provider => ({
      moduleGroup: provider.moduleGroup,
      label: provider.moduleName,
      icon: 'tsfont-module',
      description: `配置${provider.moduleName}模块自己的工作台模板`
    }));
  return [
    {
      moduleGroup: 'index',
      label: '总工作台',
      icon: 'tsfont-m-dashboard',
      description: '配置整个系统首页，可组合所有已安装模块的组件'
    },
    ...moduleScopeList
  ];
}

export function normalizeWorkbenchModuleGroup(moduleGroup, scopeList = []) {
  const targetModuleGroup = moduleGroup || 'index';
  return scopeList.some(scope => scope.moduleGroup === targetModuleGroup)
    ? targetModuleGroup
    : 'index';
}

export function getWorkbenchWidgetDefinitions({ scope = GLOBAL_SCOPE, targetModuleGroup = '', moduleList = [] } = {}) {
  const nameSet = new Set();
  const definitionList = [];
  getWorkbenchProviderList({ scope, targetModuleGroup, moduleList }).forEach(provider => {
    (provider.widgetList || []).forEach((definition, index) => {
      if (definition.scopes && !definition.scopes.includes(scope)) {
        return;
      }
      const normalizedDefinition = normalizeDefinition(provider, definition, index);
      if (!normalizedDefinition.name || nameSet.has(normalizedDefinition.name)) {
        if (
          normalizedDefinition.name &&
          nameSet.has(normalizedDefinition.name) &&
          process.env.NODE_ENV !== 'production' &&
          !conflictWarningSet.has(normalizedDefinition.name)
        ) {
          conflictWarningSet.add(normalizedDefinition.name);
          console.warn(`[workbench] 组件名称冲突，保留先注册定义：${normalizedDefinition.name}`);
        }
        return;
      }
      if (scope === MODULE_SCOPE && provider.moduleGroup === 'common' && definition.moduleSafe !== true) {
        return;
      }
      if (scope === MODULE_SCOPE && provider.moduleGroup === 'common') {
        normalizedDefinition.group = {
          ...normalizedDefinition.group,
          sort: 9000 + normalizedDefinition.group.sort
        };
      }
      nameSet.add(normalizedDefinition.name);
      definitionList.push(normalizedDefinition);
    });
  });
  return definitionList;
}

export function createWorkbenchWidgetDefinitionMap(definitionList = []) {
  if (Array.isArray(definitionList) && definitionMapCache.has(definitionList)) {
    return definitionMapCache.get(definitionList);
  }
  const definitionMap = new Map();
  definitionList.forEach(definition => {
    if (!definition || !definition.name) {
      return;
    }
    definitionMap.set(definition.name, definition);
  });
  if (Array.isArray(definitionList)) {
    definitionMapCache.set(definitionList, definitionMap);
  }
  return definitionMap;
}

export function migrateWorkbenchWidget(widget, definition) {
  if (!widget || !definition) {
    return widget;
  }
  const targetVersion = Number(definition.version) || 1;
  const sourceVersion = Number(widget.configVersion) || 1;
  let config = {
    ...(definition.config || {}),
    ...(widget.config || {})
  };
  if (sourceVersion < targetVersion && typeof definition.migrateConfig === 'function') {
    config = definition.migrateConfig(config, sourceVersion, targetVersion) || config;
  }
  return {
    ...widget,
    configVersion: targetVersion,
    config
  };
}

export function createFrontendAvailableWidgetList(definitionList = []) {
  return definitionList.map(definition => ({
    name: definition.name,
    label: definition.label,
    description: definition.description,
    group: definition.group,
    category: definition.category,
    sort: definition.sort,
    ownerModule: definition.ownerModule,
    ownerModuleName: definition.ownerModuleName,
    dataSource: definition.dataSource,
    presentation: definition.presentation
  }));
}

function isBackendWidgetAvailable(widget) {
  const hasOwn = key => Object.prototype.hasOwnProperty.call(widget, key);
  if (hasOwn('isAvailable')) {
    return widget.isAvailable !== 0 && widget.isAvailable !== '0' && widget.isAvailable !== false;
  }
  if (hasOwn('hasAuthority')) {
    return widget.hasAuthority !== 0 && widget.hasAuthority !== '0' && widget.hasAuthority !== false;
  }
  if (hasOwn('isDisabled')) {
    return widget.isDisabled !== 1 && widget.isDisabled !== '1' && widget.isDisabled !== true;
  }
  if (hasOwn('isActive')) {
    return widget.isActive !== 0 && widget.isActive !== '0' && widget.isActive !== false;
  }
  // hasauthority 接口通常只返回当前用户可用组件，未携带状态时即视为可用。
  return true;
}

export function mergeAuthorizedWorkbenchWidgetList(frontendList = [], apiList = []) {
  const apiMap = new Map();
  apiList.forEach(widget => {
    if (widget && widget.name && !apiMap.has(widget.name)) {
      apiMap.set(widget.name, widget);
    }
  });
  return frontendList.reduce((result, definition) => {
    const backendWidget = apiMap.get(definition.name);
    // 接口成功时以后端返回范围为准；未返回不等于未授权，不在组件库中展示。
    if (!backendWidget) {
      return result;
    }
    const isAvailable = isBackendWidgetAvailable(backendWidget);
    result.push({
      ...definition,
      ...backendWidget,
      isAvailable: isAvailable ? 1 : 0,
      unavailableReason: isAvailable
        ? ''
        : (backendWidget.unavailableReason || backendWidget.disabledReason || backendWidget.reason || '后台返回不可用状态')
    });
    return result;
  }, []);
}

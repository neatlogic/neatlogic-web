import ComponentManager from '@/resources/import/component-manager.js';

// CMDB 核心只维护内置属性；可选模块通过 ComponentManager 注入自己的属性处理组件。
// 每次按需读取注册表，避免模块加载顺序导致动态组件拿到旧快照。
const HANDLER_CATEGORY_MAP = {
  input: 'cmdbAttrHandlerInput',
  search: 'cmdbAttrHandlerSearch',
  view: 'cmdbAttrHandlerView',
  config: 'cmdbAttrHandlerConfig'
};

export function getAttrHandlerComponentMap(type, coreHandlerMap = {}) {
  const extensionMap = ComponentManager.getComponent(HANDLER_CATEGORY_MAP[type]) || {};
  return {
    ...coreHandlerMap,
    ...extensionMap
  };
}

export function mergeAttrTypeList(attrTypeList = []) {
  const extensionList = ComponentManager.getComponent('cmdbAttrType') || [];
  const attrTypeMap = new Map();
  attrTypeList.forEach(item => {
    if (item && item.name) {
      attrTypeMap.set(item.name, { ...item });
    }
  });
  (Array.isArray(extensionList) ? extensionList : []).forEach(item => {
    if (!item || !item.name) {
      return;
    }
    const backendItem = attrTypeMap.get(item.name) || {};
    attrTypeMap.set(item.name, {
      ...item,
      // 后端若返回同名类型，展示名和能力字段都以后端为准；扩展侧只在后端未返回时兜底。
      ...backendItem
    });
  });
  return Array.from(attrTypeMap.values());
}

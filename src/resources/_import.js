let FLOW_DISPATCHER_COMPONENT = {}; // 流程分派器组件
let FLOW_DISPATCHER_VALID = {}; // 流程分派器校验

try {
  // 导入自定义组件
  const requireImport = require.context('@', true, /import.js$/);
  requireImport.keys().forEach(path => {
    const importedModule = requireImport(path);
    if (importedModule.FLOW_DISPATCHER_COMPONENT) {
      // 分派器组件
      Object.assign(FLOW_DISPATCHER_COMPONENT, importedModule.FLOW_DISPATCHER_COMPONENT);
    }
    if (importedModule.FLOW_DISPATCHER_VALID) {
      // 分派器校验
      Object.assign(FLOW_DISPATCHER_VALID, importedModule.FLOW_DISPATCHER_VALID);
    }
  });
} catch (error) {
  console.error('import.js导入异常', error);
}

export { FLOW_DISPATCHER_COMPONENT, FLOW_DISPATCHER_VALID };

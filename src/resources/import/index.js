let FLOW_DISPATCHER_COMPONENT = {}; // 流程分派器组件
let FLOW_DISPATCHER_VALID = {}; // 流程分派器校验
let FLOW_NODE_VALID = {}; // 流程节点校验
let FLOW_LINE_VALID = {}; // 流程节点连接线校验

try {
  // 导入自定义组件
  const requireImport = require.context('@/', true, /import.js$/);
  // 合并模块属性到对应目标对象的函数
  const mergeModuleProperties = (targetObj, module, ...props) => {
    props.forEach(prop => {
      if (module[prop]) {
        Object.assign(targetObj, module[prop]);
      }
    });
  };
  // 目标对象列表及其对应的模块属性
  const targets = [
    { target: FLOW_DISPATCHER_COMPONENT, props: ['FLOW_DISPATCHER_COMPONENT'] },
    { target: FLOW_DISPATCHER_VALID, props: ['FLOW_DISPATCHER_VALID'] },
    { target: FLOW_NODE_VALID, props: ['FLOW_NODE_VALID'] },
    { target: FLOW_LINE_VALID, props: ['FLOW_LINE_VALID'] }
  ];

  requireImport.keys().forEach(path => {
    const importedModule = requireImport(path);
    targets.forEach(target => {
      mergeModuleProperties(target.target, importedModule, ...target.props);
    });
  });
} catch (error) {
  console.error('导入模块异常 "import.js" modules:', error.stack);
}

export { FLOW_DISPATCHER_COMPONENT, FLOW_DISPATCHER_VALID, FLOW_LINE_VALID, FLOW_NODE_VALID };

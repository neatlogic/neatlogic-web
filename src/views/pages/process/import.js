import dispatcherValid from '@/views/pages/process/flow/flowedit/components/nodesetting/dispatcher/dispatcher-valid.js';
import { nodeValidConfig, lineValidConfig } from '@/views/pages/process/flow/flowedit/components/autoexec/flow-node-valid.js';
import { nodeValidConfig as createjobNodeValid } from '@/views/pages/process/flow/flowedit/components/createjob/flow-node-valid.js';

// 流程分派器
let FLOW_DISPATCHER_COMPONENT = {};
let FLOW_DISPATCHER_VALID = {
  // 分派器校验
  ...dispatcherValid
};

// 流程节点校验
let FLOW_NODE_VALID = {
  ...nodeValidConfig,
  ...createjobNodeValid
};
// 流程节点连接线校验
let FLOW_LINE_VALID = {
  ...lineValidConfig
};
export { FLOW_DISPATCHER_COMPONENT, FLOW_NODE_VALID, FLOW_LINE_VALID };

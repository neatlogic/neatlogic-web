import UML from '@/views/pages/diagram/graph/widgets/UML/index.js';
import Flow from '@/views/pages/diagram/graph/widgets/Flow/index.js';
import Architecture from '@/views/pages/diagram/graph/widgets/Architecture/index.js';
export default [
  { name: 'UML', label: 'UML', widgets: UML },
  { name: 'Flow', label: '流程图', widgets: Flow },
  { name: 'Architecture', label: '架构图', widgets: Architecture }
];

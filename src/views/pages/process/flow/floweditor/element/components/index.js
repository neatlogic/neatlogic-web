import ComponentManager from '@/resources/import/component-manager.js';
const flowElementList = ComponentManager.getFlowElementComponent();

import start from '@/views/pages/process/flow/floweditor/element/components/element/start-handler.js';
import end from '@/views/pages/process/flow/floweditor/element/components/element/end-handler.js';
import process from '@/views/pages/process/flow/floweditor/element/components/element/process-type.js';
import converge from '@/views/pages/process/flow/floweditor/element/components/element/converge-type.js';
import timer from '@/views/pages/process/flow/floweditor/element/components/element/timer-handler.js';
import automatic from '@/views/pages/process/flow/floweditor/element/components/element/automatic-handler.js';
import changecreate from '@/views/pages/process/flow/floweditor/element/components/element/changecreate-handler.js';
import changehandle from '@/views/pages/process/flow/floweditor/element/components/element/changehandle-handler.js';
import cientitysync from '@/views/pages/process/flow/floweditor/element/components/element/cientitysync-handler.js';
import condition from '@/views/pages/process/flow/floweditor/element/components/element/condition-handler.js';
import createjob from '@/views/pages/process/flow/floweditor/element/components/element/createjob-handler.js';
import event from '@/views/pages/process/flow/floweditor/element/components/element/event-handler.js';
export default [start, end, process, converge, timer, automatic, changecreate, changehandle, cientitysync, condition, createjob, event, ...flowElementList];

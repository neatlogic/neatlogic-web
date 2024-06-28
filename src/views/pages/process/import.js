import { CmdbDispatcherValid } from '@/views/pages/process/flow/flowedit/components/nodesetting/dispatcher/cmdb/valid.js';
import { autoexecNodeValid } from '@/views/pages/process/flow/flowedit/components/autoexec/node-valid.js';
import { createjobNodeValid } from '@/views/pages/process/flow/flowedit/components/autoexec/node-valid.js';
import ComponentManager from '@/resources/import/component-manager.js';
ComponentManager.registerFlowNodeValidComponent({ autoexec: autoexecNodeValid, createjob: createjobNodeValid });
ComponentManager.registerDispatcherValidComponent({ CmdbDispatcher: CmdbDispatcherValid });

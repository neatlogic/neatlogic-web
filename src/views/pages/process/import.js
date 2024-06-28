import { CmdbDispatcherValid } from '@/views/pages/process/flow/flowedit/components/nodesetting/dispatcher/cmdb/valid.js';
import { autoexecNodeValid } from '@/views/pages/process/flow/flowedit/components/autoexec/node-valid.js';

import FetchComponent from '@/resources/import/fetch-component.js';
FetchComponent.fetchFlowNodeValidComponent({ autoexec: autoexecNodeValid });
FetchComponent.fetchDispatcherValidComponent({ CmdbDispatcher: CmdbDispatcherValid });

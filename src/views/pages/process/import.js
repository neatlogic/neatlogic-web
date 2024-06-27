import { CmdbDispatcher } from '@/views/pages/process/flow/flowedit/components/nodesetting/dispatcher/cmdb/valid.js';
import { autoexec } from '@/views/pages/process/flow/flowedit/components/autoexec/valid.js';

import FetchComponent from '@/resources/import/fetch-component.js';
FetchComponent.fetchFlowNodeValidComponent({ autoexec: autoexec });
FetchComponent.fetchDispatcherValidComponent({ CmdbDispatcher: CmdbDispatcher });

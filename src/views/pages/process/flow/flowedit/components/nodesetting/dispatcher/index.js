import CmdbDispatcher from './cmdb/index.vue';
import DefaultDispatcher from './default/index.vue';
import { FLOW_DISPATCHER_COMPONENT } from '@/resources/_import.js';
export default {
  CmdbDispatcher,
  DefaultDispatcher,
  ...FLOW_DISPATCHER_COMPONENT
};
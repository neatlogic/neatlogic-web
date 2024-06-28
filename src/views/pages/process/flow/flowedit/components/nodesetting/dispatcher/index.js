import CmdbDispatcher from './cmdb/index.vue';
import DefaultDispatcher from './default/index.vue';
import ComponentManager from '@/resources/import/component-manager.js';
export default {
  CmdbDispatcher,
  DefaultDispatcher,
  ...ComponentManager.getDispatcherComponent()
};

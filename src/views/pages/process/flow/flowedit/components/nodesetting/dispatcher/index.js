import CmdbDispatcher from './cmdb/index.vue';
import DefaultDispatcher from './default/index.vue';
import FetchComponent from '@/resources/import/fetch-component.js';
export default {
  CmdbDispatcher,
  DefaultDispatcher,
  ...FetchComponent.getDispatcherComponent()
};

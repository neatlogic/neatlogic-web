import cmdb_cientity from '@/views/pages/cmdb/mq/topic/config/cmdb-cientity.vue';
import ComponentManager from '@/resources/import/component-manager.js';
ComponentManager.registerMqTopicConfigComponent({ 'cmdb/cientity/delete': cmdb_cientity,
  'cmdb/cientity/insert': cmdb_cientity,
  'cmdb/cientity/update': cmdb_cientity,
  'cmdb/cientity/recover': cmdb_cientity });

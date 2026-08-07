import {
  DRAFT_PROCESS_TASK_WIDGET_NAME,
  PERSONAL_PROCESS_TASK_OVERVIEW_WIDGET_NAME,
  PROCESS_FAVORITE_SERVICE_WIDGET_NAME,
  PROCESSING_OF_MINE_PROCESS_TASK_WIDGET_NAME,
  PROCESS_TASK_WIDGET_NAME
} from './widgets/utils/process-widget-constants.js';
import {
  createDefaultConditionConfig,
  hasRequiredThead,
  serializeProcessTaskListConfig,
  serializeProcessTaskSearchConfig
} from './widgets/utils/process-task-search.js';
import { $t } from '@/resources/init.js';

const FAVORITE_SCHEMA = [
  { name: 'pageSize', label: $t('term.workbench.itemsperpage'), type: 'number', min: 1, max: 100, defaultValue: 6 }
];

export default {
  moduleGroup: 'process',
  moduleName: $t('term.workbench.itservices'),
  scopes: ['global', 'module'],
  widgetList: [
    {
      name: PROCESSING_OF_MINE_PROCESS_TASK_WIDGET_NAME,
      version: 1,
      label: $t('term.workbench.mytodos'),
      description: $t('term.workbench.mytodosdescription'),
      icon: 'tsfont-task',
      group: { name: 'process.task', label: $t('term.workbench.taskprocessing'), sort: 100 },
      defaultLayout: { w: 8, h: 8, minW: 5, minH: 6 },
      config: {
        pageSize: 10,
        conditionConfig: createDefaultConditionConfig(),
        theadList: []
      },
      dataSource: 'api',
      presentation: {
        type: 'table',
        previewKey: 'processTask',
        isRecommended: true
      },
      validateConfig(config) {
        if (!hasRequiredThead(config && config.theadList)) {
          return $t('term.workbench.columnrequirement');
        }
        return true;
      },
      serializeConfig(config) {
        return serializeProcessTaskListConfig(config);
      },
      component: () => import('./widgets/components/ProcessTaskList.vue'),
      configComponent: () => import('./widgets/configs/process-task-list-config.vue')
    },
    {
      name: DRAFT_PROCESS_TASK_WIDGET_NAME,
      version: 1,
      label: $t('term.workbench.mydrafts'),
      description: $t('term.workbench.mydraftsdescription'),
      icon: 'tsfont-task',
      group: { name: 'process.task', label: $t('term.workbench.taskprocessing'), sort: 100 },
      defaultLayout: { w: 8, h: 8, minW: 5, minH: 6 },
      config: {
        pageSize: 10,
        conditionConfig: createDefaultConditionConfig(),
        theadList: []
      },
      dataSource: 'api',
      presentation: {
        type: 'table',
        previewKey: 'processTask',
        isRecommended: true
      },
      validateConfig(config) {
        if (!hasRequiredThead(config && config.theadList)) {
          return $t('term.workbench.columnrequirement');
        }
        return true;
      },
      serializeConfig(config) {
        return serializeProcessTaskListConfig(config);
      },
      component: () => import('./widgets/components/ProcessTaskList.vue'),
      configComponent: () => import('./widgets/configs/process-task-list-config.vue')
    },
    {
      name: PROCESS_TASK_WIDGET_NAME,
      version: 1,
      label: $t('term.workbench.workorderlist'),
      description: $t('term.workbench.workorderlistdescription'),
      icon: 'tsfont-list',
      group: { name: 'process.task', label: $t('term.workbench.taskprocessing'), sort: 100 },
      defaultLayout: { w: 8, h: 9, minW: 6, minH: 7 },
      config: {
        pageSize: 10,
        conditionConfig: createDefaultConditionConfig(),
        theadList: []
      },
      dataSource: 'api',
      presentation: {
        type: 'table',
        previewKey: 'processTask',
        isRecommended: true
      },
      validateConfig(config) {
        if (!hasRequiredThead(config && config.theadList)) {
          return $t('term.workbench.columnrequirement');
        }
        return true;
      },
      serializeConfig(config) {
        return serializeProcessTaskSearchConfig(config);
      },
      component: () => import('./widgets/components/ProcessTaskSearch.vue'),
      configComponent: () => import('./widgets/configs/process-task-search-config.vue')
    },
    {
      name: PROCESS_FAVORITE_SERVICE_WIDGET_NAME,
      label: $t('term.workbench.favoriteservices'),
      description: $t('term.workbench.favoriteservicesdescription'),
      icon: 'tsfont-star',
      group: { name: 'process.service', label: $t('term.workbench.quickservices'), sort: 110 },
      defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
      config: { pageSize: 6 },
      configSchema: FAVORITE_SCHEMA,
      dataSource: 'api',
      presentation: {
        type: 'table',
        previewKey: 'processFavoriteService'
      },
      component: () => import('./widgets/components/ProcessFavoriteService.vue')
    },
    {
      name: PERSONAL_PROCESS_TASK_OVERVIEW_WIDGET_NAME,
      label: $t('term.workbench.personalworkorderstatusoverview'),
      description: $t('term.workbench.statusoverviewdescription'),
      icon: 'tsfont-chart-progress',
      group: { name: 'process.task', label: $t('term.workbench.taskprocessing'), sort: 100 },
      defaultLayout: { w: 8, h: 7, minW: 5, minH: 6 },
      config: {
        showTrend: 1,
        startTimeCondition: {
          timeRange: '1',
          timeUnit: 'year'
        }
      },
      configSchema: [
        { name: 'showTrend', label: $t('term.workbench.showstatusprogress'), type: 'switch', defaultValue: 1 }
      ],
      dataSource: 'api',
      presentation: {
        type: 'distribution',
        isRecommended: true
      },
      component: () => import('./widgets/components/TaskStatusOverview.vue'),
      configComponent: () => import('./widgets/configs/personalProcessTaskOverviewConfig.vue')
    }
  ]
};

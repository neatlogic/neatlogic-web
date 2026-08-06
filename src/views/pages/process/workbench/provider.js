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

const FAVORITE_SCHEMA = [
  { name: 'pageSize', label: '每页显示条数', type: 'number', min: 1, max: 100, defaultValue: 6 }
];

export default {
  moduleGroup: 'process',
  moduleName: 'IT 服务',
  scopes: ['global', 'module'],
  widgetList: [
    {
      name: PROCESSING_OF_MINE_PROCESS_TASK_WIDGET_NAME,
      version: 1,
      label: '我的待办',
      description: '按时间范围和自定义表头展示当前用户待处理的 IT 服务工单',
      icon: 'tsfont-task',
      group: { name: 'process.task', label: 'IT 服务 · 任务处理', sort: 100 },
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
          return '工单列表请至少选择一个表头，并保留工单标题列';
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
      label: '我的草稿',
      description: '按时间范围和自定义表头展示当前用户尚未提交的 IT 服务工单',
      icon: 'tsfont-task',
      group: { name: 'process.task', label: 'IT 服务 · 任务处理', sort: 100 },
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
          return '工单列表请至少选择一个表头，并保留工单标题列';
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
      label: '工单列表',
      description: '按自定义搜索条件和表头展示 IT 服务工单',
      icon: 'tsfont-list',
      group: { name: 'process.task', label: 'IT 服务 · 任务处理', sort: 100 },
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
          return '工单列表请至少选择一个表头，并保留工单标题列';
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
      label: '收藏服务',
      description: '快速发起当前用户收藏的常用服务',
      icon: 'tsfont-star',
      group: { name: 'process.service', label: 'IT 服务 · 快捷服务', sort: 110 },
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
      label: '个人工单状态概览',
      description: '通过指标和进度快速判断当前工单处理压力',
      icon: 'tsfont-chart-progress',
      group: { name: 'process.task', label: 'IT 服务 · 任务处理', sort: 100 },
      defaultLayout: { w: 8, h: 7, minW: 5, minH: 6 },
      config: {
        showTrend: 1,
        startTimeCondition: {
          timeRange: '1',
          timeUnit: 'year'
        }
      },
      configSchema: [
        { name: 'showTrend', label: '显示状态进度', type: 'switch', defaultValue: 1 }
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

import {
  createDefaultConditionConfig,
  hasRequiredThead,
  serializeProcessTaskSearchConfig
} from './widgets/utils/process-task-search.js';

const TODO_SCHEMA = [
  { name: 'limit', label: '显示条数', type: 'slider', min: 2, max: 8, step: 1, defaultValue: 5 },
  { name: 'showMore', label: '显示更多入口', type: 'switch', defaultValue: 1 },
  { name: 'showStatus', label: '显示状态', type: 'switch', defaultValue: 1 }
];

const FAVORITE_SCHEMA = [
  { name: 'limit', label: '显示数量', type: 'slider', min: 2, max: 10, step: 1, defaultValue: 6 }
];

export default {
  moduleGroup: 'process',
  moduleName: 'IT 服务',
  scopes: ['global', 'module'],
  widgetList: [
    {
      name: 'processMyTodo',
      label: '我的待办',
      description: '当前用户可直接处理的 IT 服务工单',
      icon: 'tsfont-task',
      group: { name: 'process.task', label: 'IT 服务 · 任务处理', sort: 100 },
      defaultLayout: { w: 8, h: 8, minW: 5, minH: 6 },
      config: { limit: 5, showMore: 1, showStatus: 1 },
      configSchema: TODO_SCHEMA,
      dataSource: 'api',
      presentation: {
        type: 'list',
        isRecommended: true
      },
      component: () => import('./widgets/components/ProcessingOfMineProcessTask.vue')
    },
    {
      name: 'processTaskSearch',
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
        type: 'list',
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
      name: 'processSlaRisk',
      label: 'SLA 风险',
      description: '突出显示即将超时和已经超时的工单',
      icon: 'tsfont-warning-o',
      group: { name: 'process.task', label: 'IT 服务 · 任务处理', sort: 100 },
      defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
      config: { limit: 5, showMore: 1, showStatus: 1, warnMinutes: 60 },
      configSchema: TODO_SCHEMA,
      dataMode: 'mock',
      presentation: {
        type: 'ranking',
        isRecommended: true
      },
      component: () => import('./widgets/components/SlaRiskList.vue'),
      configComponent: () => import('./widgets/configs/sla-risk-config.vue')
    },
    {
      name: 'processFavoriteService',
      label: '收藏服务',
      description: '快速发起当前用户收藏的常用服务',
      icon: 'tsfont-star',
      group: { name: 'process.service', label: 'IT 服务 · 快捷服务', sort: 110 },
      defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
      config: { limit: 6 },
      configSchema: FAVORITE_SCHEMA,
      dataSource: 'api',
      presentation: {
        type: 'shortcut'
      },
      component: () => import('./widgets/components/FavoritedServices.vue')
    },
    {
      name: 'processTaskOverview',
      label: '工单状态概览',
      description: '通过指标和进度快速判断当前工单处理压力',
      icon: 'tsfont-chart-progress',
      group: { name: 'process.task', label: 'IT 服务 · 任务处理', sort: 100 },
      defaultLayout: { w: 8, h: 7, minW: 5, minH: 6 },
      config: { showTrend: 1 },
      configSchema: [
        { name: 'showTrend', label: '显示状态进度', type: 'switch', defaultValue: 1 }
      ],
      dataMode: 'mock',
      presentation: {
        type: 'distribution',
        isRecommended: true
      },
      component: () => import('./widgets/components/TaskStatusOverview.vue')
    }
  ]
};

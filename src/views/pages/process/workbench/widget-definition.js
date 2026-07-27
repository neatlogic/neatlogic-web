const LIMIT_SCHEMA = [
  { name: 'limit', label: '显示条数', type: 'slider', min: 2, max: 8, step: 1, defaultValue: 4 }
];

const MORE_LIST_SCHEMA = [
  ...LIMIT_SCHEMA,
  { name: 'showMore', label: '显示更多入口', type: 'switch', defaultValue: 1 }
];

const STATUS_MORE_LIST_SCHEMA = [
  ...MORE_LIST_SCHEMA,
  { name: 'showStatus', label: '显示状态', type: 'switch', defaultValue: 1 }
];

const TODO_LIST_SCHEMA = [
  { name: 'limit', label: '显示条数', type: 'slider', min: 2, max: 8, step: 1, defaultValue: 5 },
  { name: 'showMore', label: '显示更多入口', type: 'switch', defaultValue: 1 },
  { name: 'showStatus', label: '显示状态', type: 'switch', defaultValue: 1 }
];

const TABLE_SCHEMA = [
  { name: 'limit', label: '显示条数', type: 'slider', min: 2, max: 10, step: 1, defaultValue: 10 },
  { name: 'showStatus', label: '显示状态列', type: 'switch', defaultValue: 1 },
  { name: 'showMore', label: '显示全部服务入口', type: 'switch', defaultValue: 1 }
];

const METRIC_SCHEMA = [
  { name: 'showTrend', label: '显示趋势文案', type: 'switch', defaultValue: 1 },
  { name: 'tone', label: '图标色调', type: 'select', defaultValue: '', dataList: [{ value: '', text: '跟随数据' }, { value: 'blue', text: '蓝色' }, { value: 'green', text: '绿色' }, { value: 'orange', text: '橙色' }, { value: 'red', text: '红色' }] }
];

const QUICK_SCHEMA = [
  { name: 'columnCount', label: '每行列数', type: 'slider', min: 2, max: 4, step: 1, defaultValue: 3 },
  { name: 'limit', label: '入口数量', type: 'slider', min: 4, max: 12, step: 1, defaultValue: 9 },
  { name: 'showCustom', label: '显示自定义入口', type: 'switch', defaultValue: 1 }
];

export const WORKBENCH_WIDGETS = [
  createDefine('processingOfMineProcessTask', '我的待办', '当前登录用户可处理的未完成工单', 'tsfont-task', 'ProcessingOfMineProcessTask', { x: 0, y: 13, w: 4, h: 8, minW: 3, minH: 6 }, {}, TODO_LIST_SCHEMA),
  createDefine('recentTaskList', '最近工单', '最近创建或处理过的工单', 'tsfont-history', 'RecentTaskList', { x: 0, y: 13, w: 4, h: 8, minW: 3, minH: 6 }, {}, STATUS_MORE_LIST_SCHEMA),
  createDefine('approvalTodoList', '审批待办', '需要当前登录人确认的审批项', 'tsfont-check-square', 'ApprovalTodoList', { x: 4, y: 13, w: 4, h: 8, minW: 3, minH: 6 }, {}, STATUS_MORE_LIST_SCHEMA),
  createDefine('focusTaskList', '我的关注', '关注中的重点工单进度', 'tsfont-focus', 'FocusTaskList', { x: 8, y: 13, w: 4, h: 8, minW: 3, minH: 6 }, {}, MORE_LIST_SCHEMA),
  createDefine('recentOperationList', '最近操作', '团队近期关键操作记录', 'tsfont-time', 'RecentOperationList', { x: 4, y: 54, w: 4, h: 8, minW: 3, minH: 6 }, {}, LIMIT_SCHEMA),
  createDefine('quickMyTodo', '我的待办入口', '快速进入我的待办视图', 'tsfont-task', 'MyTodoEntry', { x: 8, y: 54, w: 4, h: 7, minW: 3, minH: 5 }, {}, QUICK_SCHEMA),

  createDefine('trendPanel', '工单趋势', '按时间查看工单变化趋势', 'tsfont-chart-line', 'TrendPanel', { x: 5, y: 30, w: 5, h: 8, minW: 5, minH: 7 }),
  createDefine('workbenchTable', '服务概览', '关键服务运行状态表格', 'tsfont-list', 'WorkbenchTable', { x: 0, y: 21, w: 8, h: 8, minW: 7, minH: 7 }, {}, TABLE_SCHEMA),
  createDefine('taskTypeDistribution', '工单类型分布', '按事件、请求、变更统计工单', 'tsfont-chart-pie', 'TaskTypeDistribution', { x: 8, y: 38, w: 4, h: 8, minW: 3, minH: 6 }),
  createDefine('slaRiskList', 'SLA 风险', '临近超时和高风险工单提醒', 'tsfont-warning', 'SlaRiskList', { x: 8, y: 46, w: 4, h: 8, minW: 3, minH: 6 }, {}, STATUS_MORE_LIST_SCHEMA),
  createDefine('efficiencyPanel', '处理效率', '响应、处理和自动关闭效率', 'tsfont-dashboard', 'EfficiencyPanel', { x: 0, y: 46, w: 4, h: 7, minW: 3, minH: 5 }),

  createDefine('metricFavorite', '服务收藏', '当前登录人收藏的常用服务数', 'tsfont-star', 'FavoriteMetric', { x: 9, y: 6, w: 3, h: 4, minW: 2, minH: 4 }, {}, METRIC_SCHEMA),
  createDefine('favoritedServices', '收藏服务', '当前登录人收藏的常用服务', 'tsfont-star', 'FavoritedServices', { x: 0, y: 54, w: 4, h: 8, minW: 3, minH: 6 }, {}, MORE_LIST_SCHEMA),
  createDefine('serviceDistribution', '服务分布', '按服务类型统计占比', 'tsfont-pie-chart', 'ServiceDistribution', { x: 4, y: 38, w: 4, h: 8, minW: 4, minH: 6 }),
  createDefine('quickActionGrid', '快捷操作', '提交工单、服务目录等常用入口', 'tsfont-bolt', 'QuickActionGrid', { x: 8, y: 46, w: 4, h: 8, minW: 3, minH: 6 }, {}, QUICK_SCHEMA),
  createDefine('serviceCatalogEntry', '服务目录入口', '常用服务目录快捷入口', 'tsfont-star', 'ServiceCatalogEntry', { x: 0, y: 62, w: 4, h: 7, minW: 3, minH: 5 }, {}, QUICK_SCHEMA),

  createDefine('healthRing', '健康状态', '整体工单和服务健康度', 'tsfont-heart', 'HealthRing', { x: 0, y: 30, w: 5, h: 8, minW: 5, minH: 7 }),
  createDefine('teamLoad', '团队负载', '各处理组当前工作负载', 'tsfont-team', 'TeamLoad', { x: 4, y: 46, w: 4, h: 7, minW: 3, minH: 5 }, {}, LIMIT_SCHEMA),
  createDefine('changeCalendar', '变更日历', '近期计划变更窗口', 'tsfont-calendar', 'ChangeCalendar', { x: 8, y: 21, w: 4, h: 9, minW: 3, minH: 6 }, {}, MORE_LIST_SCHEMA),
  createDefine('systemNoticeList', '系统通知', '平台消息和维护通知', 'tsfont-notice', 'SystemNoticeList', { x: 8, y: 54, w: 4, h: 8, minW: 3, minH: 6 }, {}, LIMIT_SCHEMA),

  createDefine('knowledgeHelp', '知识帮助', '排障指南和知识库文章', 'tsfont-book', 'KnowledgeHelp', { x: 4, y: 62, w: 4, h: 8, minW: 3, minH: 6 }, {}, MORE_LIST_SCHEMA),
  createDefine('announcementPanel', '公告栏', '平台公告和维护消息', 'tsfont-volume', 'AnnouncementPanel', { x: 8, y: 62, w: 4, h: 8, minW: 3, minH: 6 }, {}, MORE_LIST_SCHEMA),
  createDefine('supportPanel', '帮助支持', '帮助文档、教程和联系入口', 'tsfont-question-o', 'SupportPanel', { x: 0, y: 62, w: 4, h: 7, minW: 3, minH: 5 }, {}, QUICK_SCHEMA),
  createDefine('faqList', '常见问题', '工单服务常见问题集合', 'tsfont-question-o', 'FaqList', { x: 4, y: 70, w: 4, h: 8, minW: 3, minH: 6 }, {}, MORE_LIST_SCHEMA),

  createDefine('heroBanner', '首页横幅', '当前登录人的欢迎和摘要信息', 'tsfont-home', 'HeroBanner', { x: 0, y: 0, w: 12, h: 4, minW: 8, minH: 4 }),
  createDefine('metricTodo', '待办指标', '当前待处理工单数量', 'tsfont-task', 'TodoMetric', { x: 0, y: 6, w: 3, h: 4, minW: 2, minH: 4 }, {}, METRIC_SCHEMA),
  createDefine('metricOverdue', '超时指标', '即将超时和超时风险数量', 'tsfont-sla', 'OverdueMetric', { x: 3, y: 6, w: 3, h: 4, minW: 2, minH: 4 }, {}, METRIC_SCHEMA),
  createDefine('metricDone', '今日完成', '今日完成工单数量', 'tsfont-check', 'DoneMetric', { x: 6, y: 6, w: 3, h: 4, minW: 2, minH: 4 }, {}, METRIC_SCHEMA),
  createDefine('metricSatisfaction', '满意度', '当前服务满意度指标', 'tsfont-stars', 'SatisfactionMetric', { x: 0, y: 10, w: 3, h: 4, minW: 2, minH: 4 }, {}, METRIC_SCHEMA)
];

function createDefine(type, title, description, icon, componentName, defaultLayout, config = {}, configSchema = []) {
  const schema = configSchema || [];
  return {
    type,
    title,
    description,
    icon,
    componentName,
    defaultLayout,
    config: {
      ...getSchemaDefaultConfig(schema),
      ...config
    },
    configSchema: schema
  };
}

function getSchemaDefaultConfig(schema) {
  const config = {};
  schema.forEach(item => {
    if (Object.prototype.hasOwnProperty.call(item, 'defaultValue')) {
      config[item.name] = item.defaultValue;
    }
  });
  return config;
}

export function getWidgetByType(type) {
  return WORKBENCH_WIDGETS.find(item => item.type === type);
}

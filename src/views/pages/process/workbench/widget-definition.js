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

export const WORKBENCH_WIDGETS = Object.freeze([
  defineWidget({
    type: 'recentTaskList',
    title: '最近工单',
    description: '最近创建或处理过的工单',
    icon: 'tsfont-history',
    defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
    configSchema: STATUS_MORE_LIST_SCHEMA
  }),
  defineWidget({
    type: 'approvalTodoList',
    title: '审批待办',
    description: '需要当前登录人确认的审批项',
    icon: 'tsfont-check-square',
    defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
    configSchema: STATUS_MORE_LIST_SCHEMA
  }),
  defineWidget({
    type: 'focusTaskList',
    title: '我的关注',
    description: '关注中的重点工单进度',
    icon: 'tsfont-focus',
    defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
    configSchema: MORE_LIST_SCHEMA
  }),
  defineWidget({
    type: 'recentOperationList',
    title: '最近操作',
    description: '团队近期关键操作记录',
    icon: 'tsfont-time',
    defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
    configSchema: LIMIT_SCHEMA
  }),
  defineWidget({
    type: 'quickMyTodo',
    title: '我的待办入口',
    description: '快速进入我的待办视图',
    icon: 'tsfont-task',
    defaultLayout: { w: 4, h: 7, minW: 3, minH: 5 },
    configSchema: QUICK_SCHEMA
  }),
  defineWidget({
    type: 'trendPanel',
    title: '工单趋势',
    description: '按时间查看工单变化趋势',
    icon: 'tsfont-chart-line',
    defaultLayout: { w: 5, h: 8, minW: 5, minH: 7 }
  }),
  defineWidget({
    type: 'workbenchTable',
    title: '服务概览',
    description: '关键服务运行状态表格',
    icon: 'tsfont-list',
    defaultLayout: { w: 8, h: 8, minW: 7, minH: 7 },
    configSchema: TABLE_SCHEMA
  }),
  defineWidget({
    type: 'taskTypeDistribution',
    title: '工单类型分布',
    description: '按事件、请求、变更统计工单',
    icon: 'tsfont-chart-pie',
    defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 }
  }),
  defineWidget({
    type: 'slaRiskList',
    title: 'SLA 风险',
    description: '临近超时和高风险工单提醒',
    icon: 'tsfont-warning',
    defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
    configSchema: STATUS_MORE_LIST_SCHEMA
  }),
  defineWidget({
    type: 'efficiencyPanel',
    title: '处理效率',
    description: '响应、处理和自动关闭效率',
    icon: 'tsfont-dashboard',
    defaultLayout: { w: 4, h: 7, minW: 3, minH: 5 }
  }),
  defineWidget({
    type: 'metricFavorite',
    title: '服务收藏',
    description: '当前登录人收藏的常用服务数',
    icon: 'tsfont-star',
    defaultLayout: { w: 3, h: 4, minW: 2, minH: 4 },
    configSchema: METRIC_SCHEMA
  }),
  defineWidget({
    type: 'favoritedServices',
    title: '收藏服务',
    description: '当前登录人收藏的常用服务',
    icon: 'tsfont-star',
    defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
    configSchema: MORE_LIST_SCHEMA
  }),
  defineWidget({
    type: 'serviceDistribution',
    title: '服务分布',
    description: '按服务类型统计占比',
    icon: 'tsfont-pie-chart',
    defaultLayout: { w: 4, h: 8, minW: 4, minH: 6 }
  }),
  defineWidget({
    type: 'quickActionGrid',
    title: '快捷操作',
    description: '提交工单、服务目录等常用入口',
    icon: 'tsfont-bolt',
    defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
    configSchema: QUICK_SCHEMA
  }),
  defineWidget({
    type: 'serviceCatalogEntry',
    title: '服务目录入口',
    description: '常用服务目录快捷入口',
    icon: 'tsfont-star',
    defaultLayout: { w: 4, h: 7, minW: 3, minH: 5 },
    configSchema: QUICK_SCHEMA
  }),
  defineWidget({
    type: 'healthRing',
    title: '健康状态',
    description: '整体工单和服务健康度',
    icon: 'tsfont-heart',
    defaultLayout: { w: 5, h: 8, minW: 5, minH: 7 }
  }),
  defineWidget({
    type: 'teamLoad',
    title: '团队负载',
    description: '各处理组当前工作负载',
    icon: 'tsfont-team',
    defaultLayout: { w: 4, h: 7, minW: 3, minH: 5 },
    configSchema: LIMIT_SCHEMA
  }),
  defineWidget({
    type: 'changeCalendar',
    title: '变更日历',
    description: '近期计划变更窗口',
    icon: 'tsfont-calendar',
    defaultLayout: { w: 4, h: 9, minW: 3, minH: 6 },
    configSchema: MORE_LIST_SCHEMA
  }),
  defineWidget({
    type: 'systemNoticeList',
    title: '系统通知',
    description: '平台消息和维护通知',
    icon: 'tsfont-notice',
    defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
    configSchema: LIMIT_SCHEMA
  }),
  defineWidget({
    type: 'knowledgeHelp',
    title: '知识帮助',
    description: '排障指南和知识库文章',
    icon: 'tsfont-book',
    defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
    configSchema: MORE_LIST_SCHEMA
  }),
  defineWidget({
    type: 'announcementPanel',
    title: '公告栏',
    description: '平台公告和维护消息',
    icon: 'tsfont-volume',
    defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
    configSchema: MORE_LIST_SCHEMA
  }),
  defineWidget({
    type: 'supportPanel',
    title: '帮助支持',
    description: '帮助文档、教程和联系入口',
    icon: 'tsfont-question-o',
    defaultLayout: { w: 4, h: 7, minW: 3, minH: 5 },
    configSchema: QUICK_SCHEMA
  }),
  defineWidget({
    type: 'faqList',
    title: '常见问题',
    description: '工单服务常见问题集合',
    icon: 'tsfont-question-o',
    defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
    configSchema: MORE_LIST_SCHEMA
  }),
  defineWidget({
    type: 'heroBanner',
    title: '首页横幅',
    description: '当前登录人的欢迎和摘要信息',
    icon: 'tsfont-home',
    defaultLayout: { w: 12, h: 4, minW: 8, minH: 4 }
  }),
  defineWidget({
    type: 'metricTodo',
    title: '待办指标',
    description: '当前待处理工单数量',
    icon: 'tsfont-task',
    defaultLayout: { w: 3, h: 4, minW: 2, minH: 4 },
    configSchema: METRIC_SCHEMA
  }),
  defineWidget({
    type: 'metricOverdue',
    title: '超时指标',
    description: '即将超时和超时风险数量',
    icon: 'tsfont-sla',
    defaultLayout: { w: 3, h: 4, minW: 2, minH: 4 },
    configSchema: METRIC_SCHEMA
  }),
  defineWidget({
    type: 'metricDone',
    title: '今日完成',
    description: '今日完成工单数量',
    icon: 'tsfont-check',
    defaultLayout: { w: 3, h: 4, minW: 2, minH: 4 },
    configSchema: METRIC_SCHEMA
  }),
  defineWidget({
    type: 'metricSatisfaction',
    title: '满意度',
    description: '当前服务满意度指标',
    icon: 'tsfont-stars',
    defaultLayout: { w: 3, h: 4, minW: 2, minH: 4 },
    configSchema: METRIC_SCHEMA
  })
]);

const WORKBENCH_WIDGET_MAP = Object.freeze(WORKBENCH_WIDGETS.reduce((map, widget) => {
  map[widget.type] = widget;
  return map;
}, {}));

function defineWidget({ type, title, description, icon, defaultLayout, config = {}, configSchema = [] }) {
  const schema = configSchema || [];
  return {
    type,
    title,
    description,
    icon,
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
  return WORKBENCH_WIDGET_MAP[type] || null;
}

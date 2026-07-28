const LIST_SCHEMA = [
  { name: 'limit', label: '显示条数', type: 'slider', min: 2, max: 8, step: 1, defaultValue: 5 },
  { name: 'showStatus', label: '显示状态', type: 'switch', defaultValue: 1 }
];

export default {
  moduleGroup: 'inspect',
  moduleName: '巡检',
  scopes: ['global', 'module'],
  widgetList: [
    {
      name: 'inspect.recentIssue',
      label: '近期问题',
      description: '展示巡检发现且尚未关闭的近期问题',
      icon: 'tsfont-warning-o',
      group: { name: 'inspect.issue', label: '巡检 · 问题处理', sort: 500 },
      defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
      config: { kind: 'issue', limit: 5, showStatus: 1 },
      configSchema: LIST_SCHEMA,
      dataMode: 'mock',
      presentation: {
        type: 'list',
        isRecommended: true
      },
      component: () => import('./widgets/inspect-attention.vue')
    },
    {
      name: 'inspect.runningJob',
      label: '执行中巡检',
      description: '查看正在运行的巡检任务与完成进度',
      icon: 'tsfont-spinner',
      group: { name: 'inspect.job', label: '巡检 · 执行状态', sort: 510 },
      defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
      config: { kind: 'running', limit: 5, showStatus: 1 },
      configSchema: LIST_SCHEMA,
      dataMode: 'mock',
      presentation: {
        type: 'progress'
      },
      component: () => import('./widgets/inspect-attention.vue')
    },
    {
      name: 'inspect.abnormalAsset',
      label: '异常资产',
      description: '按资产聚合巡检异常，快速进入问题处理',
      icon: 'tsfont-ci',
      group: { name: 'inspect.asset', label: '巡检 · 资产状态', sort: 520 },
      defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
      config: { kind: 'asset', limit: 5, showStatus: 1 },
      configSchema: LIST_SCHEMA,
      dataMode: 'mock',
      presentation: {
        type: 'ranking'
      },
      component: () => import('./widgets/inspect-attention.vue')
    },
    {
      name: 'inspect.qualityTrend',
      label: '问题趋势与通过率',
      description: '查看近期巡检问题变化和整体通过率',
      icon: 'tsfont-chart-line',
      group: { name: 'inspect.issue', label: '巡检 · 问题处理', sort: 500 },
      defaultLayout: { w: 4, h: 7, minW: 3, minH: 6 },
      config: { showMetrics: 1 },
      configSchema: [
        { name: 'showMetrics', label: '显示巡检指标', type: 'switch', defaultValue: 1 }
      ],
      dataMode: 'mock',
      presentation: {
        type: 'trend',
        isRecommended: true
      },
      component: () => import('./widgets/quality-trend.vue')
    }
  ]
};

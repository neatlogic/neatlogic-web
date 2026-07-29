const LIST_SCHEMA = [
  { name: 'limit', label: '显示条数', type: 'slider', min: 2, max: 8, step: 1, defaultValue: 5 },
  { name: 'showStatus', label: '显示状态', type: 'switch', defaultValue: 1 }
];

export default {
  moduleGroup: 'deploy',
  moduleName: '发布管理',
  scopes: ['global', 'module'],
  widgetList: [
    {
      name: 'deployPendingRelease',
      label: '待发布版本',
      description: '展示等待审批、排期或执行的发布版本',
      icon: 'tsfont-time',
      group: { name: 'deploy.release', label: '发布管理 · 版本处理', sort: 400 },
      defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
      config: { kind: 'pending', limit: 5, showStatus: 1 },
      configSchema: LIST_SCHEMA,
      dataMode: 'mock',
      presentation: {
        type: 'list',
        isRecommended: true
      },
      component: () => import('./widgets/release-attention.vue')
    },
    {
      name: 'deployRunningDeployment',
      label: '执行中部署',
      description: '查看当前部署任务的阶段和执行进度',
      icon: 'tsfont-spinner',
      group: { name: 'deploy.job', label: '发布管理 · 执行状态', sort: 410 },
      defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
      config: { kind: 'running', limit: 5, showStatus: 1 },
      configSchema: LIST_SCHEMA,
      dataMode: 'mock',
      presentation: {
        type: 'progress'
      },
      component: () => import('./widgets/release-attention.vue')
    },
    {
      name: 'deployReleaseRisk',
      label: '失败与风险发布',
      description: '集中呈现失败、超时和存在风险的发布任务',
      icon: 'tsfont-warning-o',
      group: { name: 'deploy.job', label: '发布管理 · 执行状态', sort: 410 },
      defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
      config: { kind: 'risk', limit: 5, showStatus: 1 },
      configSchema: LIST_SCHEMA,
      dataMode: 'mock',
      presentation: {
        type: 'ranking'
      },
      component: () => import('./widgets/release-attention.vue')
    },
    {
      name: 'deployReleaseCalendar',
      label: '发布日程与维护窗口',
      description: '展示近期发布计划和可用维护窗口',
      icon: 'tsfont-calendar',
      group: { name: 'deploy.release', label: '发布管理 · 版本处理', sort: 400 },
      defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
      config: { limit: 5 },
      configSchema: [
        { name: 'limit', label: '显示日程数', type: 'slider', min: 3, max: 8, step: 1, defaultValue: 5 }
      ],
      dataMode: 'mock',
      presentation: {
        type: 'timeline',
        isRecommended: true
      },
      component: () => import('./widgets/release-calendar.vue')
    }
  ]
};

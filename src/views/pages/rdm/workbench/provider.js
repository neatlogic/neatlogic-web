const LIST_SCHEMA = [
  { name: 'limit', label: '显示条数', type: 'slider', min: 2, max: 8, step: 1, defaultValue: 5 },
  { name: 'showStatus', label: '显示状态', type: 'switch', defaultValue: 1 }
];

export default {
  moduleGroup: 'rdm',
  moduleName: '研发管理',
  scopes: ['global', 'module'],
  widgetList: [
    {
      name: 'rdm.myTask',
      label: '我的任务',
      description: '展示当前用户正在处理和即将到期的研发任务',
      icon: 'tsfont-task',
      group: { name: 'rdm.task', label: '研发管理 · 我的工作', sort: 600 },
      defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
      config: { kind: 'task', limit: 5, showStatus: 1 },
      configSchema: LIST_SCHEMA,
      dataMode: 'mock',
      presentation: {
        type: 'list',
        isRecommended: true
      },
      component: () => import('./widgets/rdm-attention.vue')
    },
    {
      name: 'rdm.projectHealth',
      label: '项目健康',
      description: '根据进度、风险和逾期情况判断项目健康状态',
      icon: 'tsfont-heart-s',
      group: { name: 'rdm.project', label: '研发管理 · 项目状态', sort: 610 },
      defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
      config: { kind: 'project', limit: 5, showStatus: 1 },
      configSchema: LIST_SCHEMA,
      dataMode: 'mock',
      presentation: {
        type: 'metric',
        isRecommended: true
      },
      component: () => import('./widgets/rdm-attention.vue')
    },
    {
      name: 'rdm.overdueMilestone',
      label: '逾期缺陷与里程碑',
      description: '集中展示逾期缺陷和临近日期的项目里程碑',
      icon: 'tsfont-warning-o',
      group: { name: 'rdm.risk', label: '研发管理 · 风险关注', sort: 620 },
      defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
      config: { kind: 'risk', limit: 5, showStatus: 1 },
      configSchema: LIST_SCHEMA,
      dataMode: 'mock',
      presentation: {
        type: 'ranking'
      },
      component: () => import('./widgets/rdm-attention.vue')
    },
    {
      name: 'rdm.milestoneTimeline',
      label: '里程碑与交付风险',
      description: '展示近期里程碑、交付节点和阻塞风险',
      icon: 'tsfont-formtime',
      group: { name: 'rdm.risk', label: '研发管理 · 风险关注', sort: 620 },
      defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
      config: { limit: 5 },
      configSchema: [
        { name: 'limit', label: '显示里程碑数', type: 'slider', min: 3, max: 8, step: 1, defaultValue: 5 }
      ],
      dataMode: 'mock',
      presentation: {
        type: 'timeline',
        isRecommended: true
      },
      component: () => import('./widgets/milestone-timeline.vue')
    }
  ]
};

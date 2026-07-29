export default {
  moduleGroup: 'autoexec',
  moduleName: '自动化',
  scopes: ['global', 'module'],
  widgetList: [
    {
      name: 'autoexecJobAttention',
      label: '执行中任务',
      description: '展示当前正在运行的自动化任务及进度',
      icon: 'tsfont-history',
      group: { name: 'autoexec.job', label: '自动化 · 作业处理', sort: 300 },
      defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
      config: { kind: 'running', limit: 5, showStatus: 1 },
      configSchema: [
        { name: 'limit', label: '显示条数', type: 'slider', min: 2, max: 8, step: 1, defaultValue: 5 },
        { name: 'showStatus', label: '显示状态', type: 'switch', defaultValue: 1 }
      ],
      dataMode: 'mock',
      presentation: {
        type: 'progress',
        isRecommended: true
      },
      component: () => import('./widgets/job-attention.vue')
    },
    {
      name: 'autoexecFailedJob',
      label: '失败作业',
      description: '集中查看最近失败并需要处理的自动化作业',
      icon: 'tsfont-close-o',
      group: { name: 'autoexec.job', label: '自动化 · 作业处理', sort: 300 },
      defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
      config: { kind: 'failed', limit: 5, showStatus: 1 },
      configSchema: [
        { name: 'limit', label: '显示条数', type: 'slider', min: 2, max: 8, step: 1, defaultValue: 5 },
        { name: 'showStatus', label: '显示状态', type: 'switch', defaultValue: 1 }
      ],
      dataMode: 'mock',
      presentation: {
        type: 'ranking'
      },
      component: () => import('./widgets/job-attention.vue')
    },
    {
      name: 'autoexecPendingApproval',
      label: '待审批任务',
      description: '展示等待当前用户审批的自动化任务',
      icon: 'tsfont-time',
      group: { name: 'autoexec.approval', label: '自动化 · 审批处理', sort: 310 },
      defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
      config: { kind: 'approval', limit: 5, showStatus: 1 },
      configSchema: [
        { name: 'limit', label: '显示条数', type: 'slider', min: 2, max: 8, step: 1, defaultValue: 5 },
        { name: 'showStatus', label: '显示状态', type: 'switch', defaultValue: 1 }
      ],
      dataMode: 'mock',
      presentation: {
        type: 'list'
      },
      component: () => import('./widgets/job-attention.vue')
    },
    {
      name: 'autoexecSuccessTrend',
      label: '近7日执行成功率',
      description: '展示自动化执行成功率和失败变化',
      icon: 'tsfont-chart-line',
      group: { name: 'autoexec.job', label: '自动化 · 作业处理', sort: 300 },
      defaultLayout: { w: 4, h: 7, minW: 3, minH: 6 },
      config: { showMetrics: 1 },
      configSchema: [
        { name: 'showMetrics', label: '显示执行指标', type: 'switch', defaultValue: 1 }
      ],
      dataMode: 'mock',
      presentation: {
        type: 'trend',
        isRecommended: true
      },
      component: () => import('./widgets/success-trend.vue')
    }
  ]
};

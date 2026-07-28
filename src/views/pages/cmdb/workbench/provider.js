export default {
  moduleGroup: 'cmdb',
  moduleName: '配置管理',
  scopes: ['global', 'module'],
  widgetList: [
    {
      name: 'cmdb.assetHealth',
      label: '资产健康概览',
      description: '展示资产总量、异常资产和待处理变更',
      icon: 'tsfont-ci',
      group: { name: 'cmdb.asset', label: '配置管理 · 资产状态', sort: 200 },
      defaultLayout: { w: 4, h: 7, minW: 3, minH: 6 },
      config: { showAction: 1 },
      configSchema: [
        { name: 'showAction', label: '显示处理入口', type: 'switch', defaultValue: 1 }
      ],
      dataMode: 'mock',
      presentation: {
        type: 'metric',
        isRecommended: true
      },
      component: () => import('./widgets/asset-health.vue')
    },
    {
      name: 'cmdb.abnormalAsset',
      label: '异常资产',
      description: '集中处理离线、采集失败和信息过期的资产',
      icon: 'tsfont-warning-o',
      group: { name: 'cmdb.asset', label: '配置管理 · 资产状态', sort: 200 },
      defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
      config: { kind: 'abnormal', limit: 5, showStatus: 1 },
      configSchema: [
        { name: 'limit', label: '显示条数', type: 'slider', min: 2, max: 8, step: 1, defaultValue: 5 },
        { name: 'showStatus', label: '显示状态', type: 'switch', defaultValue: 1 }
      ],
      dataMode: 'mock',
      presentation: {
        type: 'ranking'
      },
      component: () => import('./widgets/asset-attention.vue')
    },
    {
      name: 'cmdb.pendingChange',
      label: '待处理变更',
      description: '展示需要确认和执行的配置项变更',
      icon: 'tsfont-change',
      group: { name: 'cmdb.change', label: '配置管理 · 变更处理', sort: 210 },
      defaultLayout: { w: 4, h: 8, minW: 3, minH: 6 },
      config: { kind: 'change', limit: 5, showStatus: 1 },
      configSchema: [
        { name: 'limit', label: '显示条数', type: 'slider', min: 2, max: 8, step: 1, defaultValue: 5 },
        { name: 'showStatus', label: '显示状态', type: 'switch', defaultValue: 1 }
      ],
      dataMode: 'mock',
      presentation: {
        type: 'timeline'
      },
      component: () => import('./widgets/asset-attention.vue')
    },
    {
      name: 'cmdb.assetDistribution',
      label: '资产类型与健康分布',
      description: '按资产类型展示规模和健康状态',
      icon: 'tsfont-chart-progress',
      group: { name: 'cmdb.asset', label: '配置管理 · 资产状态', sort: 200 },
      defaultLayout: { w: 8, h: 7, minW: 5, minH: 6 },
      config: { limit: 5 },
      configSchema: [
        { name: 'limit', label: '显示类型数', type: 'slider', min: 3, max: 8, step: 1, defaultValue: 5 }
      ],
      dataMode: 'mock',
      presentation: {
        type: 'distribution',
        isRecommended: true
      },
      component: () => import('./widgets/asset-distribution.vue')
    }
  ]
};

// Framework 模块维护后台公共工作台组件的前端实现。
const LIMIT_SCHEMA = [
  { name: 'limit', label: '显示数量', type: 'slider', min: 3, max: 12, step: 1, defaultValue: 6 }
];

const WELCOME_SCHEMA = [
  { name: 'showTime', label: '显示当前时间', type: 'switch', defaultValue: 1 }
];

export default {
  moduleGroup: 'framework',
  moduleName: '公共组件',
  scopes: ['global', 'module'],
  widgetList: [
    {
      name: 'welcomeOverview',
      label: '欢迎概况',
      description: '结合当前时间和用户展示轻量工作氛围',
      icon: 'tsfont-day',
      group: { name: 'framework.atmosphere', label: '公共组件 · 氛围与概况', sort: 5 },
      defaultLayout: { w: 8, h: 3, minW: 5, minH: 3 },
      config: { showTime: 1 },
      configSchema: WELCOME_SCHEMA,
      moduleSafe: true,
      dataSource: 'local',
      presentation: {
        type: 'welcome',
        isRecommended: true
      },
      component: () => import('./widgets/welcome-overview.vue')
    },
    {
      name: 'quickEntry',
      label: '快捷入口',
      description: '快速进入当前用户有权限的业务模块',
      icon: 'tsfont-lightning',
      group: { name: 'framework.shortcuts', label: '公共组件 · 快捷访问', sort: 10 },
      defaultLayout: { w: 4, h: 7, minW: 3, minH: 5 },
      config: { limit: 6 },
      configSchema: LIMIT_SCHEMA,
      moduleSafe: true,
      dataSource: 'local',
      presentation: {
        type: 'shortcut',
        isRecommended: true
      },
      component: () => import('./widgets/quick-entry.vue')
    }
  ]
};

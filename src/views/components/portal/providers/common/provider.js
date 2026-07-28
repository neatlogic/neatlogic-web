const LIMIT_SCHEMA = [
  { name: 'limit', label: '显示数量', type: 'slider', min: 3, max: 12, step: 1, defaultValue: 6 }
];

const WELCOME_SCHEMA = [
  { name: 'showTime', label: '显示当前时间', type: 'switch', defaultValue: 1 },
  { name: 'showModuleCount', label: '显示可用模块数', type: 'switch', defaultValue: 1 }
];

export default {
  moduleGroup: 'common',
  moduleName: '公共组件',
  scopes: ['global', 'module'],
  widgetList: [
    {
      name: 'common.welcomeOverview',
      label: '欢迎概况',
      description: '结合当前时间、用户和可用模块展示轻量工作氛围',
      icon: 'tsfont-day',
      group: { name: 'common.atmosphere', label: '公共组件 · 氛围与概况', sort: 5 },
      defaultLayout: { w: 8, h: 4, minW: 5, minH: 4 },
      config: { showTime: 1, showModuleCount: 1 },
      configSchema: WELCOME_SCHEMA,
      dataSource: 'local',
      presentation: {
        type: 'metric',
        isRecommended: true
      },
      component: () => import('./widgets/welcome-overview.vue')
    },
    {
      name: 'common.todayFocus',
      label: '今日关注',
      description: '汇总消息中心的未读提醒，快速查看需要关注的信息',
      icon: 'tsfont-star',
      group: { name: 'common.atmosphere', label: '公共组件 · 氛围与概况', sort: 5 },
      defaultLayout: { w: 4, h: 7, minW: 3, minH: 5 },
      config: { limit: 4 },
      configSchema: LIMIT_SCHEMA,
      dataSource: 'api',
      presentation: {
        type: 'list',
        isRecommended: true
      },
      component: () => import('./widgets/today-focus.vue')
    },
    {
      name: 'common.quickEntry',
      label: '快捷入口',
      description: '快速进入当前用户有权限的业务模块',
      icon: 'tsfont-lightning',
      group: { name: 'common.shortcuts', label: '公共组件 · 快捷访问', sort: 10 },
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
    },
    {
      name: 'common.notice',
      label: '系统通知',
      description: '平台公告、维护提醒与未读消息',
      icon: 'tsfont-bell-on',
      group: { name: 'common.information', label: '公共组件 · 消息提醒', sort: 20 },
      defaultLayout: { w: 4, h: 7, minW: 3, minH: 5 },
      config: { limit: 4 },
      configSchema: LIMIT_SCHEMA,
      dataMode: 'mock',
      moduleSafe: true,
      presentation: {
        type: 'list'
      },
      component: () => import('./widgets/system-notice.vue')
    },
    {
      name: 'common.recentAccess',
      label: '最近访问',
      description: '快速返回近期访问过的业务功能',
      icon: 'tsfont-history',
      group: { name: 'common.shortcuts', label: '公共组件 · 快捷访问', sort: 10 },
      defaultLayout: { w: 4, h: 7, minW: 3, minH: 5 },
      config: { limit: 5 },
      configSchema: LIMIT_SCHEMA,
      moduleSafe: true,
      dataSource: 'local',
      presentation: {
        type: 'list'
      },
      component: () => import('./widgets/recent-access.vue')
    },
    {
      name: 'common.calendar',
      label: '日历提醒',
      description: '查看近期日期和个人工作提醒',
      icon: 'tsfont-calendar',
      group: { name: 'common.information', label: '公共组件 · 消息提醒', sort: 20 },
      defaultLayout: { w: 4, h: 7, minW: 3, minH: 6 },
      config: { limit: 4 },
      configSchema: LIMIT_SCHEMA,
      dataMode: 'mock',
      moduleSafe: true,
      presentation: {
        type: 'timeline'
      },
      component: () => import('./widgets/calendar-reminder.vue')
    }
  ]
};

import { $t } from '@/resources/init.js';

// Framework 模块维护后台公共工作台组件的前端实现。
const LIMIT_SCHEMA = [
  { name: 'limit', label: $t('term.workbench.displaycount'), type: 'slider', min: 3, max: 12, step: 1, defaultValue: 6 }
];

const WELCOME_SCHEMA = [
  { name: 'showTime', label: $t('term.workbench.showcurrenttime'), type: 'switch', defaultValue: 1 }
];

export default {
  moduleGroup: 'framework',
  moduleName: $t('term.workbench.publicwidgets'),
  scopes: ['global', 'module'],
  widgetList: [
    {
      name: 'welcomeOverview',
      label: $t('term.workbench.welcomeoverview'),
      description: $t('term.workbench.welcomedescription'),
      icon: 'tsfont-day',
      group: { name: 'framework.atmosphere', label: $t('term.workbench.atmosphereandoverview'), sort: 5 },
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
      label: $t('term.workbench.quickaccess'),
      description: $t('term.workbench.quickaccessdescription'),
      icon: 'tsfont-lightning',
      group: { name: 'framework.shortcuts', label: $t('term.workbench.shortcutaccess'), sort: 10 },
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

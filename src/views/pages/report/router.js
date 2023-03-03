const refresh = () => import('@/views/pages/common/refresh.vue');
//const page404 = () => import('@/views/pages/common/404.vue');
const welcome = () => import('@/views/pages/common/welcome.vue');
const reportManage = () => import('./report/report-manage.vue');
const reportinstanceManage = () => import('./reportinstance/reportinstance-manage.vue');
const reportShow = () => import('./report/report-show.vue');
const reportinstanceShow = () => import('./report/reportinstance-show.vue');
const sendjobManage = () => import('./sendjob/sendjob-manage.vue');
const sendjobEdit = () => import('./sendjob/sendjob-edit.vue');
const demo = () => import('./demo/demo.vue');
const blackWhiteListManage = () => import('./config/blackwhitelist-manage.vue');
const statementEdit = () => import('./statement/statement-edit.vue');
const statementView = () => import('./statement/statement-view.vue');
const statementManage = () => import('./statement/statement-manage.vue');
export default [
  {
    path: '/',
    beforeEnter: (to, from, next) => {
      let defaultPage = '';
      try {
        const moduleList = JSON.parse(localStorage.getItem('moduleList'));
        defaultPage =
        moduleList.find(module => {
          return module.moduleId === MODULEID;
        }).defaultPage || '/welcome';
      } catch {
        defaultPage = '/welcome';
      }
      if (from.path === defaultPage) {
        next({ name: 'refresh', replace: true, query: { path: defaultPage} });
      } else {
        next({ path: defaultPage, replace: true});
      }
    },
    meta: {
      icon: 'ts-file'
    }
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: welcome
  },
  {
    path: '/refresh',
    name: 'refresh',
    component: refresh
  },
  {
    path: '/reportinstance-manage',
    name: 'reportinstance-manage',
    component: reportinstanceManage,
    meta: {
      title: '报表管理',
      ismenu: true,
      type: 'reportmanage',
      icon: 'ts-layout',
      authority: ['REPORT_BASE']
    }
  },
  {
    path: '/report-show/:id?',
    name: 'report-show',
    component: reportShow,
    meta: {
      title: '报表详情',
      ismenu: false,
      icon: 'ts-m-metrics',
      authority: ['REPORT_BASE']
    }
  },
  {
    path: '/report-manage',
    name: 'report-manage',
    component: reportManage,
    meta: {
      title: '报表模板管理',
      ismenu: true,
      type: 'reporttemplate',
      icon: 'ts-layout',
      authority: ['REPORT_TEMPLATE_MODIFY']
    }
  },
  {
    path: '/demo',
    name: 'demo',
    component: demo,
    meta: {
      title: 'demo 页面',
      ismenu: false,
      icon: 'ts-m-metrics',
      authority: ['REPORT_BASE']
    }
  },
  {
    path: '/reportinstance-show/:id?',
    name: 'reportinstance-show',
    component: reportinstanceShow,
    meta: {
      title: '报表详情',
      ismenu: false,
      icon: 'ts-m-metrics',
      authority: ['REPORT_BASE'],
      istitle: true
    }
  },
  {
    path: '/sendjob-manage',
    name: 'sendjob-manage',
    component: sendjobManage,
    meta: {
      title: '发送计划',
      ismenu: true,
      icon: 'ts-m-metrics',
      type: 'reportmanage',
      authority: ['REPORT_MODIFY']
    }
  },
  {
    path: '/sendjob-edit',
    name: 'sendjob-edit',
    component: sendjobEdit,
    meta: {
      title: '编辑发送计划',
      ismenu: false,
      authority: ['REPORT_BASE']
    }
  },
  {
    path: '/statement-edit/:id?',
    name: 'statement-edit',
    component: statementEdit,
    meta: {
      title: '大屏设计器',
      icon: 'tsfont-db',
      ismenu: false,
      authority: ['REPORT_STATEMENT_MODIFY']
    }
  },
  {
    path: '/statement-view/:id?',
    name: 'statement-view',
    component: statementView,
    meta: {
      title: '大屏详情',
      ismenu: false,
      authority: ['REPORT_BASE']
    }
  },
  {
    path: '/statement-manage',
    name: 'statement-manage',
    component: statementManage,
    meta: {
      title: '大屏管理',
      icon: 'tsfont-agent',
      ismenu: true,
      type: 'statementmanage',
      authority: ['REPORT_STATEMENT_MODIFY']
    }
  }
];

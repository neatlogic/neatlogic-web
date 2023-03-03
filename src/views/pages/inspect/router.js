const refresh = () => import('@/views/pages/common/refresh.vue');
const page404 = () => import('@/views/pages/common/404.vue');
const welcome = () => import('@/views/pages/common/welcome.vue');
const jobManage = () => import('./job/job-manage.vue'); // 巡检作业
const definitionManage = () => import('./definition/definition-manage.vue'); // 巡检定义
//const assetsInspection = () => import('./assetsInspect/assets-inspection.vue');
const assetsInspectionManage = () => import('./assetsInspect/assets-inspection-manage.vue');

const assetsDetai = () => import('./assetsInspect/assets-detail.vue');

const applicationDetai = () => import('./application/application-detail.vue');
const definitionDetail = () => import('./definition/definition-detail.vue');
const actionDetail = () => import('@/views/pages/autoexec/detail/action-detail.vue'); // 作业详情
const jobDetail = () => import('pages/autoexec/detail/job-detail.vue'); // 巡检作业详情
const scriptDetail = () => import('pages/autoexec/detail/script-detail.vue'); // 巡检作业详情
const runnerDetail = () => import('@/views/pages/autoexec/detail/runner-detail.vue'); //执行作业
const toolDetail = () => import('@/views/pages/autoexec/detail/tool-detail.vue'); //工具详情
const testDetail = () => import('@/views/pages/autoexec/detail/test-detail.vue'); //工具测试

const inspectResult = () => import('./job/inspect-result.vue'); // 巡检作业-巡检结果
const questionReport = () => import('./job/question-report.vue'); // 巡检作业-问题报告
const recentIssues = () => import('./recentIssues/recent-issues.vue'); // 最新问题
const ciEntityView = () => import('@/views/pages/cmdb/cientity/cientity-view.vue');//配置项详情
const ciEntityEdit = () => import('@/views/pages/cmdb/cientity/cientity-edit.vue');//配置项编辑

const applicationManage = () => import('./application/application-manage.vue');//应用巡检
const configfileManage = () => import('./configfile/configfile-manage.vue');
const configfileDetail = () => import('./configfile/configfile-detail.vue');
const configfileListManage = () => import('./configfile/configfile-list-manage.vue');

// 阈值规则
const RuleOfThresholdManage = () => import('./application/threshold/rule-of-threshold-manage.vue'); // 阈值规则
const RuleOfThresholdDetail = () => import('./application/threshold/rule-of-threshold-detail.vue'); // 阈值规则详情

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
        //通过跳转到中间路由,并立刻返回原路由,实现刷新路由页面的效果
        next({ name: 'refresh', replace: true, query: { path: defaultPage } });
      } else {
        next({ path: defaultPage, replace: true });
      }
    }
  },
  {
    path: '/refresh',
    name: 'refresh',
    component: refresh
  },
  {
    path: '/404',
    name: '404',
    component: page404,
    meta: {
      title: '页面不存在'
    }
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: welcome
  },
  {
    path: '/recent-issues-:recentIssuesId?',
    name: 'recent-issues',
    component: recentIssues,
    meta: {
      title: '最新问题',
      ismenu: false, // 在InspectResultMenu页面中，统一处理 
      icon: 'tsfont-baobiao',
      authority: 'INSPECT_BASE',
      sort: 1, // 排序第一个
      type: 'inspectResult'
    }
  },
  {
    path: '/configfile-list-manage',
    name: 'configfile-list-manage',
    component: configfileListManage,
    meta: {
      title: '文件变更记录',
      ismenu: false, // 在InspectResultMenu页面中，统一处理
      icon: 'tsfont-file-single',
      authority: 'INSPECT_BASE',
      type: 'inspectResult'
    }
  },
  {
    path: '/definition-manage',
    name: 'definition-manage',
    component: definitionManage,
    meta: {
      title: '巡检定义',
      ismenu: true,
      icon: 'tsfont-adjust',
      authority: 'INSPECT_MODIFY',
      type: 'inspectmanage'
    }
  },
  {
    path: '/definition-detail',
    name: 'definition-detail',
    component: definitionDetail,
    meta: {
      title: '巡检定义编辑',
      ismenu: false,
      authority: 'INSPECT_BASE'
    }
  },
  /*{
    path: '/assets-inspection',
    name: 'assets-inspection',
    component: assetsInspection,
    meta: {
      title: '资产巡检',
      ismenu: true,
      icon: 'tsfont-ip-list',
      authority: 'INSPECT_BASE',
      type: 'inspectmanage'
    }
  },*/
  {
    path: '/assets-inspection-manage',
    name: 'assets-inspection-manage',
    component: assetsInspectionManage,
    meta: {
      title: '资产巡检',
      ismenu: true,
      icon: 'tsfont-ip-list',
      authority: 'INSPECT_BASE',
      type: 'inspectmanage'
    }
  },
  {
    path: '/application-manage',
    name: 'application-manage',
    component: applicationManage,
    meta: {
      title: '应用巡检',
      ismenu: true,
      icon: 'tsfont-app',
      authority: 'INSPECT_BASE',
      type: 'inspectmanage'
    }
  },
  {
    path: '/application-detail-:id?',
    name: 'application-detail',
    component: applicationDetai,
    meta: {
      title: '应用清单详情',
      ismenu: false,
      authority: 'INSPECT_BASE'
    }
  },
  {
    path: '/assets-detail-:id?',
    name: 'assets-detail',
    component: assetsDetai,
    meta: {
      title: '应用巡检详情',
      ismenu: false,
      authority: 'INSPECT_BASE'
    }
  },
  {
    path: '/job-manage',
    name: 'job-manage',
    component: jobManage,
    meta: {
      title: '巡检作业',
      ismenu: true,
      icon: 'tsfont-history',
      authority: ['INSPECT_EXECUTE', 'INSPECT_SCHEDULE_EXECUTE'],
      type: 'inspectmanage'
    }
  },
  {
    path: '/inspect-result',
    name: 'inspect-result',
    component: inspectResult,
    meta: {
      title: '巡检结果',
      ismenu: false,
      icon: '',
      authority: 'INSPECT_BASE',
      type: 'inspectmanage'
    }
  },
  {
    path: '/question-report',
    name: 'question-report',
    component: questionReport,
    meta: {
      title: '问题报告',
      ismenu: false,
      icon: '',
      authority: 'INSPECT_BASE',
      type: 'inspectmanage'
    }
  },

  {
    path: '/action-detail',
    name: 'action-detail',
    component: actionDetail,
    meta: {
      title: '组合工具详情',
      ismenu: false,
      icon: 'tsfont-history',
      authority: 'INSPECT_BASE'
    }
  },
  {
    path: '/job-detail',
    name: 'job-detail',
    component: jobDetail,
    meta: {
      title: '作业详情',
      ismenu: false,
      icon: 'tsfont-history',
      authority: 'INSPECT_BASE'
    }
  },
  {
    path: '/script-detail',
    name: 'script-detail',
    component: scriptDetail,
    meta: {
      title: '作业详情',
      ismenu: false,
      icon: 'tsfont-history',
      authority: 'INSPECT_BASE'
    }
  },
  {
    path: '/ci/:ciId/cientity-view/:id?',
    name: 'cientity-view',
    component: ciEntityView,
    meta: {
      title: '配置项详情',
      ismenu: false,
      authority: 'CMDB_BASE'
    }
  },
  {
    path: '/ci/:ciId/cientity-edit/:id?',
    name: 'cientity-edit',
    component: ciEntityEdit,
    meta: {
      title: '配置项编辑',
      ismenu: false,
      authority: 'CMDB_BASE'
    }
  },
  {
    path: '/runner-detail',
    name: 'runner-detail',
    component: runnerDetail,
    meta: {
      title: '执行',
      ismenu: false,
      authority: ''
    }
  },
  {
    path: '/tool-detail',
    name: 'tool-detail',
    component: toolDetail,
    meta: {
      title: '工具库详情',
      ismenu: false,
      authority: 'AUTOEXEC_SCRIPT_SEARCH'
    }
  },
  {
    path: '/test-detail',
    name: 'test-detail',
    component: testDetail,
    meta: {
      title: '工具测试页面',
      ismenu: false,
      authority: 'AUTOEXEC_BASE'
    }
  },
  {
    path: '/configfile-manage',
    name: 'configfile-manage',
    component: configfileManage,
    meta: {
      title: '配置文件',
      ismenu: true,
      icon: 'tsfont-file-single',
      authority: 'INSPECT_BASE',
      type: 'inspectmanage'
    }
  },
  {
    path: '/configfile-detail',
    name: 'configfile-detail',
    component: configfileDetail,
    meta: {
      title: '配置文件',
      ismenu: false,
      icon: 'tsfont-file-single',
      authority: 'INSPECT_BASE',
      type: 'inspectmanage'
    }
  },
  {
    path: '/rule-of-threshold-manage',
    name: 'rule-of-threshold-manage',
    component: RuleOfThresholdManage,
    meta: {
      title: '阈值规则',
      ismenu: false,
      icon: 'tsfont-file-single',
      authority: 'INSPECT_BASE',
      type: 'inspectmanage'
    }
  },
  {
    path: '/rule-of-threshold-detail',
    name: 'rule-of-threshold-detail',
    component: RuleOfThresholdDetail,
    meta: {
      title: '阈值规则详情',
      ismenu: false,
      icon: 'tsfont-file-single',
      authority: 'INSPECT_BASE',
      type: 'inspectmanage'
    }
  }
];

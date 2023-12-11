const refresh = () => import('@/views/pages/common/refresh.vue');
const page404 = () => import('@/views/pages/common/404.vue');
const welcome = () => import('@/views/pages/common/welcome.vue');
const userManage = () => import('./users/user-manage.vue');
const roleManage = () => import('./users/role-manage.vue');
const teamManage = () => import('./users/team-manage.vue');
const userSetting = () => import('./users/user-setting.vue');
const authManage = () => import('./users/auth-manage.vue');
const apiManage = () => import('./api/api-manage.vue');
const auditOverview = () => import('./audit/audit-overview.vue');
const jobManage = () => import('./schedule/job-manage.vue');
const userAddview = () => import('./users/user-addview.vue');
const roleAddview = () => import('./users/role-addview.vue');
const authAdduser = () => import('./users/auth-adduser.vue');
const teamAddview = () => import('./users/team-addview.vue');
const integrationManage = () => import('./integration/integration-manage.vue');
// const mailserverEdit = () => import('./mailserver/mailserver-edit.vue');
const notifyConfigManage = () => import('./notifyconfig/notifyconfig-manage.vue');
const notifytacticsOverview = () => import('./notifytactics/notifytactics-overview.vue');
const notifytacticsEdit = () => import('./notifytactics/notifytactics-edit.vue');
const matrixOverview = () => import('./matrix/matrix-overview.vue');
const taskOvmatrixEditerview = () => import('./matrix/matrix-edit.vue');
const matrixExternaledit = () => import('./matrix/matrix-external-edit.vue');
const matrixViewedit = () => import('./matrix/matrix-view-edit.vue');
const matrixPrivate = () => import('./matrix/matrix-private.vue'); //私有数据源
const timingTaskEdit = () => import('./notifytactics/tacticsedit/timing-task-edit.vue');
const subscriptionSetting = () => import('./message/subscription-setting.vue');
const noticeManage = () => import('./notice/notice-manage.vue');
const historyOverview = () => import('./history/history-overview.vue');
const formEditOld = () => import('./form/form-edit.vue');
const formEdit = () => import('@/resources/plugins/TsSheet/form-edit.vue');
const formSceneEdit = () => import('@/resources/plugins/TsSheet/form-scene-edit.vue'); //表单场景
const formOverview = () => import('./form/form-overview.vue');
const worktimeManage = () => import('./worktime/worktime-manage.vue');
const mqOverview = () => import('./mq/mq-overview.vue');
const fullTextIndexManage = () => import('./fulltextindex/fulltextindex-manage.vue');

const tagentManage = () => import('./tagent/tagent-manage.vue'); // tagent 管理
const tagentAdd = () => import('./tagent/tagent-add.vue'); // tagent组管理
const BatchUpgrade = () => import('./tagent/tagent/batch-upgrade.vue'); // tagent管理/批量升级
const InstallationPackage = () => import('./tagent/tagent/installation-package.vue'); // tagent管理/安装包管理
const runnerManage = () => import('./tagent/runner/runner-manage.vue'); // runner管理

const threaddump = () => import('./healthcheck/threaddump.vue');
const sqldump = () => import('./healthcheck/sqldump.vue');
const databaseFragment = () => import('./healthcheck/database-fragment.vue');

const dataWarehouseManage = () => import('./datawarehouse/datawarehouse-manage.vue');
const fileManage = () => import('./file/file-manage.vue');
const themeManage = () => import('./theme/theme-manage.vue');

const licenseManage = () => import('./license/license-manage.vue');

const moduleManage = () => import('./module/module-manage.vue');
const batchOperation = () => import('./tagent/tagent/batch-operation.vue'); // 批量操作
const databaseViewManage = () => import('./databaseview/databaseview-manage.vue'); //重建视图
const tenantConfigManage = () => import('./tenantconfig/tenantconfig-manage.vue'); // 租户配置信息管理
const serverManage = () => import('./server/server-manage.vue'); // 服务器管理
const importExportManage = () => import('./importexport/importexport-manage.vue'); // 导入导出管理

import { $t } from '@/resources/init.js';

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
      title: $t('page.pagenotvalid')
    }
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: welcome
  },
  {
    path: '/user-manage',
    name: 'user-manage',
    component: userManage,
    meta: {
      title: $t('router.framework.usermanage'),
      ismenu: true,
      icon: 'tsfont-user-s',
      authority: 'USER_MODIFY',
      type: 'user',
      isBack: false
    }
  },
  {
    path: '/role-manage',
    name: 'role-manage',
    component: roleManage,
    meta: {
      title: $t('router.framework.rolemanage'),
      ismenu: true,
      icon: 'tsfont-role',
      authority: 'ROLE_MODIFY',
      type: 'user',
      isBack: false
    }
  },
  {
    path: '/team-manage',
    name: 'team-manage',
    component: teamManage,
    meta: {
      title: $t('router.framework.teammanage'),
      ismenu: true,
      icon: 'tsfont-team-s',
      authority: 'TEAM_MODIFY',
      type: 'user',
      isBack: false
    }
  },
  {
    path: '/auth-manage',
    name: 'auth-manage',
    component: authManage,
    meta: {
      title: $t('router.framework.authmanage'),
      ismenu: true,
      icon: 'tsfont-security',
      authority: 'AUTHORITY_MODIFY',
      type: 'user',
      isBack: false
    }
  },
  {
    path: '/user-addview/',
    name: 'user-addview',
    component: userAddview,
    meta: {
      title: $t('router.framework.useraddview'),
      ismenu: false,
      icon: ''
    }
  },
  {
    path: '/worktime-manage',
    name: 'worktime-manage',
    component: worktimeManage,
    meta: {
      title: $t('router.framework.worktimemanage'),
      ismenu: true,
      icon: 'tsfont-sla',
      authority: 'WORKTIME_MODIFY',
      type: 'user'
    }
  },
  {
    path: '/user-setting',
    name: 'user-setting',
    component: userSetting,
    meta: {
      title: $t('router.framework.usersetting'),
      ismenu: false,
      icon: 'tsfont-user-setting',
      authority: '',
      type: 'user'
    }
  },
  {
    path: '/role-addview/',
    name: 'role-addview',
    component: roleAddview,
    meta: {
      title: $t('router.framework.roleaddview'),
      ismenu: false,
      icon: ''
    }
  },
  {
    path: '/auth-adduser/',
    name: 'auth-adduser',
    component: authAdduser,
    meta: {
      title: $t('router.framework.authadduser'),
      ismenu: false,
      icon: ''
    }
  },
  {
    path: '/team-addview/',
    name: 'team-addview',
    component: teamAddview,
    meta: {
      title: $t('router.framework.teamaddview'),
      ismenu: false,
      icon: ''
    }
  },
  {
    path: '/matrix-overview',
    name: 'matrix-overview',
    component: matrixOverview,
    meta: {
      title: $t('router.framework.matrixmanage'),
      ismenu: true,
      icon: 'tsfont-apps',
      authority: 'MATRIX_MODIFY',
      type: 'integration'
    }
  },
  {
    path: '/matrix-edit',
    name: 'matrix-edit',
    component: taskOvmatrixEditerview,
    meta: {
      title: $t('router.framework.matrixedit'),
      ismenu: false,
      authority: 'MATRIX_MODIFY',
      type: 'integration'
    }
  },
  {
    path: '/matrix-external-edit',
    name: 'matrix-external-edit',
    component: matrixExternaledit,
    meta: {
      title: $t('router.framework.matrixedit'),
      ismenu: false,
      authority: 'MATRIX_MODIFY',
      type: 'integration'
    }
  },
  {
    path: '/matrix-view-edit',
    name: 'matrix-view-edit',
    component: matrixViewedit,
    meta: {
      title: $t('router.framework.matrixedit'),
      ismenu: false,
      authority: 'MATRIX_MODIFY',
      type: 'integration'
    }
  },
  {
    path: '/matrix-private',
    name: 'matrix-private',
    component: matrixPrivate,
    meta: {
      title: $t('router.framework.matrixedit'),
      ismenu: false,
      authority: 'MATRIX_MODIFY',
      type: 'integration'
    }
  },
  {
    path: '/form-edit',
    name: 'form-edit',
    component: formEdit,
    meta: {
      title: $t('router.framework.formedit'),
      ismenu: false,
      icon: 'tsfont-formlist',
      authority: 'FORM_MODIFY',
      type: 'integration'
    }
  },
  {
    path: '/form-edit-old',
    name: 'form-edit-old',
    component: formEditOld,
    meta: {
      title: $t('router.framework.formedit'),
      ismenu: false,
      icon: 'tsfont-formlist',
      authority: 'FORM_MODIFY',
      type: 'integration'
    }
  },
  {
    path: '/form-scene-edit',
    name: 'formSceneEdit',
    component: formSceneEdit,
    meta: {
      title: $t('router.framework.formsceneedit'),
      ismenu: false,
      icon: 'tsfont-scene',
      authority: 'FORM_MODIFY',
      type: 'integration'
    }
  },
  {
    path: '/form-overview',
    name: 'form-overview',
    component: formOverview,
    meta: {
      title: $t('router.framework.formmanage'),
      ismenu: true,
      icon: 'tsfont-formlist',
      authority: 'FORM_MODIFY',
      type: 'integration'
    }
  },
  {
    path: '/integration-manage',
    name: 'integration-manage',
    component: integrationManage,
    meta: {
      title: $t('router.framework.integrationmanage'),
      ismenu: true,
      icon: 'tsfont-integration',
      authority: 'INTEGRATION_MODIFY',
      type: 'integration'
    }
  },
  {
    path: '/datawarehouse-manage',
    name: 'datawarehouse-manage',
    component: dataWarehouseManage,
    meta: {
      title: $t('router.framework.datawarehousemanage'),
      icon: 'tsfont-db',
      ismenu: true,
      type: 'integration',
      authority: ['DATA_WAREHOUSE_MODIFY']
    }
  },
  {
    path: '/history-overview',
    name: 'history-overview',
    component: historyOverview,
    meta: {
      title: $t('router.framework.historymanage'),
      ismenu: true,
      icon: 'tsfont-history',
      authority: '',
      type: 'message'
    }
  },
  {
    path: '/subscription-setting',
    name: 'subscription-setting',
    component: subscriptionSetting,
    meta: {
      title: $t('router.framework.subscriptionsetting'),
      ismenu: true,
      icon: 'tsfont-label',
      authority: '',
      type: 'message'
    }
  },
  {
    path: '/notice-manage',
    name: 'notice-manage',
    component: noticeManage,
    meta: {
      title: $t('router.framework.noticemanage'),
      ismenu: true,
      icon: 'tsfont-bell',
      authority: 'SYSTEM_NOTICE_MODIFY',
      type: 'message'
    }
  },
  // {
  //   path: '/mailserver-edit',
  //   name: 'mailserver-edit',
  //   component: mailserverEdit,
  //   meta: {
  //     title: $t('router.framework.mailserveredit'),
  //     ismenu: true,
  //     icon: 'tsfont-mail-s',
  //     authority: 'MAIL_SERVER_MODIFY',
  //     type: 'notify'
  //   }
  // },
  {
    path: '/notifyconfig-manage',
    name: 'notifyconfig-manage',
    component: notifyConfigManage,
    meta: {
      title: $t('router.framework.notifyconfigmanage'),
      ismenu: true,
      icon: 'tsfont-mail-s',
      authority: 'NOTIFY_CONFIG_MODIFY',
      type: 'notify'
    }
  },
  {
    path: '/notifytactics-overview',
    name: 'notifytactics-overview',
    component: notifytacticsOverview,
    meta: {
      title: $t('router.framework.notifytacticsmanage'),
      ismenu: true,
      icon: 'tsfont-celve',
      authority: 'NOTIFY_POLICY_MODIFY',
      type: 'notify'
    }
  },
  {
    path: '/notifytactics-edit',
    name: 'notifytactics-edit',
    component: notifytacticsEdit,
    meta: {
      title: $t('router.framework.notifytacticsedit'),
      ismenu: false,
      authority: 'NOTIFY_POLICY_MODIFY',
      type: 'notify'
    }
  },
  {
    path: '/mq-overview',
    name: 'mq-overview',
    component: mqOverview,
    meta: {
      title: $t('router.framework.mqmanage'),
      ismenu: true,
      icon: 'tsfont-bind',
      authority: 'MQ_MODIFY',
      type: 'notify'
    }
  },
  {
    path: '/timing-task-edit',
    name: 'timing-task-edit',
    component: timingTaskEdit,
    meta: {
      title: $t('router.framework.timingtaskedit'),
      ismenu: false,
      authority: '',
      type: 'others'
    }
  },
  {
    path: '/tagent-manage',
    name: 'tagentManage',
    component: tagentManage,
    meta: {
      title: $t('router.framework.tagentmanage'),
      ismenu: true,
      icon: 'tsfont-agent',
      authority: 'TAGENT_BASE',
      type: 'others'
    }
  },
  {
    path: '/theme-manage',
    name: 'theme-manage',
    component: themeManage,
    meta: {
      title: $t('router.framework.thememanage'),
      ismenu: true,
      icon: 'tsfont-theme',
      authority: 'THEME_MODIFY',
      type: 'others'
    }
  },

  {
    path: '/batch-upgrade',
    name: 'BatchUpgrade',
    component: BatchUpgrade,
    meta: {
      title: $t('router.framework.batchupgrade'),
      ismenu: false,
      icon: '',
      authority: 'TAGENT_BASE',
      type: 'others'
    }
  },
  {
    path: '/installation-package',
    name: 'InstallationPackage',
    component: InstallationPackage,
    meta: {
      title: $t('router.framework.packagemanage'),
      ismenu: false,
      icon: '',
      authority: 'TAGENT_BASE',
      type: 'others'
    }
  },
  {
    path: '/tagent-add',
    name: 'tagentAdd',
    component: tagentAdd,
    meta: {
      title: $t('router.framework.tagentadd'),
      ismenu: true,
      icon: 'tsfont-ip-object',
      authority: 'RUNNER_MODIFY',
      type: 'others'
    }
  },

  {
    path: '/runner-manage',
    name: 'runnerManage',
    component: runnerManage,
    meta: {
      title: $t('router.framework.runnermanage'),
      ismenu: false,
      icon: 'tsfont-ip-object',
      authority: 'RUNNER_MODIFY',
      type: 'others'
    }
  },
  {
    path: '/api-manage',
    name: 'api-manage',
    component: apiManage,
    meta: {
      title: $t('router.framework.apimanage'),
      ismenu: true,
      icon: 'tsfont-restful',
      authority: 'INTERFACE_MODIFY',
      type: 'others'
    }
  },
  {
    path: '/audit-overview',
    name: 'audit-overview',
    component: auditOverview,
    meta: {
      title: $t('router.framework.auditmanage'),
      ismenu: true,
      icon: 'tsfont-center',
      authority: 'API_AUDIT_VIEW',
      type: 'others'
    }
  },
  {
    path: '/job-manage',
    name: 'job-manage',
    component: jobManage,
    meta: {
      title: $t('router.framework.jobmanage'),
      ismenu: true,
      icon: 'tsfont-timer',
      authority: 'SCHEDULE_JOB_MODIFY',
      type: 'others'
    }
  },
  {
    path: '/file-manage',
    name: 'file-manage',
    component: fileManage,
    meta: {
      title: $t('router.framework.filemanage'),
      ismenu: true,
      icon: 'tsfont-file-multi',
      authority: 'FILE_MODIFY',
      type: 'others'
    }
  },
  {
    path: '/fulltextindex-manage',
    name: 'fulltextindex-manage',
    component: fullTextIndexManage,
    meta: {
      title: $t('router.framework.fullTextIndexmanage'),
      ismenu: true,
      icon: 'tsfont-node',
      authority: 'FULLTEXTINDEX_MODIFY',
      type: 'others'
    }
  },
  {
    path: '/databaseview-manage',
    name: 'databaseview-manage',
    component: databaseViewManage,
    meta: {
      title: $t('router.framework.databaseView'),
      ismenu: true,
      icon: 'tsfont-setting',
      authority: 'ADMIN',
      type: 'others'
    }
  },
  {
    path: '/module-manage',
    name: 'module-manage',
    component: moduleManage,
    meta: {
      title: $t('router.framework.modulemanage'),
      ismenu: true,
      icon: 'tsfont-application_module',
      authority: 'MODULE_MODIFY',
      type: 'others'
    }
  },
  {
    path: '/tenantconfig-manage',
    name: 'tenantconfig-manage',
    component: tenantConfigManage,
    meta: {
      title: $t('router.framework.tenantconfigmanage'),
      ismenu: true,
      icon: 'tsfont-config',
      authority: 'ADMIN',
      type: 'others'
    }
  },
  {
    path: '/server-manage',
    name: 'server-manage',
    component: serverManage,
    meta: {
      title: $t('router.framework.servermanage'),
      ismenu: true,
      icon: 'tsfont-config',
      authority: 'ADMIN',
      type: 'others'
    }
  },
  {
    path: '/importexport-manage',
    name: 'importexport-manage',
    component: importExportManage,
    meta: {
      title: '导入导出测试',
      ismenu: true,
      icon: 'tsfont-config',
      authority: 'ADMIN',
      type: 'others'
    }
  },
  {
    path: '/threaddump',
    name: 'threaddump',
    component: threaddump,
    meta: {
      title: $t('router.framework.threaddump'),
      ismenu: true,
      icon: 'tsfont-horizontal-right',
      authority: 'ADMIN',
      type: 'healthcheck'
    }
  },
  {
    path: '/sqldump',
    name: 'sqldump',
    component: sqldump,
    meta: {
      title: $t('router.framework.sqldump'),
      ismenu: true,
      icon: 'tsfont-sla',
      authority: 'ADMIN',
      type: 'healthcheck'
    }
  },
  {
    path: '/databasefragment',
    name: 'databasefragment',
    component: databaseFragment,
    meta: {
      title: $t('router.framework.databasefragment'),
      ismenu: true,
      icon: 'tsfont-plugin',
      authority: 'ADMIN',
      type: 'healthcheck'
    }
  },
  {
    path: '/license-manage',
    name: 'licenseManage',
    component: licenseManage,
    meta: {
      title: $t('router.framework.licensemanage'),
      ismenu: true,
      icon: 'tsfont-plugin',
      authority: 'ADMIN',
      type: 'license'
    }
  },
  {
    path: '/batch-operation',
    name: 'batchOperation',
    component: batchOperation,
    meta: {
      title: $t('router.framework.batchoperation'),
      ismenu: false,
      icon: '',
      authority: 'TAGENT_BASE',
      type: 'others'
    }
  }
];

const refresh = () => import('@/views/pages/common/refresh.vue');
//const page404 = () => import('@/views/pages/common/404.vue');
const welcome = () => import('@/views/pages/common/welcome.vue');
const ciDetail = () => import('./ci/ci-detail.vue');
const ciEdit = () => import('./ci/ci-edit.vue');
const ciView = () => import('./cientity/ci-view.vue');
const ciManage = () => import('./ci/ci-manage.vue');
const ciEntityEdit = () => import('./cientity/cientity-edit.vue');
const ciEntityView = () => import('./cientity/cientity-view.vue');
const ciEntityList = () => import('./cientity/cientity-list.vue');
const ciEntityEditBatch = () => import('./cientity/cientity-edit-batch.vue');
const ciTopo = () => import('./ci/ci-topo.vue');
const viewEdit = () => import('./customview/view-edit.vue');
const viewData = () => import('./customview/view-data.vue');
const viewDetail = () => import('./customview/view-detail.vue');
const relTypeManage = () => import('./reltype/reltype-manage.vue');
const batchImport = () => import('./batch-import/batch-import.vue');
const ciEntityManage = () => import('./cientity/cientity-manage.vue');
const customViewManage = () => import('./customview/customview-manage.vue');
const assetManage = () => import('./asset/asset-manage.vue');
const accountManage = () => import('./account/account-manage.vue');
const applicationManage = () => import('./application/application-manage.vue');
const tagManage = () => import('./Tag/tag-manage.vue');
const syncCiCollectionManage = () => import('./sync/sync-manage.vue');
//const syncWizard = () => import('./sync/sync-wizard.vue');
const validatorManage = () => import('./validator/validator-manage.vue');
const groupManage = () => import('./group/group-manage.vue');
const syncAuditManage = () => import('./sync/sync-audit-manage.vue');
const transactionManage = () => import('./transaction/transaction-manage.vue');
//const dataInit = () => import('./data-init/data-init.vue'); // 数据初始化
const globalSearch = () => import('./globalsearch/global-search.vue'); //全局搜索
const dslTest = () => import('./globalsearch/dsl-test.vue');
const discoveryManage = () => import('./discovery/discovery-manage.vue'); //自动发现管理
const discoveryData = () => import('./discovery/discovery-data.vue'); //自动发现数据管理
const discoverRuleManage = () => import('./discovery/discovery-rule-manage.vue'); //自动发现规则管理
const unknownManage = () => import('./discovery/unknown-manage.vue'); //位置设备管理
const discoveryConfManage = () => import('./discovery/discovery-conf-manage.vue'); //自动发现配置管理
const discoveryJobManage = () => import('./discovery/discovery-job-manage.vue'); //自动发现作业列表
const discoveryJobDetail = () => import('pages/autoexec/detail/job-detail.vue'); // 自动发现作业详情
const resourceEntityManage = () => import('./resourceentity/resourceentity-manage.vue');
const inspectStatusDetail = () => import('./application/inspect-status-detail.vue'); // 巡检状态详情
const graphEdit = () => import('./graph/graph-edit.vue');
const graphData = () => import('./graph/graph-data.vue');
const alertLevelManage = () => import('./alertlevel/alertlevel-manage.vue');
import {$t} from '@/resources/init.js';
let routerArr = [
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
        next({ name: 'refresh', replace: true, query: { path: defaultPage } });
      } else {
        next({ path: defaultPage, replace: true });
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
    path: '/global-search',
    name: 'global-search',
    component: globalSearch,
    meta: {
      title: $t('router.cmdb.globalsearch'),
      ismenu: true,
      type: 'cientitymanage',
      authority: 'CMDB_BASE',
      icon: 'tsfont-search'
    }
  },
  {
    path: '/cientity-manage',
    name: 'cientity-manage',
    component: ciEntityManage,
    meta: {
      title: $t('router.cmdb.searchcientity'),
      ismenu: true,
      type: 'cientitymanage',
      authority: 'CMDB_BASE',
      icon: 'ts-listsetting'
    }
  },
  {
    path: '/batch-import',
    name: 'batch-import',
    component: batchImport,
    meta: {
      title: $t('router.cmdb.batchimport'),
      ismenu: true,
      type: 'cientitymanage',
      icon: 'tsfont-batch-upload',
      authority: 'CIENTITY_BATCH_IMPORT'
    }
  },
  {
    path: '/transaction-manage',
    name: 'transaction-manage',
    component: transactionManage,
    meta: {
      title: $t('router.cmdb.transactionaudit'),
      ismenu: true,
      type: 'cientitymanage',
      icon: 'tsfont-eoa',
      authority: 'TRANSACTION_MANAGE'
    }
  },
  {
    path: '/application-manage',
    name: 'application-manage',
    component: applicationManage,
    meta: {
      type: 'resourceCenter',
      title: $t('router.cmdb.applicationlist'),
      ismenu: true,
      icon: 'tsfont-app',
      authority: 'RESOURCECENTER_BASE'
    }
  },
  {
    path: '/asset-manage',
    name: 'asset-manage',
    component: assetManage,
    meta: {
      title: $t('router.cmdb.assetlist'),
      ismenu: true,
      type: 'resourceCenter',
      icon: 'tsfont-ip-list',
      authority: 'RESOURCECENTER_BASE'
    }
  },
  {
    path: '/tag-manage',
    name: 'tag-manage',
    component: tagManage,
    meta: {
      type: 'resourceCenter',
      title: $t('router.cmdb.tagmanage'),
      ismenu: true,
      icon: 'ts-tag',
      authority: 'RESOURCECENTER_TAG_MODIFY'
    }
  },
  {
    path: '/account-manage',
    name: 'account-manage',
    component: accountManage,
    meta: {
      type: 'resourceCenter',
      title: $t('router.cmdb.accountmanage'),
      ismenu: true,
      icon: 'tsfont-taskperson',
      authority: 'RESOURCECENTER_ACCOUNT_MODIFY'
    }
  },
  {
    path: '/resourceentity-manage',
    name: 'resourceentity-manage',
    component: resourceEntityManage,
    meta: {
      title: $t('router.cmdb.viewmanage'),
      ismenu: true,
      type: 'resourceCenter',
      icon: 'tsfont-setting',
      authority: 'RESOURCECENTER_MODIFY'
    }
  },
  {
    path: '/discovery-manage',
    name: 'discovery-manage',
    component: discoveryManage,
    meta: {
      title: $t('router.cmdb.discoverymanage'),
      ismenu: true,
      type: 'discovery',
      icon: 'tsfont-peizhiguanli',
      authority: 'SYNC_MODIFY'
    }
  },
  {
    path: '/discovery-conf-manage',
    name: 'discovery-conf-manage',
    component: discoveryConfManage,
    meta: {
      title: $t('router.cmdb.discoveryconfig'),
      ismenu: true,
      type: 'discovery',
      icon: 'tsfont-cluster',
      authority: 'SYNC_MODIFY'
    }
  },
  {
    path: '/discovery-job-manage',
    name: 'discovery-job-manage',
    component: discoveryJobManage,
    meta: {
      title: $t('router.cmdb.discoveryjobmanage'),
      ismenu: false,
      type: 'discovery'
    }
  },
  {
    path: '/discovery-job-detail',
    name: 'discovery-job-detail',
    component: discoveryJobDetail,
    meta: {
      title: $t('router.cmdb.discoveryjobdetail'),
      ismenu: false,
      type: 'discovery'
    }
  },
  {
    path: '/discovery-data/:collection?',
    name: 'discovery-data',
    component: discoveryData,
    meta: {
      title: $t('router.cmdb.discoverydata'),
      ismenu: false,
      type: 'discovery',
      authority: 'SYNC_MODIFY'
    }
  },
  {
    path: '/unknown-manage',
    name: 'unknown-manage',
    component: unknownManage,
    meta: {
      title: $t('router.cmdb.unknownmanage'),
      ismenu: false,
      type: 'discovery',
      authority: 'SYNC_MODIFY'
    }
  },
  {
    path: '/discovery-rule-manage',
    name: 'discovery-rule-manage',
    component: discoverRuleManage,
    meta: {
      title: $t('router.cmdb.discoveryrulemanage'),
      ismenu: false,
      type: 'discovery',
      authority: 'SYNC_MODIFY'
    }
  },
  {
    path: '/ci-manage',
    name: 'ci-manage',
    component: ciManage,
    meta: {
      title: $t('router.cmdb.cimanage'),
      ismenu: true,
      type: 'cmdbmanage',
      icon: 'tsfont-module',
      authority: 'CI_MODIFY'
    }
  },
  {
    path: '/group-manage',
    name: 'group-manage',
    component: groupManage,
    meta: {
      title: $t('router.cmdb.groupmanage'),
      ismenu: true,
      type: 'cmdbmanage',
      icon: 'tsfont-group',
      authority: 'GROUP_MODIFY'
    }
  },
  {
    path: '/validator-manage',
    name: 'validator-manage',
    component: validatorManage,
    meta: {
      title: $t('router.cmdb.validatormanage'),
      ismenu: true,
      type: 'cmdbmanage',
      icon: 'tsfont-check-o',
      authority: 'CI_MODIFY'
    }
  },
  {
    path: '/sync-manage/:collectionType/:collection?',
    name: 'sync-manage',
    component: syncCiCollectionManage,
    meta: {
      title: $t('router.cmdb.syncmanage'),
      ismenu: false,
      type: 'cmdbmanage',
      icon: 'tsfont-auto',
      authority: 'SYNC_MODIFY'
    }
  },
  {
    path: '/customview-manage',
    name: 'customview-manage',
    component: customViewManage,
    meta: {
      title: $t('router.cmdb.customviewmanage'),
      ismenu: true,
      type: 'cmdbmanage',
      icon: 'tsfont-component',
      authority: 'CUSTOMVIEW_MODIFY'
    }
  },
  /*{
    path: '/sync-wizard',
    name: 'sync-wizard',
    component: syncWizard,
    meta: {
      title: '自动采集管理',
      ismenu: true,
      type: 'cmdbmanage',
      icon: 'tsfont-auto',
      authority: 'SYNC_MODIFY'
    }
  },*/
  {
    path: '/reltype-manage',
    name: 'reltype-manage',
    component: relTypeManage,
    meta: {
      title: $t('router.cmdb.reltypemanage'),
      ismenu: true,
      type: 'cmdbmanage',
      icon: 'tsfont-node',
      authority: 'RELTYPE_MODIFY'
    }
  },
  {
    path: '/alertlevel/manage',
    name: 'alertlevel-manage',
    component: alertLevelManage,
    meta: {
      title: $t('router.cmdb.alertlevelmanage'),
      ismenu: true,
      type: 'cmdbmanage',
      icon: 'tsfont-warning-s',
      authority: 'ALERTLEVEL_MODIFY'
    }
  },
  {
    path: '/ci-detail/:id?',
    name: 'ci-detail',
    component: ciDetail,
    meta: {
      title: $t('router.cmdb.cidetail'),
      authority: 'CMDB_BASE'
    }
  },

  {
    path: '/ci-view/:id?',
    name: 'ci-view',
    component: ciView,
    meta: {
      title: $t('router.cmdb.ciview'),
      ismenu: false,
      authority: 'CMDB_BASE'
    }
  },
  {
    path: '/ci/:ciId/cientity-edit/:id?',
    name: 'cientity-edit',
    component: ciEntityEdit,
    meta: {
      title: $t('router.cmdb.cientityedit'),
      ismenu: false,
      authority: 'CMDB_BASE'
    }
  },
  {
    path: '/ci/:ciId/cientity-edit-batch/:ciEntityIdList',
    name: 'cientity-edit-batch',
    component: ciEntityEditBatch,
    meta: {
      title: $t('router.cmdb.cientitybatchedit'),
      ismenu: false,
      authority: 'CMDB_BASE'
    }
  },
  {
    path: '/ci/:ciId/cientity-view/:id?',
    name: 'cientity-view',
    component: ciEntityView,
    meta: {
      title: $t('router.cmdb.cientityview'),
      ismenu: false,
      authority: 'CMDB_BASE'
    }
  },
  {
    path: '/ci/:ciId/cientity-list',
    name: 'cientity-list',
    component: ciEntityList,
    meta: {
      title: $t('router.cmdb.cientitylist'),
      ismenu: false,
      authority: 'CMDB_BASE'
    }
  },
  {
    path: '/ci/topo',
    name: 'ci-topo',
    component: ciTopo,
    meta: {
      title: $t('router.cmdb.citopo'),
      ismenu: false,
      authority: 'CMDB_BASE'
    }
  },
  {
    path: '/view-data/:id?',
    name: 'view-data',
    component: viewData,
    meta: {
      title: $t('router.cmdb.viewdata'),
      ismenu: false,
      authority: 'CMDB_BASE'
    }
  },
  {
    path: '/view-detail/:id/:ciEntityId',
    name: 'view-detail',
    component: viewDetail,
    meta: {
      title: $t('router.cmdb.viewdetail'),
      ismenu: false,
      authority: 'CMDB_BASE'
    }
  },
  {
    path: '/view-edit/public/:id?',
    name: 'view-edit-public',
    component: viewEdit,
    meta: {
      title: $t('router.cmdb.viewedit'),
      ismenu: false,
      authority: 'CUSTOMVIEW_MODIFY'
    }
  },
  {
    path: '/view-edit/private/:id?',
    name: 'view-edit-private',
    component: viewEdit,
    meta: {
      title: $t('router.cmdb.viewedit'),
      ismenu: false,
      authority: 'CMDB_BASE'
    }
  },
  {
    path: '/sync-audit-manage/:id?',
    name: 'sync-audit-manage',
    component: syncAuditManage,
    meta: {
      title: $t('router.cmdb.syncauditmanage'),
      ismenu: false,
      authority: 'CMDB_BASE'
    }
  },
  {
    path: '/dsl-test',
    name: 'dsl-test',
    component: dslTest,
    meta: {
      title: $t('router.cmdb.dsltest'),
      ismenu: false,
      authority: 'CMDB_BASE'
    }
  },
  {
    path: '/inspect-status-detail-:id?',
    name: 'inspect-status-detail',
    component: inspectStatusDetail,
    meta: {
      title: $t('router.cmdb.inspectstatus'),
      ismenu: false,
      authority: ['CMDB_BASE', 'INSPECT_BASE']
    }
  },
  {
    path: '/graph-edit/public/:id?',
    name: 'graph-edit-public',
    component: graphEdit,
    meta: {
      title: $t('router.cmdb.graphedit'),
      ismenu: false,
      authority: 'GRAPH_MODIFY'
    }
  },
  {
    path: '/graph-edit/private/:id?',
    name: 'graph-edit-private',
    component: graphEdit,
    meta: {
      title: $t('router.cmdb.graphedit'),
      ismenu: false,
      authority: 'CMDB_BASE'
    }
  },
  {
    path: '/graph-edit/:id',
    name: 'graph-edit',
    component: graphEdit,
    meta: {
      title: $t('router.cmdb.graphedit'),
      ismenu: false,
      authority: 'CMDB_BASE'
    }
  },
  {
    path: '/graph-data/:id?',
    name: 'graph-data',
    component: graphData,
    meta: {
      title: $t('router.cmdb.graphdata'),
      ismenu: false,
      authority: 'CMDB_BASE'
    }
  },
  {
    path: '/graph-datav2/:id?',
    name: 'graph-data-beta',
    component: graphData,
    meta: {
      title: $t('router.cmdb.graphdata'),
      ismenu: false,
      authority: 'CMDB_BASE'
    }
  }
];

export default routerArr;

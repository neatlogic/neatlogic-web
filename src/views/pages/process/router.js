const refresh = () => import('@/views/pages/common/refresh.vue');
const noAuthority = () => import('@/views/pages/common/no-authority.vue');
const welcome = () => import('@/views/pages/common/welcome.vue');
//const taskOverview = () => import('./task/task-overview.vue');
const catalogOverview = () => import('./catalog/catalog-overview.vue');
const catalogManage = () => import('./catalog/catalog-manage.vue');
const taskDispatch = () => import('./task/task-dispatch.vue');
const taskBatchDispatch = () => import('./task/task-batch-dispatch');
const taskDetail = () => import('./task/task-detail.vue');
const flowOverview = () => import('./flow/flow-overview.vue');
const flowEdit = () => import('./flow/flow-edit.vue');
const slaManage = () => import('./sla/sla-manage.vue');
const priorityManage = () => import('./priority/priority-manage.vue');
const nodeManage = () => import('./node/node-manage.vue');
const channeltypeManage = () => import('./channeltype/channeltype-manage.vue');
const changeOverview = () => import('./change/change-overview.vue');
const changeEdit = () => import('./change/change-edit.vue');
const eventTypeManage = () => import('./event/eventType/event-type-manage.vue');
const eventSolutionManage = () => import('./event/eventSolution/event-solution-manage.vue');
const eventSolutionEdit = () => import('./event/eventSolution/event-solution-edit.vue');
const scoreTemplateManage = () => import('./scoreTemplate/score-template-manage.vue');
const relationsManage = () => import('./relations/relations-manage.vue');
const subtaskTypeManage = () => import('./subtask/subtasktype-manage.vue');
//新流程图demo
const flowDemo = () => import('./flowdemo/flow-demo.vue');
const replyManage = () => import('./replytemplate/reply-manage.vue');
const ProcessTaskManage = () => import('./task/processtask-manage.vue');
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
    path: '/no-authority',
    name: 'no-authority',
    component: noAuthority,
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
    path: '/task-overview-:taskTypeid?',
    name: 'task-overview',
    component: ProcessTaskManage,
    meta: {
      title: $t('router.process.workordercenter'),
      ismenu: true,
      icon: 'tsfont-task',
      authority: 'PROCESS_BASE',
      type: 'task',
      keepAlive: false,
      isBack: false,
      istitle: true
    }
  },
  /* {
    path: '/task-overview-:taskTypeid',
    name: 'task-overview',
    component: taskOverview,
    meta: {
      title: '工单中心',
      ismenu: false,
      icon: 'tsfont-task',
      authority: 'PROCESS_BASE',
      type: 'task',
      keepAlive: false,
      isBack: false,
      istitle: true
    }
  },*/
  {
    path: '/catalog-overview',
    name: 'catalog-overview',
    component: catalogOverview,
    meta: {
      title: $t('router.process.servicecatalog'),
      ismenu: true,
      icon: 'tsfont-star',
      authority: 'PROCESS_BASE',
      type: 'catalog'
      
    }
  },
  {
    path: '/catalog-manage',
    name: 'catalog-manage',
    component: catalogManage,
    meta: {
      title: $t('router.process.servicecatalogmanage'),
      ismenu: true,
      icon: 'tsfont-list',
      authority: 'CATALOG_MODIFY',
      type: 'catalog'
    }
  },
  {
    path: '/task-dispatch',
    name: 'task-dispatch',
    component: taskDispatch,
    meta: {
      title: $t('router.process.taskdispatch'),
      ismenu: false,
      icon: 'tsfont-m-signature',
      authority: '',
      type: 'task'
    }
  },
  {
    path: '/task-detail',
    name: 'task-detail',
    component: taskDetail,
    meta: {
      title: $t('router.process.taskdetail'),
      ismenu: false,
      icon: 'tsfont-m-signature',
      authority: '',
      type: 'task'
    }
  },
  {
    path: '/flow-overview',
    name: 'flow-overview',
    component: flowOverview,
    meta: {
      title: $t('router.process.flowmanage'),
      ismenu: true,
      icon: 'tsfont-flow',
      authority: 'PROCESS_MODIFY',
      type: 'flow'
    }
  },
  {
    path: '/node-manage',
    name: 'node-manage',
    component: nodeManage,
    meta: {
      title: $t('router.process.nodemanage'),
      ismenu: true,
      icon: 'tsfont-node',
      authority: 'PROCESS_STEP_HANDLER_MODIFY',
      type: 'flow'
    }
  },
  {
    path: '/flow-edit',
    name: 'flow-edit',
    component: flowEdit,
    meta: {
      title: $t('router.process.flowedit'),
      ismenu: false,
      icon: 'tsfont-flow',
      authority: 'PROCESS_MODIFY',
      type: 'flow'
    }
  },
  {
    path: '/sla-manage',
    name: 'sla-manage',
    component: slaManage,
    meta: {
      title: $t('router.process.slamanage'),
      ismenu: false,
      icon: 'tsfont-sla',
      authority: 'FORM_MODIFY',
      type: 'others'
    }
  },

  {
    path: '/event-type-manage',
    name: 'event-type-manage',
    component: eventTypeManage,
    meta: {
      title: $t('router.process.eventtypemanage'),
      ismenu: true,
      icon: 'tsfont-module',
      authority: 'EVENT_TYPE_MODIFY',
      type: 'event'
    }
  },
  {
    path: '/event-solution-manage',
    name: 'event-solution-manage',
    component: eventSolutionManage,
    meta: {
      title: $t('router.process.eventsolutionmanage'),
      ismenu: true,
      icon: 'tsfont-checklist',
      authority: 'EVENT_SOLUTION_MODIFY',
      type: 'event'
    }
  },
  {
    path: '/event-solution-edit',
    name: 'event-solution-edit',
    component: eventSolutionEdit,
    meta: {
      title: $t('router.process.eventsolutionedit'),
      ismenu: false,
      authority: 'EVENT_SOLUTION_MODIFY'
    }
  },
  {
    path: '/subtasktype-manage',
    name: 'subtasktype-manage',
    component: subtaskTypeManage,
    meta: {
      title: $t('router.process.subtasktypemanage'),
      ismenu: true,
      icon: 'tsfont-taskperson',
      authority: 'CATALOG_MODIFY',
      type: 'others'
    }
  },
  {
    path: '/priority-manage',
    name: 'priority-manage',
    component: priorityManage,
    meta: {
      title: $t('router.process.prioritymanage'),
      ismenu: true,
      icon: 'tsfont-history',
      authority: 'PRIORITY_MODIFY',
      type: 'others'
    }
  },
  {
    path: '/score-template-manage',
    name: 'score-template-manage',
    component: scoreTemplateManage,
    meta: {
      title: $t('router.process.scoretemplatemanage'),
      ismenu: true,
      icon: 'tsfont-stars',
      authority: 'SCORE_TEMPLATE_MODIFY',
      type: 'others'
    }
  },
  {
    path: '/channeltype-manage',
    name: 'channeltype-manage',
    component: channeltypeManage,
    meta: {
      title: $t('router.process.channeltypemanage'),
      ismenu: true,
      icon: 'tsfont-urgency',
      authority: 'CHANNELTYPE_MODIFY',
      type: 'catalog'
    }
  },
  {
    path: '/task-batch-dispatch',
    name: 'task-batch-dispatch',
    component: taskBatchDispatch,
    meta: {
      title: $t('router.process.taskbatchdispatch'),
      ismenu: true,
      icon: 'tsfont-m-signature',
      authority: 'BATCH_REPORT_PROCESS_TASK',
      type: 'catalog'
    }
  },
  {
    path: '/change-overview',
    name: 'change-overview',
    component: changeOverview,
    meta: {
      title: $t('router.process.changemanage'),
      ismenu: true,
      icon: 'tsfont-change',
      authority: 'CHANGE_MODIFY',
      type: 'flow'
    }
  },
  {
    path: '/change-edit',
    name: 'change-edit',
    component: changeEdit,
    meta: {
      title: $t('router.process.changeedit'),
      ismenu: false,
      icon: 'tsfont-change',
      authority: 'CHANGE_MODIFY',
      type: 'flow'
    }
  },
  {
    path: '/relations-manage',
    name: 'relations-manage',
    component: relationsManage,
    meta: {
      title: $t('router.process.reltypemanage'),
      ismenu: true,
      icon: 'tsfont-flow-siblings',
      authority: 'CATALOG_MODIFY',
      type: 'others'
    }
  },
  
  {
    path: '/flow-demo',
    name: 'flow-demo',
    component: flowDemo,
    meta: {
      title: $t('touter.process.flowdemo'),
      ismenu: false
    }
  },
  {
    path: '/reply-manage',
    name: 'reply-manage',
    component: replyManage,
    meta: {
      title: $t('router.process.replymanage'),
      ismenu: true,
      icon: 'tsfont-modules',
      authority: 'PROCESS_BASE',
      type: 'others'
    }
  }
];

export default routerArr;

const refresh = () => import('@/views/pages/common/refresh.vue');
const noAuthority = () => import('@/views/pages/common/no-authority.vue');
const welcome = () => import('@/views/pages/common/welcome.vue');
const knowledgeDetail = () => import('./detail/knowledge-detail.vue');
const knowledgeEdit = () => import('./edit/knowledge-edit.vue');
const circleManage = () => import('./manage/circle-manage.vue');
const circleEdit = () => import('./manage/circle-edit.vue');
const templateManage = () => import('./manage/template-manage.vue');
const templateEdit = () => import('./manage/template-edit.vue');
const reviewDetail = () => import('./overview/review-detail.vue');
const KnowledgeOverview = () => import('./overview/knowledge-overview.vue');
const KnowledgeSearch = () => import('./overview/knowledge-search.vue');
import {$t} from '@/resources/init.js';

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
        next({ name: 'refresh', replace: true, query: { path: defaultPage} }); 
      } else {
        next({ path: defaultPage, replace: true});
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
    path: '/knowledge-detail',
    name: 'knowledge-detail',
    component: knowledgeDetail,
    meta: {
      title: $t('router.knowledge.knowledgedetail'),
      ismenu: false,
      icon: 'tsfont-list',
      authority: '',
      type: 'overview'
    }
  },
  {
    path: '/knowledge-edit',
    name: 'knowledge-edit',
    component: knowledgeEdit,
    meta: {
      title: $t('router.knowledge.knowledgeedit'),
      ismenu: false,
      icon: 'tsfont-edit',
      authority: '',
      type: 'overview'
    }
  },
  {
    path: '/circle-manage',
    name: 'circle-manage',
    component: circleManage,
    meta: {
      title: $t('router.knowledge.circlemanage'),
      ismenu: true,
      icon: 'tsfont-book',
      authority: 'KNOWLEDGE_CIRCLE_MODIFY',
      type: 'others'
    }
  },
  {
    path: '/circle-edit',
    name: 'circle-edit',
    component: circleEdit,
    meta: {
      title: $t('router.knowledge.circleedit'),
      ismenu: false,
      authority: 'KNOWLEDGE_CIRCLE_MODIFY'
    }
  },
  {
    path: '/template-manage',
    name: 'template-manage',
    component: templateManage,
    meta: {
      title: $t('router.knowledge.templatemanage'),
      ismenu: true,
      icon: 'tsfont-modules',
      authority: 'KNOWLEDGE_TEMPLATE_MODIFY',
      type: 'others'
    }
  },
  {
    path: '/template-edit',
    name: 'template-edit',
    component: templateEdit,
    meta: {
      title: $t('router.knowledge.templateedit'),
      ismenu: false,
      authority: 'KNOWLEDGE_TEMPLATE_MODIFY'
    }
  },
  {
    path: '/review-detail',
    name: 'review-detail',
    component: reviewDetail,
    meta: {
      title: $t('router.knowledge.reviewdetail'),
      ismenu: false,
      icon: 'tsfont-label',
      authority: '',
      type: 'overview'
    }
  },
  {
    path: '/knowledge-overview-:knowledgeType',
    name: 'knowledge-overview',
    props: true,
    component: KnowledgeOverview,
    meta: {
      // title: '\u200E',
      title: $t('router.knowledge.knowledgetypemanage'),
      ismenu: false,
      icon: 'tsfont-label',
      authority: 'KNOWLEDGE_BASE',
      type: 'others',
      istitle: true
    }
  },
  {
    path: '/knowledge-search-:knowledgeType',
    name: 'knowledge-search',
    props: true,
    component: KnowledgeSearch,
    meta: {
      title: $t('router.knowledge.knowledgesearch'),
      ismenu: false,
      authority: ''
    }
  }
];

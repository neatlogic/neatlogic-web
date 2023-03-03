const refresh = () => import('@/views/pages/common/refresh.vue');
const welcome = () => import('@/views/pages/common/welcome.vue');
//const interfaceManage = () => import('./interfacemanage/interface-manage.vue');
const interfaceManage = () => import('./interfacemanage/interface-manage.vue');
const interfaceDataManage = () => import('./interfacemanage/interface-data-manage.vue');
const interfaceMappingEdit = () => import('./interfacemanage/interface-mapping-edit.vue');
const categoryManage = () => import('./category/category-manage.vue');
//const corporationEdit = () => import('./corporation/corporation-edit.vue');
const corporationManage = () => import('./corporation/corporation-manage.vue');
const propertyManage = () => import('./property/property-manage.vue');
const policyManage = () => import('./policy/policy-manage.vue');
const policyAuditManage = () => import('./policy/policy-audit-manage.vue');
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
    path: '/interface-data-manage',
    name: 'interface-data-manage',
    component: interfaceDataManage,
    meta: {
      title: '接口数据',
      ismenu: true,
      type: 'pbcreport',
      authority: 'PBC_INTERFACE_MODIFY',
      icon: 'tsfont-peizhihechashebei'
    }
  },
  {
    path: '/policy-manage',
    name: 'policy-manage',
    component: policyManage,
    meta: {
      title: '策略管理',
      ismenu: true,
      type: 'pbcreport',
      authority: 'PBC_INTERFACE_MODIFY',
      icon: 'tsfont-peizhiguanli'
    }
  },
  {
    path: '/policy-audit-manage',
    name: 'policy-audit-manage',
    component: policyAuditManage,
    meta: {
      title: '执行记录管理',
      ismenu: false,
      type: 'pbcreport',
      authority: 'PBC_INTERFACE_MODIFY'
    }
  },
  /*{
    path: '/interface-detail/:id?',
    name: 'interface-detail',
    component: interfaceDetail,
    meta: {
      title: '接口详情',
      ismenu: false,
      type: 'pbcreport',
      authority: 'PBC_INTERFACE_MODIFY'
    }
  },*/
  {
    path: '/interface-mapping-edit/:id?',
    name: 'interface-mapping-edit',
    component: interfaceMappingEdit,
    meta: {
      title: '接口映射管理',
      ismenu: false,
      type: 'pbcreport',
      authority: 'PBC_INTERFACE_MODIFY'
    }
  },
  {
    path: '/interface-manage',
    name: 'interface-manage',
    component: interfaceManage,
    meta: {
      title: '接口管理',
      ismenu: true,
      type: 'manage',
      authority: 'PBC_INTERFACE_MODIFY',
      icon: 'tsfont-formstaticlist'
    }
  },
  {
    path: '/property-manage',
    name: 'property-manage',
    component: propertyManage,
    meta: {
      title: '属性管理',
      ismenu: true,
      type: 'manage',
      authority: 'PBC_INTERFACE_MODIFY',
      icon: 'tsfont-formdynamiclist'
    }
  },
  {
    path: '/category-manage',
    name: 'category-manage',
    component: categoryManage,
    meta: {
      title: '分类标识管理',
      ismenu: true,
      type: 'manage',
      authority: 'PBC_INTERFACE_MODIFY',
      icon: 'tsfont-type'
    }
  },
  {
    path: '/corporation-manage',
    name: 'corporation-manage',
    component: corporationManage,
    meta: {
      title: '机构设置',
      ismenu: true,
      type: 'manage',
      authority: 'PBC_INTERFACE_MODIFY',
      icon: 'tsfont-config'
    }
  }
];

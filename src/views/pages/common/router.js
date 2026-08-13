const extramenuDetail = () => import('@/views/pages/common/extramenu-detail.vue');
const moduleWorkbench = () => import('@/views/pages/common/welcome.vue');
import { $t } from '@/resources/init.js';
let routers = [
  {
    path: '/extramenu-detail',
    name: 'extramenu-detail',
    component: extramenuDetail,
    meta: {
      ismenu: false,
      title: $t('router.common.extramenudetail')
    }
  },
  {
    path: '/workbench',
    name: 'module-workbench',
    component: moduleWorkbench,
    meta: {
      ismenu: false,
      title: '工作台'
    }
  }
];
export default routers;

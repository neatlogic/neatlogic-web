const extramenuDetail = () => import('@/views/pages/common/extramenu-detail.vue');
import { $t } from '@/resources/init.js';
let routers = [{
  path: '/extramenu-detail',
  name: 'extramenu-detail',
  component: extramenuDetail,
  meta: {
    ismenu: false,
    title: $t('router.common.extramenudetail')
  }
}];
export default routers;

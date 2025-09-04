const extramenuDetail = () => import('@/views/pages/common/extramenu-detail.vue');
let routers = [{
  path: '/extramenu-detail',
  name: 'extramenu-detail',
  component: extramenuDetail,
  meta: {
    ismenu: false,
    title: '扩展菜单'
  }
}];
export default routers;

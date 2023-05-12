import axios from '../../http';

const menu = {
  //菜单列表
  menuList(params) {
    return axios.get('/api/rest/menu/search', {
      params: params
    });
  },
  //保存菜单
  saveMenu(data) {
    return axios.post('/api/rest/menu/save', data);
  },
  //删除菜单
  delMenu(data) {
    return axios.post('/api/rest/menu/delete', data);
  }
};
export default menu;

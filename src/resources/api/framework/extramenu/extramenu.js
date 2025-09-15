import axios from '../../http';

const extramenu = {
  getMenuTreeList(params) {
    return axios.post('/api/rest/extramenu/tree', params);
  },
  getMenuById(id) {
    return axios.post('/api/rest/extramenu/get', {id: id});
  },
  getMenuTreeNode(params) {
    return axios.post('/api/rest/extramenu/get', params);
  },
  deleteMenuTreeNode(id) {
    return axios.post('/api/rest/extramenu/delete', {id: id});
  },
  saveMenuTreeNode(params) {
    return axios.post('/api/rest/extramenu/save', params);
  },
  getMenuList() { //获取拥有权限的附加菜单列表
    return axios.post('/api/rest/extramenu/list', {});
  },
  moveExtramenu(params) { //拖拽排序
    return axios.post('/api/rest/extramenu/move', params);
  },
  listExtarmenuItem(params) {
    return axios.post('/api/rest/extramenu/item/list', params);
  }
};
export default extramenu;

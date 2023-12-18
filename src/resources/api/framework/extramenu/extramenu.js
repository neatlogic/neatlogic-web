import axios from '../../http';

const extramenu = {
  getMenuTreeList(params) {
    return axios.post('/api/rest/extramenu/tree', params);
  },
  getMenuTreeNode(params) {
    return axios.post('/api/rest/extramenu/get', params);
  },
  deleteMenuTreeNode(params) {
    return axios.post('/api/rest/extramenu/delete', params);
  },
  saveMenuTreeNode(params) {
    return axios.post('/api/rest/extramenu/save', params);
  },
  getMenuList(params) {
    return axios.post('/api/rest/extramenu/list', params);
  }
};
export default extramenu;

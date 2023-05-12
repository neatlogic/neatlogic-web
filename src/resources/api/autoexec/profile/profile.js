import axios from '../../http';

const profile = {
  getProfileList(params) {
    return axios.post('/api/rest/autoexec/profile/search', params);
  },
  saveProfile(params) {
    return axios.post('/api/rest/autoexec/profile/save', params);
  },
  deleteProfile(params) {
    return axios.post('/api/rest/autoexec/profile/delete', params);
  },
  getProfileDetailById(id) {
    // 查询详情接口
    return axios.post('/api/rest/autoexec/profile/get', {id: id});
  },
  getParamList(params) {
    // 根据关联工具查询参数列表
    return axios.post('/api/rest/autoexec/operation/param/list', params);
  },
  getSystemList() { //资源中心应用系统下拉列表
    return axios.post('/api/rest/resourcecenter/appsystem/list/forselect', {});
  }
};
export default profile;

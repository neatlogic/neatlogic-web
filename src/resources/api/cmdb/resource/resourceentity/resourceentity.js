import axios from '../../../http';
const resourceentity = {
  searchResourceEntity() {
    return axios.get('api/rest/resourcecenter/resourceentity/list', {});
  },
  getResourceEntity(name) {
    return axios.post('api/rest/resourcecenter/resourceentity/get', {name: name});
  },
  saveResourceEntity(params) {
    return axios.post('api/rest/resourcecenter/resourceentity/save', params);
  },
  rebuildAllResourceEntity() {
    return axios.post('api/rest/resourcecenter/resourceentity/rebuild', {});
  },
  searchResourceAccountList(params) { //表单扩展选择资源中心账号组件
    return axios.post('/api/rest/resourcecenter/resource/account/component/select', params);
  }
};
export default resourceentity;

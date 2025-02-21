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
  searchResourceAccountList(params) { //表单扩展选择资源中心账号组件
    return axios.post('/api/rest/resourcecenter/resource/account/component/select', params);
  },
  getResourceEntityViewDataList(params) {
    return axios.post('/api/rest/resourcecenter/resourceentity/viewdata/list', params);
  },
  getAssetlist() {
    return axios.post('/api/rest/resourcecenter/assetlist/display/get', {});
  },
  getResourcetypeTree(params) {
    return axios.post('/api/rest/resourcecenter/resourcetype/listtree', params);
  },
  saveAssetlistData(params) {
    return axios.post('/api/rest/resourcecenter/assetlist/display/save', params);
  }
};
export default resourceentity;

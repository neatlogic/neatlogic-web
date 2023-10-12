import axios from '@/resources/api/http';
const service = {
  saveService(params) {
    return axios.post('/api/rest/dr/service/save', params);
  },
  deleteService(params) {
    return axios.post('/api/rest/dr/service/delete', params);
  },
  getService(params) {
    return axios.post('/api/rest/dr/service/get', params);
  },
  searchService(params) {
    return axios.post('/api/rest/dr/service/search', params);
  },
  saveServiceBaseinfo(params) {
    return axios.post('/api/rest/dr/service/baseinfo/save', params);
  },
  deleteServiceScene(params) {
    return axios.post('/api/rest/dr/service/scene/delete', params);
  },
  saveServiceScene(params) {
    return axios.post('/api/rest/dr/service/scene/save', params);
  },
  deleteServiceDatacenter(params) {
    return axios.post('/api/rest/dr/service/datacenter/delete', params);
  },
  saveServiceDatacenter(params) {
    return axios.post('/api/rest/dr/service/datacenter/save', params);
  },
  deleteServiceRelationship(params) {
    return axios.post('/api/rest/dr/service/relationship/delete', params);
  },
  saveServiceRelationship(params) {
    return axios.post('/api/rest/dr/service/relationship/save', params);
  },
  checkServiceRelationship(params) { //校验服务关系是否成环
    return axios.post('/api/rest/dr/service/relationship/check', params);
  }
};
export default service;

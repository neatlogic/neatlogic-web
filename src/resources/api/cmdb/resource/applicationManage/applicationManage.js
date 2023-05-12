import axios from '../../../http';
const applicationManage = {
  //获取资源定义
  getResourceEntityByName(name) {
    return axios.post('api/rest/resourcecenter/resourceentity/get', {name: name});
  },
  // 查询资源环境应用列表
  getAppmoduleList(params) {
    return axios.post('api/rest/resourcecenter/appmodule/list', params);
  },
  // 查询资源环境列表
  getEnvironmenteList() {
    return axios.post('api/rest/resourcecenter/appenv/list/forselect', {});
  },
  // 查询资源中心数据列表
  getResourceList(params) {
    return axios.post('api/rest/resourcecenter/resource/list', params);
  },
  // 查询应用模块中资源列表
  postAppmoduleResourceList(params) {
    return axios.post('api/rest/resourcecenter/appmodule/resource/list', params);
  },
  getAppsystemListTree(params) {
    // 获取资源中心，应用列表
    return axios.post('api/rest/resourcecenter/appsystem/list/fortree', params);
  },
  getAppmoduleListTree(params) {
    // 获取资源中心，应用模块列表
    return axios.post('api/rest/resourcecenter/appmodule/list/fortree', params);
  },
  getAppsystemById(params) {
    // 根据应用id，获取应用信息
    return axios.post('api/rest/resourcecenter/appsystem/get', params);
  },
  getAppmoduleById(params) {
    // 根据模块id，获取模块信息
    return axios.post('api/rest/resourcecenter/appmodule/get', params);
  }
};
export default applicationManage;

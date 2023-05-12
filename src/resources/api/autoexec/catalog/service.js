import axios from '../../http';

const service = {
  // 获取目录管理树接口
  getAllSeriveTree(params) {
    return axios.post('/api/rest/autoexec/service/all/fortree', params);
  },
  saveSeriveInfo(params) {
    // 保存目录信息
    return axios.post('/api/rest/autoexec/service/save', params);
  },
  getSeriveInfo(params) {
    // 获取目录信息
    return axios.post('/api/rest/autoexec/service/get', params);
  },
  moveCatalog(params) {
    // 移动服务目录信息
    return axios.post('/api/rest/autoexec/service/move', params);
  },
  deleteService(params) {
    return axios.post('/api/rest/autoexec/service/delete', params);
  },
  getFavorite(params) {
    // 搜索用户收藏的服务目录
    return axios.post('/api/rest/autoexec/service/user/search', params);
  },
  //获取某个服务目录下的所有服务目录路径接口
  getCalalogroute(params) {
    return axios.post('/api/rest/autoexec/service/breadcrumb/search', params);
  },
  saveUserCollect(params) {
    //用户收藏
    return axios.post('/api/rest/autoexec/service/user/save', params);
  },
  deleteUserCollect(params) {
    // 删除用户收藏
    return axios.post('/api/rest/autoexec/service/user/delete', params);
  },
  allService(params) {
    return axios.post('/api/rest/autoexec/service/all/visible/fortree', params);
  },
  searchService(params) {
    return axios.post('/api/rest/autoexec/service/visible/search', params);
  },
  saveJobCreate(params) {
    // 创建作业
    return axios.post('/api/rest/autoexec/service/job/create', params);
  }
};
export default service;

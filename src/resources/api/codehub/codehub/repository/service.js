import axios from '@/resources/api/http.js';

const service = {
  getList(data) { //获取仓库服务列表
    return axios.post('/api/rest/codehub/repositoryservice/search', data);
  },
  save(data) { //保存
    return axios.post('/api/rest/codehub/repositoryservice/save', data);
  },
  getDetail(data) { //单个仓库服务
    return axios.post('/api/rest/codehub/repositoryservice/get', data);
  },  
  delete(data) { //删除仓库服务
    return axios.post('/api/rest/codehub/repositoryservice/delete', data);
  },
  check(data) { //检查连通性
    return axios.post('/api/rest/codehub/repositoryservice/check', data);
  }
};
export default service;

import axios from '@/resources/api/http.js';

const repository = {
  getList(data) { //获取仓库列表
    return axios.post('/api/rest/codehub/repository/search', data);
  },
  sync(data) { //同步
    return axios.post('/api/rest/codehub/repository/sync', data);
  },
  save(data) { //保存
    return axios.post('/api/rest/codehub/repository/save', data);
  },
  getDetail(data) { //单个仓库
    return axios.post('/api/rest/codehub/repository/get', data);
  },  
  delete(data) { //删除仓库
    return axios.post('/api/rest/codehub/repository/delete', data);
  },
  getWorkingcopypath(data) {
    return axios.post('/api/rest/codehub/repository/workingcopypath/get', data);
  },
  updateNode(data) {
    return axios.post('/api/rest/codehub/repository/runner/update', data);
  }
};
export default repository;

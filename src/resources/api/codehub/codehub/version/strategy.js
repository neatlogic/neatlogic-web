import axios from '@/resources/api/http.js';

const strategy = {
  getList(data) { //获取列表
    return axios.post('/api/rest/codehub/versionstrategy/search', data);
  },
  save(data) { //保存
    return axios.post('/api/rest/codehub/versionstrategy/save', data);
  },
  getDetail(data) { //单个
    return axios.post('/api/rest/codehub/versionstrategy/get', data);
  },  
  delete(data) { //删除
    return axios.post('/api/rest/codehub/versionstrategy/delete', data);
  },
  getStatus(data) {
    return axios.post('/api/rest/codehub/versionstrategy/delete', data);
  }
};
export default strategy;

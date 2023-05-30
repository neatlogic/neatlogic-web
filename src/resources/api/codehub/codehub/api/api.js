import axios from '@/resources/api/http.js';

const api = {
  getList(data) { //获取列表
    return axios.post('/api/rest/codehub/apimanage/search', data);
  },
  aysn(data) {
    return axios.post('/api/rest/codehub/sync/source/param', data);
  }
};
export default api;

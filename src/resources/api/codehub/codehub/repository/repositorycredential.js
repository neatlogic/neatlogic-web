import axios from '@/resources/api/http.js';

const credential = {
  getList(data) { //当前用户的凭证信息
    return axios.post('/api/rest/codehub/repository/repocredential/get', data);
  },
  getDetailByType(data) { //根据仓库类型当前用户的凭证信息
    return axios.post('/api/rest/codehub/repository/repocredential/getbytype', data);
  },
  save(data) {
    return axios.post('/api/rest/codehub/repository/repocredential/save', data);
  }
};
export default credential;

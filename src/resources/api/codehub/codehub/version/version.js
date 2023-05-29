import axios from '@/resources/api/http.js';

const version = {
  getList(data) { //获取列表
    return axios.post('/api/rest/codehub/version/search', data);
  },
  save(data) { //保存
    return axios.post('/api/rest/codehub/version/save', data);
  },
  getDetail(data, config) { //单个版本
    return axios.post('/api/rest/codehub/version/get', data, config);
  },  
  delete(data) { //删除
    return axios.post('/api/rest/codehub/version/delete', data);
  },
  updateOpen(data) { //开封版
    return axios.post('/api/rest/codehub/version/openstatus/update', data);
  },
  autofillName(data) { //开封版
    return axios.post('/api/rest/codehub/version/autocreate', data);
  }
};
export default version;

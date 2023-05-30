import axios from '@/resources/api/http.js';

const versiontype = {
  getList(data) { //获取列表
    return axios.post('/api/rest/codehub/versiontype/search', data);
  },
  save(data) { //保存
    return axios.post('/api/rest/codehub/versiontype/save', data);
  },
  getDetail(data) { //单个版本
    return axios.post('/api/rest/codehub/versiontype/get', data);
  },  
  delete(data) { //删除
    return axios.post('/api/rest/codehub/versiontype/delete', data);
  },
  updateStatus(data) {
    return axios.post('/api/rest/codehub/versiontype/isactive/update', data);
  }
};
export default versiontype;

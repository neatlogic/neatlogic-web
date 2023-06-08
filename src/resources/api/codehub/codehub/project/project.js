import axios from '@/resources/api/http.js';

const project = {
  getList(data) { //获取列表
    return axios.post('/api/rest/codehub/appmodule/project/search', data);
  },
  getDetail(data) {
    return axios.post('/api/rest/codehub/appmodule/project/get', data);
  },
  save(data) { //保存
    return axios.post('/api/rest/codehub/appmodule/project/save', data);
  },
  delete(data) { //删除
    return axios.post('/api/rest/codehub/appmodule/project/delete', data);
  },
  getProject(data) {
    return axios.post('/api/rest/codehub/project/search', data);
  }  

};
export default project;

import axios from '../../http';

const score = {
  //保存回复模板
  save(data) {
    return axios.post('api/rest/process/comment/template/save', data);
  },
  //获取回复模版
  get(data) {
    return axios.post('api/rest/process/comment/template/get', data);
  },
  //删除回复模版
  delete(data) {
    return axios.post('api/rest/process/comment/template/delete', data);
  },
  // 查询系统回复模版
  search(data) {
    return axios.post('api/rest/process/comment/template/search', data);
  }
};

export default score;

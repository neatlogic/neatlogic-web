import axios from '../../http';

const score = {
  search(params) {
    return axios.post('api/rest/score/template/search', params);
  },
  get(params) {
    return axios.post('api/rest/score/template/get', params);
  },
  delete(params) {
    return axios.post('api/rest/score/template/delete', params);
  },
  save(params) {
    return axios.post('api/rest/score/template/save', params);
  },
  // 修改评分模版激活状态
  updateStatus(params) {
    return axios.post('api/rest/score/template/status/update', params);
  },
  // 查询评分模版关联的流程
  listProcess(params) {
    return axios.post('api/rest/score/template/process/list', params);
  },
  // 工单处理页提交评分
  submitScore(params) {
    return axios.post('api/rest/processtask/score', params);
  }
};

export default score;

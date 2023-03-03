import axios from '../../http';

const notice = {
  // 获取系统公告列表
  search(params) {
    return axios.post('/api/rest/systemnotice/search', params);
  },
  // 获取历史公告列表
  getHistoryList(params) {
    return axios.post('/api/rest/systemnotice/history/list', params);
  },
  // 根据id获取某个系统公告
  get(id) {
    return axios.post('/api/rest/systemnotice/get', {id});
  },
  // 保存系统公告
  save(params) {
    return axios.post('/api/rest/systemnotice/save', params);
  },
  // 根据id删除系统公告
  remove(id) {
    return axios.post('/api/rest/systemnotice/delete', {id});
  },
  // 下发公告
  issue(params) {
    return axios.post('/api/rest/systemnotice/issue', params);
  },
  // 停止公告
  stop(id) {
    return axios.post('/api/rest/systemnotice/stop', {id});
  },
  // 设置公告为已读
  read(params) {
    return axios.post('/api/rest/systemnotice/readstatus/update', params);
  }
};
export default notice;

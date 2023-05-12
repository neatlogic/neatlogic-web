import axios from '../../http';
const schedule = {
  searchSchedule(params) {
    // 查询定时作业列表
    return axios.post('/api/rest/deploy/schedule/list', params);
  },
  saveSchedule(params) {
    //保存定时作业信息
    return axios.post('/api/rest/deploy/schedule/save', params);
  },
  getSchedule(params) {
    //获取定时作业信息
    return axios.post('/api/rest/deploy/schedule/get', params);
  },
  deleteSchedule(params) {
    //删除定时作业信息
    return axios.post('/api/rest/deploy/schedule/delete', params);
  },
  updateSchedule(params) {
    //启用/禁用定时作业
    return axios.post('/api/rest/deploy/schedule/isactive/update', params);
  }
};
export default schedule;

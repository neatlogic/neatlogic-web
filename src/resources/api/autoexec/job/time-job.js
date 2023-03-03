import axios from '../../http';

const timeJob = {
  // 获取定时任务列表
  getTimeJobList(params) {
    return axios.post('/api/rest/autoexec/schedule/list', params);
  },
  // 获取定时作业信息
  getTimeJob(params) {
    return axios.post('/api/rest/autoexec/schedule/get', params);
  },
  //删除定时作业
  deleteTimeJob(params) {
    return axios.post('/api/rest/autoexec/schedule/delete', params);
  },
  // 保存定时作业
  saveTimeJob(params) {
    return axios.post('/api/rest/autoexec/schedule/save', params);
  },
  // 获取组合工具列表根据id
  getCombopListByCombopId() {
    return axios.post('/api/rest/autoexec/combop/list', params);
  },
  toggleAction(params) {
    // 更新激活状态
    return axios.post('/api/rest/autoexec/schedule/isactive/update', params);
  }
};

export default timeJob;

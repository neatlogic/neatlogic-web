import axios from '../../http';

const assetsInspect = {
  getReportList(params) {
    return axios.post('/api/rest/inspect/report/get', params);
  },
  getHistory(params) {
    return axios.post('/api/rest/inspect/report/history/list', params);
  },
  getCombop(params) {
    return axios.post('/api/rest/inspect/ci/combop/get', params);
  },
  searchReport(params) {
    return axios.post('/api/rest/inspect/resource/report/search', params);
  },
  createResourceEntityInspectJob(params) {
    return axios.post('/api/rest/inspect/resource/entity/job/create', params);
  },
  createResourceTypeInspectJob(params) {
    return axios.post('/api/rest/inspect/resource/type/job/create', params);
  },
  // 获取巡检定时任务
  getSchedule(id) {
    return axios.post('/api/rest/inspect/schedule/get', {id: id});
  },
  // 保存巡检定时任务
  saveSchedule(params) {
    return axios.post('/api/rest/inspect/schedule/save', params);
  },
  // 巡检定时任务列表
  searchSchedule(params) {
    return axios.post('/api/rest/inspect/schedule/search', params);
  },
  updateStatus(params) {
    return axios.post('/api/rest/inspect/schedule/status/update', params);
  },
  sendEmail(params) {
    // 发送邮件
    return axios.post('/api/rest/inspect/new/problem/report/sendemail', params);
  },
  getScript(resourceId) {
    // 获取脚本信息
    return axios.post('/api/rest/inspect/accessendpoint/script/get', { resourceId });
  },
  saveScript(params) {
    // 保存脚本信息
    return axios.post('/api/rest/inspect/accessendpoint/script/save', params);
  },
  saveProblemClassification(params) {
    // 保存问题分类
    return axios.post('/api/rest/inspect/new/problem/customview/save', params);
  },
  renameProblemClassification(params) {
    // 重命名问题分类
    return axios.post('/api/rest/inspect/new/problem/customview/rename', params);
  },
  moveNewClassification(params) {
    // 移动问题分类
    return axios.post('/api/rest/inspect/new/problem/customview/move', params);
  },
  getProblemClassificationList(params) {
    // 获取问题分类列表
    return axios.post('/api/rest/inspect/new/problem/customview/list', params);
  },
  getProblemClassificationById(params) {
    // 获取问题分类通过id
    return axios.post('/api/rest/inspect/new/problem/customview/get', params);
  },
  delProblemClassificationMenu(params) {
    // 删除问题分类
    return axios.post('/api/rest/inspect/new/problem/customview/delete', params);
  },
  updateNewClassificationCondition(params) {
    // 更新问题分类条件
    return axios.post('/api/rest/inspect/new/problem/customview/condition/update', params);
  }
};
export default assetsInspect;

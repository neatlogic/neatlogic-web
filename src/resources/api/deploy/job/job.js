import axios from '../../http';
const job = {
  searchJobList(params) { //搜索作业
    return axios.post('/api/rest/deploy/job/search', params);
  },
  getCreateJobData(params) { //获取创建发布作业初始化信息接口
    return axios.post('/api/rest/deploy/job/create/info/get', params);
  },
  getJobModuleList(params) {
    return axios.post('/api/rest/deploy/job/module/list', params);
  },
  saveDeployJob(params) { //保存发布作业
    return axios.post('/api/rest/deploy/job/save', params);
  },
  createDeployJob(params) { //创建发布作业
    return axios.post('/api/rest/deploy/job/multi/create', params);
  },
  saveBatchDeployJob(params) {
    return axios.post('/api/rest/deploy/batchjob/save', params);
  },
  getBatchJobById(id) {
    //获取批量作业
    return axios.post('/api/rest/deploy/batchjob/get', { id: id });
  },
  getBatchJobStatusById(id) {
    return axios.post('/api/rest/deploy/batchjob/status/get', {id: id});
  },
  saveReviewStatus(id, status) {
    return axios.post('/api/rest/deploy/batchjob/updatereviewstatus', {id: id, reviewStatus: status});
  },
  executeBatchDeployJob(params) {
    //执行批量作业
    return axios.post('/api/rest/deploy/batchjob/execute', params);
  },
  executeBatchDeployGroup(params) {
    //执行批量作业分组
    return axios.post('/api/rest/deploy/batchjob/execute/group', params);
  },
  resumeGroup(params) {
    return axios.post('/api/rest/deploy/batchjob/resume/group', params);
  },
  validJob(id) {
    return axios.post('/api/rest/deploy/batchjob/check', {id: id});
  },
  takeOverJob(id) {
    return axios.post('/api/rest/deploy/batchjob/takeover', {id: id});
  },
  getGroupJobList(idList) {
    return axios.post('/api/rest/deploy/batchjob/group/list', {idList: idList});
  },
  deleteJob(id) {
    return axios.post('/api/rest/deploy/batchjob/delete', {id: id});
  }
};
export default job;

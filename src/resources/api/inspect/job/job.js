import axios from '../../http';

const inspectJob = {
  getInspectJobList(params) {
    // 获取巡检作业列表
    return axios.post('/api/rest/inspect/autoexec/job/search', params);
  },
  getInspectResult(params) {
    // 巡检结果
    return axios.post('/api/rest/inspect/autoexec/job/node/search', params);
  },
  getQuestionReport(params) {
    // 问题报告，内嵌表格列表
    return axios.post('/api/rest/inspect/autoexec/job/node/problem/report/list', params);
  },
  getRecentIssuesInnerTableList(params) {
    // 最新问题内嵌表格
    return axios.post('/api/rest/inspect/new/problem/report/list', params);
  }
};

export default inspectJob;

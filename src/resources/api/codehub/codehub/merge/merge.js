import axios from '@/resources/api/http.js';

const merge = {
  getList(data) { //获取列表
    return axios.post('/api/rest/codehub/mergerequest/search', data);
  },
  save(data) { //保存
    return axios.post('/api/rest/codehub/mergerequest/save', data);
  },
  getDetail(data) { //单个
    return axios.post('/api/rest/codehub/mergerequest/get', data);
  },
  delete(data) { //删除
    return axios.post('/api/rest/codehub/mergerequest/delete', data);
  },
  updateStatus(data) {
    return axios.post('/api/rest/codehub/mergerequest/updatestatus', data);
  },
  getStatusCount(data) {
    return axios.post('/api/rest/codehub/mergerequest/status/count', data);
  },
  getIssuelist(data) {
    // 获取所有需求列表
    return axios.post('/api/rest/codehub/issue/realtime/search', data);
  },
  getActionList(data) {
    return axios.post('/api/rest/codehub/mergerequest/action/search', data);
  },
  activeAction(data) {
    return axios.post('/api/rest/codehub/mergerequest/action/activeAction', data);
  },
  getActionById(data) {
    return axios.post('/api/rest/codehub/mergerequest/action/get', data);
  },
  saveAction(data) {
    return axios.post('/api/rest/codehub/mergerequest/action/save', data);
  },
  deleteAction(data) {
    return axios.post('/api/rest/codehub/mergerequest/action/delete', data);
  },
  searchActionLog(data) {
    return axios.post('/api/rest/codehub/mergerequest/actionLog/search', data);
  },
  getInnerVariableList() {
    return axios.post('/api/rest/codehub/mergerequest/action/listInnerVariable');
  },
  getVaildlist(data, config) {
    return axios.post('/api/rest/codehub/issue/commit/realtime/search', data, config);
  },
  mergebyBranch(data) {
    return axios.post('/api/rest/codehub/merge/branch', data);
  },
  mergebyIssue(data) {
    return axios.post('/api/rest/codehub/merge/issue/async', data);
  },
  getStatusList(data) {
    return axios.post('/api/rest/codehub/status/get', data);
  },
  revertMerge(data) { //撤销已合并需求
    return axios.post('/api/rest/codehub/mergerequest/revertissue', data);
  },
  getCommit(data) {
    //获取commit信息
    return axios.post('/api/rest/codehub/commit/search', data);
  },
  getFile(data) {
    //获取commit文件信息
    return axios.post('/api/rest/codehub/file/search', data);
  },
  getError(data) {
    //获取失败状态的mr失败信息
    return axios.post('/api/rest/codehub/mergerequest/geterrormessage', data);
  },
  checkRevert(data) {
    //获取mr撤销是否有效
    return axios.post('/api/rest/codehub/mergerequest/revert/check', data);
  },
  getIssuelistByMruuid(data, config) {
    //新的根据mruuid更新需求列表（含对应的commit列表）
    return axios.post('/api/rest/codehub/mergerequest/issue/commit/search', data, config);
  },
  getDiff(data, config) {
    //获取diff
    return axios.post('/api/rest/codehub/mergerequest/diff', data, config);
  },
  getDiffLine(data) {
    //获取diff行的内容
    return axios.post('/api/rest/codehub/commit/file/line/get', data);
  },
  deleteCommentByLine(data) {
    //删除行评论
    return axios.post('/api/rest/codehub/linecomment/delete', data);
  },
  getCommentByLineId(data) {
    //根据id获取行评论
    return axios.post('/api/rest/codehub/linecomment/get', data);
  },
  getCommentOfLine(data) {
    //获取行评论
    return axios.post('/api/rest/codehub/linecomment/search', data);
  },
  saveCommentByLine(data) {
    //保存行评论
    return axios.post('/api/rest/codehub/linecomment/save', data);
  },
  deleteCommentById(data) {
    //删除整个mr评论
    return axios.post('/api/rest/codehub/mergerequestcomment/delete', data);
  },
  getCommentById(data) {
    //根据id获取评论
    return axios.post('/api/rest/codehub/mergerequestcomment/get', data);
  },
  getComment(data) {
    //获取所有评论
    return axios.post('/api/rest/codehub/mergerequestcomment/search', data);
  },
  saveComment(data) {
    //保存评论
    return axios.post('/api/rest/codehub/mergerequestcomment/save', data);
  },
  getActive(data) {
    //获取活动
    return axios.post('/api/rest/codehub/action/search', data);
  }
};
export default merge;

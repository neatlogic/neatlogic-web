import axios from '@/resources/api/http.js';

const merge = {
  updateStatus(data) {
    return axios.post('/api/rest/codehub/mergerequest/updatestatus', data);
  },
  mergebyBranch(data) {
    return axios.post('/api/rest/codehub/merge/branch', data);
  },
  getFile(data) {
    //获取commit文件信息
    return axios.post('/api/rest/codehub/file/search', data);
  },
  checkRevert(data) {
    //获取mr撤销是否有效
    return axios.post('/api/rest/codehub/mergerequest/revert/check', data);
  },
  getIssuelistByMrId(data, config) {
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

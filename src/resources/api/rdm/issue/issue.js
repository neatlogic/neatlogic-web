import axios from '../../http';

const issue = {
  getIssueById(id) {
    return axios.post('/api/rest/rdm/issue/get', { id: id });
  },
  getIssueCountByProjectId(projectId, groupBy) {
    return axios.post('/api/rest/rdm/project/issue/count', { projectId: projectId, groupBy: groupBy });
  },
  searchIssue(params) {
    return axios.post('/api/rest/rdm/issue/search', params);
  },
  getTagByIssueId(id) {
    return axios.post('/api/rest/rdm/issue/tag/list', {issueId: id});
  },
  deleteIssue(id) {
    return axios.post('/api/rest/rdm/issue/delete', {id: id});
  },
  saveIssue(params) {
    return axios.post('/api/rest/rdm/issue/save', params);
  },
  searchComment(params) {
    return axios.post('/api/rest/rdm/issue/comment/search', params);
  },
  getCommentById(id) {
    return axios.post('/api/rest/rdm/issue/comment/get', {id: id});
  },
  saveComment(params) {
    return axios.post('/api/rest/rdm/issue/comment/save', params);
  },
  saveIssueRel(params) {
    return axios.post('/api/rest/rdm/issue/rel/save', params);
  },
  deleteComment(id) {
    return axios.post('/api/rest/rdm/issue/comment/delete', {id: id});
  },
  deleteIssueRel(params) {
    return axios.post('/api/rest/rdm/issue/rel/delete', params);
  },
  clearParentIssue(id) {
    return axios.post('/api/rest/rdm/issue/parent/delete', {id: id});
  }
};
export default issue;

import axios from '../../http';

const issue = {
  getRelIssueList(issueId, relType, direction, appId) {
    return axios.post('/api/rest/rdm/issue/rel/list', { issueId: issueId, relType: relType, direction: direction, appId: appId });
  },
  checkIssueIsFavorite(id) {
    return axios.post('/api/rest/rdm/issue/favorite/check', { id: id });
  },
  getIssueById(id) {
    return axios.post('/api/rest/rdm/issue/get', { id: id });
  },
  getIssueCountByProjectId(projectId, groupBy) {
    return axios.post('/api/rest/rdm/project/issue/count', { projectId: projectId, groupBy: groupBy });
  },
  searchIssue(params) {
    return axios.post('/api/rest/rdm/issue/search', params);
  },
  searchIssueCopy(sourceIssueId) {
    return axios.post('/api/rest/rdm/issue/copy/search', { sourceIssueId: sourceIssueId });
  },
  getTagByIssueId(id) {
    return axios.post('/api/rest/rdm/issue/tag/list', { issueId: id });
  },
  deleteIssue(id) {
    return axios.post('/api/rest/rdm/issue/delete', { id: id });
  },
  saveIssue(params) {
    return axios.post('/api/rest/rdm/issue/save', params);
  },
  exportIssue(params) {
    return axios.post('/api/binary/rdm/issue/export', params, { responseType: 'blob' });
  },
  downloadIssueImportTemplate(params) {
    return axios.post('/api/binary/rdm/issue/import/template', params, { responseType: 'blob' });
  },
  previewImportIssue(params) {
    return axios.post('/api/binary/rdm/issue/import/preview', params, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      contentType: 'multipart/form-data'
    });
  },
  importIssue(params) {
    return axios.post('/api/binary/rdm/issue/import', params, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      contentType: 'multipart/form-data'
    });
  },
  searchComment(params) {
    return axios.post('/api/rest/rdm/issue/comment/search', params);
  },
  getCommentById(id) {
    return axios.post('/api/rest/rdm/issue/comment/get', { id: id });
  },
  saveComment(params) {
    return axios.post('/api/rest/rdm/issue/comment/save', params);
  },
  saveIssueRel(params) {
    return axios.post('/api/rest/rdm/issue/rel/save', params);
  },
  deleteComment(id) {
    return axios.post('/api/rest/rdm/issue/comment/delete', { id: id });
  },
  deleteIssueRel(params) {
    return axios.post('/api/rest/rdm/issue/rel/delete', params);
  },
  clearParentIssue(id) {
    return axios.post('/api/rest/rdm/issue/parent/delete', { id: id });
  },
  toggleIssueIsFavorite(issueId, isFavorite) {
    return axios.post('/api/rest/rdm/issue/favorite/toggle', { issueId: issueId, isFavorite: isFavorite });
  }
};
export default issue;

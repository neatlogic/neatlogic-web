import axios from '../../http';

const project = {
  saveAppAttr(params) {
    return axios.post('/api/rest/rdm/project/app/attr/save', params);
  },
  saveProjectUser(params) {
    return axios.post('/api/rest/rdm/project/user/save', params);
  },
  updateAttrSort(params) {
    return axios.post('/api/rest/rdm/project/app/attr/updatesort', params);
  },
  getAttrById(id) {
    return axios.post('/api/rest/rdm/project/app/attr/get', { id: id });
  },
  listCustomAttrType() {
    return axios.post('/api/rest/rdm/project/app/customattrtype/list', {});
  },
  getProjectIssueCount(params) {
    return axios.post('/api/rest/rdm/project/issuecount/get', params);
  },
  getAppByProjectId(projectId, params) {
    const param = { projectId: projectId};
    if (params) {
      Object.assign(param, params);
    }
    return axios.post('/api/rest/rdm/project/app/get', param);
  },
  getProjectById(projectId) {
    return axios.post('/api/rest/rdm/project/get', { id: projectId });
  },
  searchProject(params) {
    return axios.post('/api/rest/rdm/project/search', params);
  },
  getProjectStatusById(id) {
    return axios.post('/api/rest/rdm/project/status/get', { id: id });
  },
  getStatusByProjectId(projectId) {
    return axios.post('/api/rest/rdm/project/status/list', { projectId: projectId });
  },
  getStatusRelByProjectId(projectId) {
    return axios.post('/api/rest/rdm/project/statusrel/list', { projectId: projectId });
  },
  saveProject(params) {
    return axios.post('/api/rest/rdm/project/save', params);
  },
  getStatusRelById(id) {
    return axios.post('/api/rest/rdm/project/statusrel/get', { id: id });
  },
  updateAttrIsActive(id, isActive) {
    return axios.post('/api/rest/rdm/project/app/attr/toggleactive', { id: id, isActive: isActive });
  },
  updateAttrIsRequired(id, isRequired) {
    return axios.post('/api/rest/rdm/project/app/attr/toggleisrequired', { id: id, isRequired: isRequired });
  },
  updateStatusRel(params) {
    return axios.post('/api/rest/rdm/project/statusrel/save', params);
  },
  saveProjectStatus(params) {
    return axios.post('/api/rest/rdm/project/status/save', params);
  },
  deleteAttrById(id) {
    return axios.post('/api/rest/rdm/project/app/attr/delete', { id: id });
  },
  deleteProjectById(id) {
    return axios.post('/api/rest/rdm/project/delete', { id: id });
  },
  closeProjectById(id) {
    return axios.post('/api/rest/rdm/project/close', { id: id });
  },
  openProjectById(id) {
    return axios.post('/api/rest/rdm/project/open', { id: id });
  }
};
export default project;

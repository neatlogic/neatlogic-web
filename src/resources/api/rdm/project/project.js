import axios from '../../http';

const project = {
  saveObjectAttr(params) {
    return axios.post('/api/rest/rdm/project/object/attr/save', params);
  },
  updateAttrSort(params) {
    return axios.post('/api/rest/rdm/project/object/attr/updatesort', params);
  },
  getAttrById(id) {
    return axios.post('/api/rest/rdm/project/object/attr/get', { id: id });
  },
  listCustomAttrType() {
    return axios.post('/api/rest/rdm/project/object/customattrtype/list', {});
  },
  searchObjectAttr(params) {
    return axios.post('/api/rest/rdm/project/object/attr/search', params);
  },
  getObjectByProjectId(projectId) {
    return axios.post('/api/rest/rdm/project/object/get', { projectId: projectId });
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
  getStatusByObjectId(objectId) {
    return axios.post('/api/rest/rdm/project/object/status/list', { objectId: objectId });
  },
  getStatusRelByProjectId(projectId) {
    return axios.post('/api/rest/rdm/project/statusrel/list', { projectId: projectId });
  },
  getStatusRelByObjectId(objectId) {
    return axios.post('/api/rest/rdm/project/object/statusrel/list', { objectId: objectId });
  },
  saveProject(params) {
    return axios.post('/api/rest/rdm/project/save', params);
  },
  getStatusRelById(id) {
    return axios.post('/api/rest/rdm/project/statusrel/get', { id: id });
  },
  updateAttrIsActive(id, isActive) {
    return axios.post('/api/rest/rdm/project/object/attr/toggleactive', { id: id, isActive: isActive });
  },
  updateStatusRel(params) {
    return axios.post('/api/rest/rdm/project/statusrel/save', params);
  },
  saveProjectStatus(params) {
    return axios.post('/api/rest/rdm/project/status/save', params);
  },
  deleteAttrById(id) {
    return axios.post('/api/rest/rdm/project/object/attr/delete', { id: id });
  },
  deleteProjectById(id) {
    return axios.post('/api/rest/rdm/project/delete', { id: id });
  }
};
export default project;

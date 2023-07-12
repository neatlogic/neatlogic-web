import axios from '../../http';

const app = {
  getAppById(id, needSystemAttr) {
    return axios.post('/api/rest/rdm/app/get', { id: id, needSystemAttr: needSystemAttr });
  },
  searchAppAttr(params) {
    return axios.post('/api/rest/rdm/project/app/attr/search', params);
  },
  getAppUserSetting(appId) {
    return axios.post('/api/rest/rdm/attr/usersetting/get', { appId: appId });
  },
  saveAppUserSetting(params) {
    return axios.post('/api/rest/rdm/attr/usersetting/save', params);
  },
  getAllAppTypeList() {
    return axios.post('/api/rest/rdm/apptype/get/all', {});
  },
  activeApp(projectId, appType) {
    return axios.post('/api/rest/rdm/app/active', { projectId: projectId, appType: appType });
  },
  getCompleteRate(appId, fromIssueId, toIssueId) {
    return axios.post('/api/rest/rdm/app/complaterate', { appId: appId, fromId: fromIssueId, toId: toIssueId });
  },
  unactiveApp(projectId, appType) {
    return axios.post('/api/rest/rdm/app/unactive', { projectId: projectId, appType: appType });
  },
  saveAppConfig(params) {
    return axios.post('/api/rest/rdm/app/config/save', params);
  },
  updateAppSort(params) {
    return axios.post('/api/rest/rdm/app/updatesort', params);
  }
};
export default app;

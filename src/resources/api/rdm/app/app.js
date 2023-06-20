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
  unactiveApp(projectId, appType) {
    return axios.post('/api/rest/rdm/app/unactive', { projectId: projectId, appType: appType });
  }
};
export default app;

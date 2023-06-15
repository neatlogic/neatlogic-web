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
  }
};
export default app;

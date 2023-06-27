import axios from '../../http';

const webhook = {
  getWebhookConfigByAppId(appId) {
    return axios.post('/api/rest/rdm/webhook/config/get', {appId: appId});
  },
  saveWebhookConfig(params) {
    return axios.post('/api/rest/rdm/webhook/config/save', params);
  },
  searchWebhookData(issueId, appId) {
    return axios.post('/api/rest/rdm/webhook/data/search', { issueId: issueId, appId: appId });
  }
};
export default webhook;

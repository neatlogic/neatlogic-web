import axios from '../../http';

const webhook = {
  getWebhookConfigByAppId(appId) {
    return axios.post('/api/rest/rdm/webhook/config/get', { appId: appId });
  },
  getWebhookUrlConfig() {
    return axios.post('/api/rest/rdm/webhook/url/get');
  },
  saveWebhookConfig(params) {
    return axios.post('/api/rest/rdm/webhook/config/save', params);
  },
  searchWebhookData(params) {
    return axios.post('/api/rest/rdm/webhook/data/search', params);
  }
};
export default webhook;

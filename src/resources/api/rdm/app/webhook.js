import axios from '../../http';

const webhook = {
  getWebhookConfigByAppId(appId) {
    return axios.post('/api/rest/rdm/webhook/config/get', {appId: appId});
  },
  saveWebhookConfig(params) {
    return axios.post('/api/rest/rdm/webhook/config/save', params);
  }
};
export default webhook;

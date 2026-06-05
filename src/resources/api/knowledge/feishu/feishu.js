import axios from '../../http';

const feishu = {
  searchConfig(params) {
    return axios.post('/api/rest/knowledge/feishu/sync/config/search', params);
  },
  getConfig(params) {
    return axios.post('/api/rest/knowledge/feishu/sync/config/get', params);
  },
  saveConfig(params) {
    return axios.post('/api/rest/knowledge/feishu/sync/config/save', params);
  },
  getAppCredentials(params) {
    // Get the latest Feishu app credentials for the credentials dialog and page-entry check.
    return axios.post('/api/rest/knowledge/feishu/app/credentials/get', params);
  },
  saveAppCredentials(params) {
    // Save Feishu app credentials used by Wiki space and document sync.
    return axios.post('/api/rest/knowledge/feishu/app/credentials/save', params);
  },
  updateStatus(params) {
    return axios.post('/api/rest/knowledge/feishu/sync/config/status/update', params);
  },
  deleteConfig(params) {
    return axios.post('/api/rest/knowledge/feishu/sync/config/delete', params);
  },
  listWikiSpace(params) {
    // Load Feishu Wiki spaces for the left-side space selector.
    return axios.post('/api/rest/knowledge/feishu/wiki/space/list', params);
  },
  listWikiNode(params) {
    // Load Feishu Wiki nodes for the main table after a space is selected.
    return axios.post('/api/rest/knowledge/feishu/wiki/node/list', params);
  },
  syncWikiDocument(params) {
    // Batch sync selected Feishu Wiki spaces into NeatLogic knowledge documents.
    return axios.post('/api/rest/knowledge/feishu/wiki/document/sync', params);
  },
  execute(params) {
    return axios.post('/api/rest/knowledge/feishu/sync/execute', params);
  },
  retry(params) {
    return axios.post('/api/rest/knowledge/feishu/sync/retry', params);
  },
  searchAudit(params) {
    return axios.post('/api/rest/knowledge/feishu/sync/audit/search', params);
  }
};

export default feishu;

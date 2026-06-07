import axios from '../../http';

const feishu = {
  getAppCredentials(params) {
    // Get the latest Feishu app credentials for the credentials dialog and page-entry check.
    return axios.post('/api/rest/knowledge/feishu/app/credentials/get', params);
  },
  saveAppCredentials(params) {
    // Save Feishu app credentials used by Wiki space and document sync.
    return axios.post('/api/rest/knowledge/feishu/app/credentials/save', params);
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
  }
};

export default feishu;

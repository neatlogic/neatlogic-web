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
  updateStatus(params) {
    return axios.post('/api/rest/knowledge/feishu/sync/config/status/update', params);
  },
  deleteConfig(params) {
    return axios.post('/api/rest/knowledge/feishu/sync/config/delete', params);
  },
  listWikiSpace(params) {
    // 获取飞书 Wiki 空间列表，供同步配置管理页左侧控件展示使用。
    return axios.post('/api/rest/knowledge/feishu/wiki/space/list', params);
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

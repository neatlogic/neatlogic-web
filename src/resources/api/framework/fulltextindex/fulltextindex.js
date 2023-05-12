import axios from '../../http';

const fulltextindex = {
  getFullTextIndexRebuildAuditList(params) {
    return axios.get('/api/rest/fulltextindex/rebuildaudit/list', params);
  },
  rebuildFullTextIndex(params) {
    return axios.post('/api/rest/fulltextindex/rebuild', params);
  }
};
export default fulltextindex;

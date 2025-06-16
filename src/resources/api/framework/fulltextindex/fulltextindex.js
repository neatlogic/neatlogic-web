import axios from '../../http';

const fulltextindex = {
  getFullTextIndexRebuildAuditList(params) {
    return axios.post('/api/rest/fulltextindex/rebuildaudit/list', params);
  },
  rebuildFullTextIndex(params) {
    return axios.post('/api/rest/fulltextindex/rebuild', params);
  },
  searchWord(params) {
    return axios.post('/api/rest/fulltextindex/dictionary/word/search', params);
  },
  testSliceWord(content) {
    return axios.post('/api/rest/fulltextindex/dictionary/word/test', { content: content });
  },
  deleteWordById(id) {
    return axios.post('/api/rest/fulltextindex/dictionary/word/delete', { id: id });
  },
  addWord(params) {
    return axios.post('/api/rest/fulltextindex/dictionary/word/insert', params);
  }
};
export default fulltextindex;

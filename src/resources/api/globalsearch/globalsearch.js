import axios from '../http';

const document = {
  getDocumentTypeList() {
    return axios.post('/api/rest/globalsearch/document/type/list', {});
  },
  searchDocument(params) {
    return axios.post('/api/rest/globalsearch/document/search', params);
  }
};

export default document;

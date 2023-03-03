import axios from '../../http';

const globalsearch = {
  searchDocument(params) {
    return axios.post('/api/rest/cmdb/globalsearch', params);
  },
  searchCiEntityCount(keyword) {
    return axios.post('/api/rest/cmdb/globalsearch/cientity/count', {keyword: keyword});
  }
};

export default globalsearch;

import axios from '../../http';

const tag = {
  searchTag(params) {
    return axios.post('/api/rest/rdm/tag/search', params);
  }
};
export default tag;

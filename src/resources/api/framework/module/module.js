import axios from '../../http';

const module = {
  searchModule() {
    return axios.get('/api/rest/module/search', {});
  }
};
export default module;

import axios from '../../http';

const globallock = {
  searchLockList(params) {
    return axios.post('api/rest/global/lock/search', params);
  },
  lock(params) {
    return axios.post('api/rest/global/lock', params);
  }
};
export default globallock;

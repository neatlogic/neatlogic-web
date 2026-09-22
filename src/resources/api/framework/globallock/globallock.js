import axios from '../../http';

const globallock = {
  getLock(params) { return axios.post('api/rest/global/lock/get', params); },
  prepareOperation(params) { return axios.post('api/rest/global/lock/operation/prepare', params); },
  getOperation(params) { return axios.post('api/rest/global/lock/operation/get', params); },
  searchLockList(params) {
    return axios.post('api/rest/global/lock/search', params);
  },
  lock(params) {
    return axios.post('api/rest/global/lock', params);
  }
};
export default globallock;

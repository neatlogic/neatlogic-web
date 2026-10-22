import axios from '../../http';

const selfcheck = {
  searchTarget(params) {
    return axios.post('/api/rest/selfcheck/target/search', params);
  },
  saveScenario(params) {
    return axios.post('/api/rest/selfcheck/scenario/save', params);
  },
  getScenario(params) {
    return axios.post('/api/rest/selfcheck/scenario/get', params);
  },
  searchScenario(params) {
    return axios.post('/api/rest/selfcheck/scenario/search', params);
  },
  deleteScenario(params) {
    return axios.post('/api/rest/selfcheck/scenario/delete', params);
  },
  updateScenarioStatus(params) {
    return axios.post('/api/rest/selfcheck/scenario/status/update', params);
  },
  validateScript(params) {
    return axios.post('/api/rest/selfcheck/script/validate', params);
  },
  testItem(params) {
    return axios.post('/api/rest/selfcheck/item/test', params);
  },
  createRun(params) {
    return axios.post('/api/rest/selfcheck/run/create', params);
  },
  searchRun(params) {
    return axios.post('/api/rest/selfcheck/run/search', params);
  },
  getRun(params) {
    return axios.post('/api/rest/selfcheck/run/get', params);
  }
};

export default selfcheck;

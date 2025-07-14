import axios from '../../http';

const log = {
  getLogFileNameList(params) {
    return axios.post('/api/rest/log/filename/list', params);
  },
  getLogContent(params) {
    return axios.post('/api/rest/log/content/get', params);
  },
  updateLogLevel(params) {
    return axios.post('/api/rest/logger/updatelevel', params);
  }
};

export default log;

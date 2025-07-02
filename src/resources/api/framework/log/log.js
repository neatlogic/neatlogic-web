import axios from '../../http';

const log = {
  getLogFileNameList(params) {
    return axios.post('/api/rest/log/filename/list', params);
  },
  
  getLogContent(params) {
    return axios.post('/api/rest/log/content/get', params);
  }
};

export default log;

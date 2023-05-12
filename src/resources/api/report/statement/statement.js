import axios from '../../http';

const statement = {
  getStatementById(id) {
    return axios.post('/api/rest/report/statement/get', {id: id});
  },
  searchStatement(params) {
    return axios.post('/api/rest/report/statement/search', params);
  },
  saveStatement(params) {
    return axios.post('/api/rest/report/statement/save', params);
  },
  toggleStatementActive(params) {
    return axios.post('/api/rest/report/statement/toggleactive', params);
  },
  deleteStatement(id) {
    return axios.post('/api/rest/report/statement/delete', {id: id});
  }
};

export default statement;

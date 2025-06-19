import axios from '../../http';

const database = {
  searchDatabaseList(params) {
    return axios.post('/api/rest/database/search', params);
  },
  getDatabaseById(params) {
    return axios.post('/api/rest/database/get', params);
  },
  deleteDatabaseById(params) {
    return axios.post('/api/rest/database/delete', params);
  },
  saveDatabase(params) {
    return axios.post('/api/rest/database/save', params);
  },
  testDatabaseById(params) {
    return axios.post('/api/rest/database/test', params);
  }
};

export default database;

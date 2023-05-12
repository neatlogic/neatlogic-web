import axios from '../../http';

const healthcheck = {
  threaddump() {
    return axios.post('/api/rest/healthcheck/threaddump', {});
  },
  searchSqlAudit(params) {
    return axios.post('/api/rest/healthcheck/sqldump', params);
  },
  toggleSqlInterceptor(params) {
    return axios.post('/api/rest/healthcheck/togglesqlinterceptor', params);
  },
  getDataSourceInfo() {
    return axios.get('/api/rest/healthcheck/datasource', {});
  },
  searchDatabaseFragment(params) {
    return axios.post('/api/rest/healthcheck/databasefragment/search', params);
  },
  rebuildTable(params) {
    return axios.post('/api/rest/healthcheck/table/rebuild', params);
  },
  getInnodbStatus() {
    return axios.get('/api/rest/healthcheck/innodb/status', {});
  }
};

export default healthcheck;

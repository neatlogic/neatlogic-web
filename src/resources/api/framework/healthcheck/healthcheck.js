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
  getSqlExplain(params) {
    // SQL监控查看执行计划接口，用于把用户当前查看的SQL提交给后端执行EXPLAIN
    return axios.post('/api/rest/healthcheck/sqlexplain', params);
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
  },
  getThreadpoolStatus(params) {
    return axios.post('/api/rest/healthcheck/threadpool/status', params);
  }
};

export default healthcheck;

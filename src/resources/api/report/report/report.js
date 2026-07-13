import axios from '../../http';

const report = {
  //查询报表
  searchReport(params) {
    return axios.post('/api/rest/report/search', params);
  },
  //获取报表模版的下拉枚举
  getReportDatalist(params) {
    return axios.post('/api/rest/report/list', params);
  },
  getReportType() {
    return axios.post('/api/rest/report/type/get', {});
  },
  toggleReportActive(params) {
    return axios.post('/api/rest/report/toggleactive', params);
  },
  getReportById(id) {
    return axios.post('/api/rest/report/get', {id: id});
  },
  saveReport(params) {
    return axios.post('/api/rest/report/save', params);
  },
  validReportName(params) {
    return axios.post('/api/rest/report/save', params, {
      headers: { unConsole: 1, 'neatlogic-validfield': 'name' }
    });
  },
  searchSqlTable(params) {
    return axios.post('/api/rest/report/sqldefine/table/search', params);
  },
  getSqlTable(params) {
    return axios.post('/api/rest/report/sqldefine/table/get', params);
  },
  buildSqlGraphSql(params) {
    return axios.post('/api/rest/report/sqlgraph/sql/build', params);
  },
  analyzeSqlGraphXml(params) {
    return axios.post('/api/rest/report/sqlgraph/xml/analyze', params);
  },
  getReportSqlExecution(params) {
    return axios.post('/api/rest/report/sql/execution/get', params);
  },
  deleteReport(params) {
    return axios.post('/api/rest/report/delete', params);
  },
  getMatrixAttributeByUuid(params) {
    return axios.post('/api/rest/matrix/attribute/search', params);
  },
  getReportList() {
    return axios.post('', {});
  },
  searchReportInstance(params) {
    return axios.post('/api/rest/reportinstance/search', params);
  },
  saveReportInstance(param) {
    return axios.post('/api/rest/reportinstance/save', param);
  },
  getReportInstanceById(id) {
    return axios.post('/api/rest/reportinstance/get', {id: id});
  },
  toggleReportInstanceActive(params) {
    return axios.post('/api/rest/reportinstance/toggleactive', params);
  },
  showReportSvg(id, params, token) {
    return axios.post('/api/binary/report/show/' + id, params, {
      cancelAxios: token
    });
  },
  deleteReportInstance(params) {
    return axios.post('/api/rest/reportinstance/delete', params);
  },
  getReportInstanceMenu(params) {
    return axios.post('/api/rest/reportinstance/list', params);
  },
  searchBlackWhiteList(params) {
    return axios.post('/api/rest/report/config/blackwhitelist/search', params);
  },
  saveBlackWhite(params) {
    return axios.post('/api/rest/report/config/blackwhitelist/save', params);
  }
};

export default report;

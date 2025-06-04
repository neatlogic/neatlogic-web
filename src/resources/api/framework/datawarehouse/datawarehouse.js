import axios from '../../http';

const datawarehouse = {
  getDatasourceById(id) {
    return axios.post('/api/rest/datawarehouse/datasource/get', {id: id});
  },
  searchData(params) {
    return axios.post('/api/rest/datawarehouse/datasource/data/search', params);
  },
  searchDataSource(params) {
    return axios.post('/api/rest/datawarehouse/datasource/search', params);
  },
  saveDataSource(params) {
    return axios.post('/api/rest/datawarehouse/datasource/save', params);
  },
  saveDataSourcePolicy(params) {
    return axios.post('/api/rest/datawarehouse/datasource/policy/save', params);
  },
  saveDataSourceField(params) {
    return axios.post('/api/rest/datawarehouse/datasource/fields/save', params);
  },
  importDataSource(params) {
    return axios.post('/api/rest/datawarehouse/datasource/import', params);
  },
  execDataSource(id) {
    return axios.post('/api/rest/datawarehouse/datasource/execute', {id: id});
  },
  activeDataSource(params) {
    return axios.post('/api/rest/datawarehouse/datasource/active', params);
  },
  getDataSourceStatusByIds(idList) {
    return axios.post('/api/rest/datawarehouse/datasource/status/get', {idList: idList});
  },
  getDataSourceConditionField(id) {
    return axios.post('/api/rest/datawarehouse/datasource/condition/get', {id: id});
  },
  searchDataSourceAudit(params) {
    return axios.post('/api/rest/datawarehouse/datasource/audit/search', params);
  },
  deleteDataSource(id) {
    return axios.post('/api/rest/datawarehouse/datasource/delete', {id: id});
  },
  updateDatasourceParamCurrentValue(id) {
    return axios.post('/api/rest/datawarehouse/datasource/param/reset', {id: id});
  },
  validXml(xml) {
    return axios.post('/api/rest/datawarehouse/datasource/validxml', {xml: xml});
  }
};

export default datawarehouse;

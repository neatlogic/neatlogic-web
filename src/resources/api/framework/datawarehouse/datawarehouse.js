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
  },
  // 根据界面语言加载示例，未指定语言时沿用中文示例。
  getExample(locale) {
    const fileName = /^en(?:[-_]|$)/i.test(locale || '') ? 'datasource_example_en.xml' : 'datasource_example.xml';
    return fetch(`/resource/example/${fileName}`, {
      method: 'get',
      credentials: 'same-origin',
      responseType: 'text'
    }).then(res => res.text());
  }
};

export default datawarehouse;

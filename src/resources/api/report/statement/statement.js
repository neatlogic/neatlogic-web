import axios from '../../http';
import { getDatasourceType } from './datasource';

const statement = {
  // 大屏统一通过租户模块的 dashboard 入口查询数据源，类型字段为后续集成来源预留扩展点。
  listDatasource(params = {}) {
    return axios.post('/api/rest/dashboard/datasource/list', { ...params, datasourceType: getDatasourceType(params.datasourceType) });
  },
  // 保留详情接口的 id 参数，避免改变已保存组件的字段绑定方式。
  getDatasource(params) {
    return axios.post('/api/rest/dashboard/datasource/get', { ...params, datasourceType: getDatasourceType(params.datasourceType) });
  },
  // 取数接口保留 dataSourceId、条件、排序和 limit 的原始语义。
  searchDatasourceData(params) {
    return axios.post('/api/rest/dashboard/datasource/data/search', { ...params, datasourceType: getDatasourceType(params.datasourceType) });
  },
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

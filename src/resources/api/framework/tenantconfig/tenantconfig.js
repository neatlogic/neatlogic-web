import axios from '../../http';

const tenantconfig = {
  listTenantConfig(param) {
    return axios.post('api/rest/tenantconfig/list', param);
  },
  getTenantConfig(param) {
    return axios.post('api/rest/tenantconfig/get', param);
  },
  saveTenantConfig(param) {
    return axios.post('api/rest/tenantconfig/save', param);
  },
  getMiddlewareConfig(param) {
    return axios.post('api/rest/middlewareconfig/get', param);
  }
};
export default tenantconfig;

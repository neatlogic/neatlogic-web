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
  }
};
export default tenantconfig;

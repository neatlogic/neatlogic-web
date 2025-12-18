import axios from '../../http';

const license = {
  getLicense() {
    return axios.get('/api/rest/license/get', {});
  },
  updateLicense(license) {
    return axios.post('/anonymous/api/rest/license/update', {license: license}, {headers: {'Tenant': TENANT}});
  },
  updateLicenseExpireDate(license) {
    return axios.post('/api/rest/license/expiredate/update', {license: license});
  },
  checkTenant() {
    return axios.get('/api/rest/tenant/check/' + TENANT);
  }
};
export default license;

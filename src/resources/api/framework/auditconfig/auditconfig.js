import axios from '../../http';

const auditconfig = {
  // 获取接口树形目录
  getAuditConfig(name) {
    return axios.post('/api/rest/auditconfig/get', {name: name});
  },
  saveApiConfig(params) {
    return axios.post('/api/rest/auditconfig/save', params);
  }

};

export default auditconfig;

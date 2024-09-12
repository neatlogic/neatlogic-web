import axios from '../../http';

const policy = {
  getPolicyById(id) {
    return axios.post('/api/rest/pbc/policy/get', { id: id });
  },
  searchPolicy(params) {
    return axios.post('/api/rest/pbc/policy/search', params);
  },
  searchPolicyAudit(params) {
    return axios.post('/api/rest/pbc/policy/audit/search', params);
  },
  savePolicy(params) {
    return axios.post('/api/rest/pbc/policy/save', params);
  },
  getInterfaceByPolicyId(id) {
    return axios.post('/api/rest/pbc/policy/interface/list', { id: id });
  },
  getPolicyAuditById(auditId) {
    return axios.post('/api/rest/pbc/policy/audit/get', { id: auditId });
  },
  deletePolicy(id) {
    return axios.post('/api/rest/pbc/policy/delete', { id: id });
  },
  executePolicy(id) {
    return axios.post('/api/rest/pbc/policy/execute', { id: id });
  },
  redoPolicy(params) {
    return axios.post('/api/rest/pbc/policy/redo', params);
  },
  getPolicyAuditInterfaceItemStatist(auditId) {
    return axios.post('/api/rest/pbc/policy/audit/interfaceitem/statist', { auditId: auditId });
  },
  getPhaseList() {
    return axios.post('/api/rest/pbc/policy/phase/list', {});
  },
  deletePolicyAudit(id) {
    return axios.post('/api/rest/pbc/policy/audit/delete', { id: id });
  },
  getAuditInterfaceList(id) {
    return axios.post('/api/rest/pbc/policy/audit/interface/list', { id: id });
  },
  getPhaseInterfaceList(id) {
    return axios.post('/api/rest/pbc/policy/phase/interface/list', { id: id });
  },
  getLastPolicyAudit(params) {
    return axios.post('/api/rest/pbc/policy/audit/getlast', params);
  }
};

export default policy;

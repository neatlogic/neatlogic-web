import axios from '../../http';

const batchImport = {
  searchAudit(params) {
    return axios.post('/api/rest/cmdb/import/audit/search', params);
  },
  getAuditById(id) {
    return axios.post('/api/rest/cmdb/import/audit/get', {id: id});
  },
  deleteFile(params) {
    return axios.post('/api/rest/cmdb/import/file/delete', params);
  },
  uploadFile(params) {
    return axios.post('/api/binary/cmdb/import/file/upload', params);
  },
  getFile(params) {
    return axios.post('/api/rest/cmdb/import/files/get', params);
  },
  startImport(params) {
    return axios.post('/api/rest/cmdb/import/fire', params);
  },
  stopImport(params) {
    return axios.post('/api/rest/cmdb/import/stop', params);
  },
  getImportFieldList(id) {
    return axios.post('/api/rest/cmdb/ci/import/listfield', {id: id});
  }
};

export default batchImport;

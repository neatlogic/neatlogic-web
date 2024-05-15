import axios from '../../http';

const sync = {
  searchSyncPolicy(params) {
    return axios.post('/api/rest/cmdb/sync/policy/search', params);
  },
  getSyncPolicyById(id) {
    return axios.post('/api/rest/cmdb/sync/policy/get', { id: id });
  },
  searchSyncCiCollection(param) {
    return axios.post('/api/rest/cmdb/sync/cicollection/search', param);
  },
  getSyncCiCollectionById(id) {
    return axios.post('/api/rest/cmdb/sync/cicollection/get', { id: id });
  },
  saveSyncCiCollection(params) {
    return axios.post('/api/rest/cmdb/sync/cicollection/save', params);
  },
  getCollectionList(params) {
    return axios.post('/api/rest/cmdb/sync/collection/list', params || {});
  },
  getFieldByCollection(id) {
    return axios.post('/api/rest/cmdb/sync/condition/field/get', { id: id });
  },
  checkCiHasSyncCollection(ciId) {
    return axios.post('/api/rest/cmdb/sync/checkhascollection', { ciId: ciId });
  },
  savePolicy(params) {
    return axios.post('/api/rest/cmdb/sync/policy/save', params);
  },
  searchSyncAudit(params) {
    return axios.post('/api/rest/cmdb/syncaudit/search', params);
  },
  deleteSyncCiCollection(id) {
    return axios.post('/api/rest/cmdb/sync/cicollection/delete', { id: id });
  },
  deletePolicy(id) {
    return axios.post('/api/rest/cmdb/sync/policy/delete', { id: id });
  },
  deleteSyncAudit(id) {
    return axios.post('/api/rest/cmdb/syncaudit/delete', { id: id });
  },
  testCondition(params) {
    return axios.post('/api/rest/cmdb/sync/policy/condition/test', params);
  },
  launchSyncCiCollection(params) {
    return axios.post('/api/rest/cmdb/sync/cicollection/launch', params);
  },
  launchSyncCiCollectionBatch(idList) {
    return axios.post('/api/rest/cmdb/sync/cicollection/launch', { idList: idList });
  },
  searchCollectionData(params) {
    return axios.post('/api/rest/cmdb/sync/collection/data/search', params);
  },
  deleteUnknowCollectionData(_id) {
    return axios.post('/api/rest/cmdb/sync/collection/unknown/delete', { _id: _id });
  },
  searchObject(params) {
    return axios.post('/api/rest/cmdb/sync/object/search', params);
  },
  getObjectById(id) {
    return axios.post('/api/rest/cmdb/sync/object/get', { id: id });
  },
  saveObject(params) {
    return axios.post('/api/rest/cmdb/sync/object/save', params);
  },
  deleteObject(id) {
    return axios.post('/api/rest/cmdb/sync/object/delete', { id: id });
  }
};

export default sync;

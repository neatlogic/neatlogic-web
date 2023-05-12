import axios from '../../http';

const transaction = {
  //保存配置项信息
  saveCiEntity(params) {
    return axios.post('/api/rest/cmdb/cientity/save', params);
  },
  //搜索事务
  searchTransaction(params) {
    return axios.post('/api/rest/cmdb/transaction/search', params);
  },
  searchTransactionCount(params) {
    return axios.post('/api/rest/cmdb/transaction/search/count', params);
  },
  getCientityTransaction(transactionId, ciId, ciEntityId) {
    return axios.post('/api/rest/cmdb/cientitytransaction/get', { transactionId: transactionId, ciId: ciId, ciEntityId: ciEntityId });
  },
  getDeletedCientityTransaction(transactionId) {
    return axios.post('/api/rest/cmdb/deletedcientitytransaction/get', { transactionId: transactionId });
  },
  commitTransaction(transactionId) {
    return axios.post('/api/rest/cmdb/transaction/commit', { id: transactionId });
  },
  getBrotherTransactionCount(transactionId, transactionGroupId) {
    return axios.post('/api/rest/cmdb/transaction/brothercount', { transactionId: transactionId, transactionGroupId: transactionGroupId });
  },
  deleteTransaction(transactionId) {
    return axios.post('/api/rest/cmdb/transaction/delete', { id: transactionId });
  },
  recoverTransaction(transactionId) {
    return axios.post('/api/rest/cmdb/transaction/recover', { id: transactionId });
  }
};

export default transaction;

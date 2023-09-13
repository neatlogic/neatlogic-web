import axios from '../../http';

const globalattr = {
  getCiEntityGlobalAttr(ciEntityId) {
    return axios.post('/api/rest/cmdb/cientity/globalattr/get', { ciEntityId: ciEntityId });
  },
  searchGlobalAttr(params) {
    return axios.post('/api/rest/cmdb/globalattr/search', params || {});
  },
  deleteGlobalAttr(attrId) {
    return axios.post('/api/rest/cmdb/globalattr/delete', {id: attrId});
  }
};

export default globalattr;

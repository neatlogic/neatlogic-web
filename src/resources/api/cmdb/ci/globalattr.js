import axios from '../../http';

const globalattr = {
  getCiEntityGlobalAttr(ciEntityId, params) {
    let param = {
      ciEntityId: ciEntityId
    };
    if (params) {
      param = Object.assign(param, params);
    }
    return axios.post('/api/rest/cmdb/cientity/globalattr/get', param);
  },
  getGlobalAttrById(id) {
    return axios.post('/api/rest/cmdb/globalattr/get', { id: id });
  },
  searchGlobalAttr(params) {
    return axios.post('/api/rest/cmdb/globalattr/search', params || {});
  },
  deleteGlobalAttr(attrId) {
    return axios.post('/api/rest/cmdb/globalattr/delete', { id: attrId });
  },
  saveGlobalAttr(params) {
    return axios.post('/api/rest/cmdb/globalattr/save', params);
  }
};

export default globalattr;

import axios from '../../http';

const citype = {
  //获取模型类型信息
  getCiTypeById(id) {
    return axios.post('/api/rest/cmdb/citype/get', {id: id});
  },
  saveCiType(param) {
    return axios.post('/api/rest/cmdb/citype/save', param);
  },
  // 可选传入显示条件，未传时保留所有模型层级。
  listCiType(params = {}) {
    return axios.post('/api/rest/cmdb/citype/list', params);
  },
  saveAllCiType(param) {
    return axios.post('/api/rest/cmdb/citype/saveall', param);
  }

};

export default citype;

import axios from '../../http';

const citype = {
  //获取模型类型信息
  getCiTypeById(id) {
    return axios.post('/api/rest/cmdb/citype/get', {id: id});
  },
  saveCiType(param) {
    return axios.post('/api/rest/cmdb/citype/save', param);
  },
  listCiType() {
    return axios.post('/api/rest/cmdb/citype/list', {});
  },
  saveAllCiType(param) {
    return axios.post('/api/rest/cmdb/citype/saveall', param);
  }

};

export default citype;

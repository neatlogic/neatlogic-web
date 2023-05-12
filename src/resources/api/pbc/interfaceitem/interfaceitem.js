
import axios from '../../http';

const interfaceitem = {
  searchInterfaceItem(params) {
    return axios.post('/api/rest/pbc/interfaceitem/search', params);
  },
  getInterfaceItemById(id) {
    return axios.post('/api/rest/pbc/interfaceitem/get', {id: id});
  },
  getInterfaceItemByIdList(idList) {
    return axios.post('/api/rest/pbc/interfaceitem/getlist', {idList: idList});
  },
  saveInterfaceItem(params) {
    return axios.post('/api/rest/pbc/interfaceitem/save', params);
  },
  validInterfaceItem(id) {
    return axios.post('/api/rest/pbc/interfaceitem/valid', {id: id});
  },
  deleteInterfaceItem(id) {
    return axios.post('/api/rest/pbc/interfaceitem/delete', {id: id});
  },
  batchDeleteInterfaceItem(idList) {
    return axios.post('/api/rest/pbc/interfaceitem/batchdelete', {idList: idList});
  }
};

export default interfaceitem;

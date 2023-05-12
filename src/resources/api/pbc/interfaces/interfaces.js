import axios from '../../http';

const interfaces = {
  searchInterface(params) {
    return axios.post('/api/rest/pbc/interface/search', params);
  },
  getInterfaceById(id) {
    return axios.post('/api/rest/pbc/interface/get', {id: id});
  },
  getCustomViewAttrList(customViewId) {
    return axios.post('/api/rest/pbc/customview/attr/list', {customViewId: customViewId});
  },
  getCiAttrRelList(ciId) {
    return axios.post('/api/rest/pbc/ci/attrrel/list', {ciId: ciId});
  },
  saveInterfaceMapping(params) {
    return axios.post('/api/rest/pbc/interface/mapping/save', params);
  },
  syncInterfaceData(interfaceId) {
    return axios.post('/api/rest/pbc/interface/sync', {interfaceId: interfaceId});
  },
  getAllInterfaceList(needItemCount) {
    return axios.post('/api/rest/pbc/interface/listall', {needItemCount: needItemCount});
  },
  getInterfaceCorporation(interfaceId) {
    return axios.post('/api/rest/pbc/interface/corporation/get', {interfaceId: interfaceId});
  },
  saveInterface(params) {
    return axios.post('/api/rest/pbc/interface/save', params);
  },
  deleteInterfaceById(id) {
    return axios.post('/api/rest/pbc/interface/delete', {id: id});
  }
};

export default interfaces;

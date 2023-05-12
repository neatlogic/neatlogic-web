import axios from '../../http';

const property = {
  getPropertyByInterfaceId(interfaceId, isFlatten) {
    return axios.post('/api/rest/pbc/interface/property/get', {interfaceId: interfaceId, isFlatten: isFlatten});
  },
  searchProperty(params) {
    return axios.post('/api/rest/pbc/property/search', params);
  },
  getPropertyByUid(uid) {
    return axios.post('/api/rest/pbc/property/get', {uid: uid});
  },
  getPropertyDataTypeList() {
    return axios.get('/api/rest/pbc/property/datatype/list', {});
  },
  getPropertyValueRangeList() {
    return axios.get('/api/rest/pbc/property/valuerange/list', {});
  },
  saveProperty(params) {
    return axios.post('/api/rest/pbc/property/save', params);
  },
  savePropertyRel(params) {
    return axios.post('/api/rest/pbc/property/rel/save', params);
  },
  getPropertyRelByPropertyUid(uid) {
    return axios.post('/api/rest/pbc/property/rel/list', {uid: uid});
  },
  getEnumByPropertyId(propertyId) {
    return axios.post('/api/rest/pbc/property/enum/list', {propertyId: propertyId});
  },
  saveEnum(propertyId, enumList) {
    return axios.post('/api/rest/pbc/enum/save', {propertyId: propertyId, enumList: enumList});
  },
  updatePropertySort(propertyList) {
    return axios.post('/api/rest/pbc/property/updatesort', {propertyList: propertyList});
  },
  deleteProperty(uid) {
    return axios.post('/api/rest/pbc/property/delete', {uid: uid});
  }
};

export default property;

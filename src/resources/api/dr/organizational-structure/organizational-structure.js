import axios from '@/resources/api/http';
const organizationalStructure = {
  saveUserInfo() {
    return axios.post('/api/rest/dr/organizationalstructure/save');
  },
  getOrganizationalStructure() {
    return axios.post('/api/rest/dr/organizationalstructure/get');
  },
  deleteUserById() {
    return axios.post('/api/rest/dr/organizationalstructure/delete');
  },
  saveOrganizationalStructure() {
    return axios.post('/api/rest/dr/organizationalstructure/save');
  },
  deleteOrganizationalStructureById() {
    return axios.post('/api/rest/dr/organizationalstructure/delete');
  },
  searchOrganizationalStructureData() {
    return axios.post('/api/rest/dr/organizationalstructure/get');
  }
};
export default organizationalStructure;

import axios from '@/resources/api/http';
const organizationalStructure = {
  saveUserInfo() {
    return axios.post('/api/rest/dr/basicsettings/get');
  },
  getOrganizationalStructure() {
    return axios.post('/api/rest/dr/basicsettings/get');
  },
  deleteUserById() {
    return axios.post('/api/rest/dr/basicsettings/get');
  }
};
export default organizationalStructure;

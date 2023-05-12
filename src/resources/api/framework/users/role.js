import axios from '../../http';

const role = {
  roleList(parmas) {
    return axios.post('/api/rest/role/search', parmas);
  },
  roleCount() {
    return axios.get('/api/rest/role/count');
  },
  saverole(data) {
    return axios.post('/api/rest/role/save', data);
  },
  delrole(data) {
    return axios.post('/api/rest/role/delete', data);
  },
  searchrole(data) {
    return axios.post('api/rest/user/role/team/search', data);
  },
  //删除角色里的用户
  deleltRoleUser(data) {
    return axios.post('/api/rest/role/user/delete', data);
  }
};

export default role;

import axios from '../http';

const login = {
  loginIn(data) {
    return axios.post('/login/check', data);
  },
  checkTenant() {
    return axios.post('/tenant/check');
  }
};

export default login;

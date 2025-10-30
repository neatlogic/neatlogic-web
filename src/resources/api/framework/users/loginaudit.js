import axios from '../../http';
export default {
  
  searchLoginList(params) {
    return axios.post('api/rest/login/audit/list', params);
  }
};

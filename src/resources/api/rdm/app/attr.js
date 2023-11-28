import axios from '../../http';

const attr = {
  getPrivateAttrList(params) {
    return axios.post('/api/rest/rdm/project/app/privateattr/list', params || {});
  }
};
export default attr;

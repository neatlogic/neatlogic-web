import axios from '../../http';

const attr = {
  getPrivateAttrList() {
    return axios.post('/api/rest/rdm/project/app/privateattr/list', {});
  }
};
export default attr;

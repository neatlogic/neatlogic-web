import axios from '../../http';

const attr = {
  getPrivateAttrList(needSystemAttr) {
    return axios.post('/api/rest/rdm/project/app/privateattr/list', { needSystemAttr: needSystemAttr });
  }
};
export default attr;

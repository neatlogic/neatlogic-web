import axios from '../../http';

const homepage = {
  getHomepageConfig(params) {
    return axios.post('api/rest/homepage/get', params);
  },
  getHomepageList(params) {
    return axios.post('api/rest/homepage/list', params);
  },
  moveHomepage(params) {
    return axios.post('api/rest/homepage/move', params);
  },
  saveHomepage(params) {
    return axios.post('api/rest/homepage/save', params);
  },
  deleteHomepage(params) {
    return axios.post('api/rest/homepage/delete', params);
  },
  updateActive(params) {
    return axios.post('api/rest/homepage/updateActive', params);
  }
};
export default homepage;

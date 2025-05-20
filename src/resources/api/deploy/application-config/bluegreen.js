import axios from '../../http';
const bluegreen = {
  searchBlueGreen(params) {
    return axios.post('api/rest/deploy/bluegreen/search', params);
  },
  saveBlueGreen(params) {
    return axios.post('api/rest/deploy/bluegreen/save', params);
  }
};

export default bluegreen;

import axios from '../../http';
const theme = {
  getTheme() {
    return axios.post('/tenant/check');
  },
  saveTheme(params) {
    return axios.post('/api/rest/theme/save', params);
  }
};
export default theme;

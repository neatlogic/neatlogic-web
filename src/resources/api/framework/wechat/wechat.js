import axios from '../../http';

const wechat = {
  save(params) {
    return axios.post('/api/rest/wechat/save', params);
  },
  test(params) {
    return axios.post('/api/rest/wechat/test', params);
  },
  get() {
    return axios.post('/api/rest/wechat/get');
  }
};
export default wechat;

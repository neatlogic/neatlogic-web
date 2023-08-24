import axios from '../../http';

const server = {
  getServerList() {
    return axios.post('api/rest/server/list', {});
  },
  saveServer(param) {
    return axios.post('api/rest/server/save', param);
  }
};
export default server;

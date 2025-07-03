import axios from '../../http';

const server = {
  getServerList(param) {
    return axios.post('api/rest/server/list', param);
  },
  saveServer(param) {
    return axios.post('api/rest/server/save', param);
  }
};
export default server;

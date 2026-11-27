import axios from '../../http';

const server = {
  getServerList(param) {
    return axios.post('api/rest/server/list', param);
  },
  saveServer(param) {
    return axios.post('api/rest/server/save', param);
  },
  // 删除指定服务器节点，是否停机由后端复核。
  deleteServer(param) {
    return axios.post('api/rest/server/delete', param);
  }
};
export default server;

import axios from '../../http';
const scene = {
  getSceneList() {
    return axios.post('/api/rest/dr/scene/list', {});
  },
  getSceneData(params) {
    return axios.post('/api/rest/dr/scene/get', params);
  },
  deleteScene(params) {
    return axios.post('/api/rest/dr/scene/delete', params);
  },
  saveScene(params) {
    return axios.post('/api/rest/dr/scene/save', params);
  }
};
export default scene;

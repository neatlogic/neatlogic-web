import axios from '../../http';
const scenario = {
  saveSceneDefinition(params) {
    // 保存场景定义
    return axios.post('/api/rest/autoexec/scenario/save', params);
  },
  getSceneDefinitionList(params) {
    // 获取场景定义列表
    return axios.post('/api/rest/autoexec/scenario/search', params);
  },
  deleteSceneDefinitionById(id) {
    // 获取场景定义列表
    return axios.post('/api/rest/autoexec/scenario/delete', {id: id});
  }
};

export default scenario;

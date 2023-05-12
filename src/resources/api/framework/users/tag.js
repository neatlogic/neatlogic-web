import axios from '../../http';
export default {
  getTeamTagList(parmas) {
    //获取用户分组标签列表信息
    return axios.get('/api/rest/tag/search', {
      params: parmas
    });
  },
  saveTeamTagByName(data) {
    //新增用户分组标签
    return axios.post('/api/rest/tag/save', data);
  },
  delTeamTagById(data) {
    //删除用户分组标签
    return axios.post('/api/rest/tag/delete', data);
  }
};

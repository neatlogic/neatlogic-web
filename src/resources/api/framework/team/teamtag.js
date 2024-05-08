import axios from '../../http';
export default {
  //获取分组标签
  searchTeamTag(data) {
    return axios.post('/api/rest/team/tag/search', data);
  },
  //获取标签关联的分组
  searchTeamTagTeam(data) {
    return axios.post('/api/rest/team/tag/team/search', data);
  },
  //保存标签关联的分组
  saveTeamTagTeam(data) {
    return axios.post('/api/rest/team/tag/team/save', data);
  }
};

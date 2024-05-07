import axios from '../../http';
export default {
  //获取分组标签
  searchTeamTag(data) {
    return axios.post('/api/rest/team/tag/search', data);
  }
};

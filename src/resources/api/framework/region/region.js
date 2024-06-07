import axios from '@/resources/api/http.js';

const region = {
  //获取地域树
  searchTree(data) {
    return axios.post('/api/rest/region/tree/search', data);
  },
  //地域移动位置
  moveRegion(data) {
    return axios.post('/api/rest/region/tree/move', data);
  },
  //地域保存
  saveRegion(data) {
    return axios.post('/api/rest/region/save', data);
  },
  //地域删除
  deleteRegion(data) {
    return axios.post('/api/rest/region/delete', data);
  },
  //获取地域分组
  searchRegionTeam(data) {
    return axios.post('/api/rest/region/team/search', data);
  },
  //保存地域分组
  saveRegionTeam(data) {
    return axios.post('/api/rest/region/team/save', data);
  },
  //删除地域分组
  deleteRegionTeam(data) {
    return axios.post('/api/rest/region/team/delete', data);
  }

};

export default region;

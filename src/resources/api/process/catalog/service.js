import axios from '../../http';

const service = {
  //获取所有服务目录（包含层级关系）
  allService(params) {
    return axios.post('/api/rest/process/catalog/tree/search', params);
  },
  //获取某个服务目录下的所有服务目录路径接口
  getCalalogroute(params) {
    return axios.post('/api/rest/process/catalog/breadcrumb/search', params);
  },
  //服务搜索
  searchService(params) {
    return axios.post('/api/rest/process/channel/search', params);
  },
  //服务通收藏控制
  changeLike(data) {
    return axios.post('/api/rest/process/channel/user/save', data);
  },
  //服务目录及服务树查询接口
  searchTree(data) {
    return axios.post('/api/rest/process/catalog/channel/tree/search', data);
  },
  //服务目录移动位置
  moveCatalog(data) {
    return axios.post('/api/rest/process/catalog/move', data);
  },
  //服务移动位置接口
  moveChannel(data) {
    return axios.post('/api/rest/process/channel/move', data);
  },
  //服务目录获取信息接口
  getCatalogInfo(data) {
    return axios.post('/api/rest/process/catalog/get', data);
  },
  //服务获取信息接口
  getChannelInfo(data) {
    return axios.post('/api/rest/process/channel/get', data);
  },
  //服务目录保存信息接口
  saveCatalogInfo(data) {
    return axios.post('/api/rest/process/catalog/save', data);
  },
  //服务保存信息接口
  saveChannelInfo(data) {
    return axios.post('/api/rest/process/channel/save', data);
  },
  //服务目录删除接口
  deleteCatalog(data) {
    return axios.post('/api/rest/process/catalog/delete', data);
  },
  //服务删除接口
  deleteChannel(data) {
    return axios.post('/api/rest/process/channel/delete', data);
  },
  //服务授权信息查询接口
  searchChannelRole(data) {
    return axios.post('/api/rest/process/channel/role/search', data);
  },
  //服务授权控制接口
  saveChannelRole(data) {
    return axios.post('/api/rest/process/channel/role/save', data);
  }
};
export default service;

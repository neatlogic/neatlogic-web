import axios from '../../http';

const asset = {
  //资产清单类型（树形）
  getResourceTreeType(params) {
    return axios.get('/api/rest/resourcecenter/resourcetype/tree', {params: params});
  },
  getResourceList(params, config) {
    return axios.post('/api/rest/resourcecenter/resource/list', params, config);
  },
  //保存资源标签
  saveSingleTag(params) {
    return axios.post('/api/rest/resourcecenter/resource/tag/save', params);
  },
  //批量添加资源标签
  batchAddTag(params) {
    return axios.post('/api/rest/resourcecenter/resource/tag/batch/add', params);
  },
  //保存资源中心账号
  saveSingleAccount(params) {
    return axios.post('/api/rest/resourcecenter/resource/account/save', params);
  },
  //批量添加资源中心账号
  batchAddAccount(params) {
    return axios.post('/api/rest/resourcecenter/resource/account/batch/add', params);
  },
  //批量删除资源标签
  batchDelTag(params) {
    return axios.post('/api/rest/resourcecenter/resource/tag/batch/delete', params);
  },
  //批量删除资源中心账号
  batchDelAccount(params) {
    return axios.post('/api/rest/resourcecenter/resource/account/batch/delete', params);
  },
  listAccount(params) {
    // 获取所有的账号数据
    return axios.post('/api/rest/resourcecenter/resource/account/list', params);
  },
  listTag(param) {
    // 获取标签
    return axios.post('/api/rest/resourcecenter/tag/name/list/forselect', param);
  },
  searchAccount(param) {
    // 获取账号
    return axios.post('/api/rest/resourcecenter/account/search', param);
  },
  testConnectAccount(params) {
    // 测试账号可用性
    return axios.post('/api/rest/resourcecenter/account/accesstest', params);
  }
};

export default asset;

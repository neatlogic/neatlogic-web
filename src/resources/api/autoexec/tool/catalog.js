import axios from '../../http';

const catalog = {
  getCatalogList(params) {
    // 获取工具目录列表
    return axios.post('/api/rest/autoexec/catalog/tree', params);
  },
  saveCatalog(params) {
    // 保存工具目录接口
    return axios.post('/api/rest/autoexec/catalog/save', params);
  },
  delCatalogById(id) {
    // 删除工具目录接口
    return axios.post('/api/rest/autoexec/catalog/delete', {id});
  },
  searchCatalogByKeyword(params) {
    // 删除工具目录接口
    return axios.post('/api/rest/autoexec/catalog/tree/search', params);
  }, 
  moveCatalog(params) {
    // 移动组
    return axios.post('/api/rest/autoexec/catalog/move', params);
  }
};
export default catalog;

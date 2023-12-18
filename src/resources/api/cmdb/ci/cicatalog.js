import axios from '@/resources/api/http';

const cicatalog = {
  //保存模型
  getCiCatalog(params) {
    // 获取模型目录
    return axios.post('/api/rest/cmdb/cicatalog/get', params);
  },
  getCiCatalogTreeList(params) {
    // 获取模型目录树形列表
    return axios.post('/api/rest/cmdb/cicatalog/listtree', params);
  },
  saveCiCatalog(params) {
    // 保存模型目录
    return axios.post('/api/rest/cmdb/cicatalog/save', params);
  },
  deleteCiCatalog(params) {
    // 删除模型目录
    return axios.post('/api/rest/cmdb/cicatalog/delete', params);
  },
  moveCicatalog(params) {
    // 移动模型目录
    return axios.post('/api/rest/cmdb/cicatalog/move', params);
  },
  searchCiCatalogTree(params) {
    return axios.post('/api/rest/cmdb/cicatalogandci/listtree', params);
  }
};
export default cicatalog;

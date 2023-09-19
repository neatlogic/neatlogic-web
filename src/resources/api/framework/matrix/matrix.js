import axios from '../../http';

const matrix = {
  //获取矩阵列表
  getMatrixList(data) {
    return axios.get('/api/rest/matrix/search', {
      params: data
    });
  },
  //获取矩阵属性
  getMatrixAttributeByUuid(params) {
    return axios.post('/api/rest/matrix/attribute/search', params);
  },
  //获取矩阵数据
  getMatrixDataForSelect(params) {
    return axios.post('/api/rest/matrix/column/data/search/forselect', params);
  },
  //获取指定的属性数据
  getMatrixDataForTable(params) { //已弃用
    return axios.post('/api/rest/matrix/column/data/search/fortable', params);
  },
  getNewMatrixDataForTable(params) { //新表单表格选择组件获取数据时调用接口
    return axios.post('/api/rest/matrix/column/data/search/fortable/new', params);
  },
  //矩阵删除接口
  deleteMatrix(params) {
    return axios.post('/api/rest/matrix/delete', params);
  },
  //矩阵数据导出接口
  exportMatrixData(data) {
    return axios.get('/api/binary/matrix/data/export', {
      params: data,
      responseType: 'blob'
    });
  },
  //矩阵模板导出接口
  exportAttributeMatrix(data) {
    return axios.get('/api/binary/matrix/attribute/export', {
      params: data,
      responseType: 'blob'
    });
  },
  // 矩阵导出接口
  exportMatrix(data) {
    return axios.get('/api/binary/matrix/export', {
      params: data,
      responseType: 'blob'
    });
  },
  //矩阵数据源复制接口
  copyMatrix(data) {
    return axios.post('/api/rest/matrix/copy', data);
  },
  //矩阵数据检索接口
  searchMatrix(data) {
    return axios.post('/api/rest/matrix/data/search', data);
  },
  //矩阵属性保存接口
  saveMatrixAttribute(data) {
    return axios.post('/api/rest/matrix/attribute/save', data);
  },
  //矩阵新建保存
  saveMatrix(data) {
    return axios.post('/api/rest/matrix/save', data);
  },
  //矩阵数据保存接口
  saveMatrixData(data) {
    return axios.post('/api/rest/matrix/data/save', data);
  },
  //矩阵数据移动接口
  moveMatrixData(data) {
    return axios.post('/api/rest/matrix/data/move', data);
  },
  //矩阵数据删除接口
  deleteMatrixData(data) {
    return axios.post('/api/rest/matrix/data/delete', data);
  },
  //保存外部数据源
  saveExternal(data) {
    return axios.post('/api/rest/matrix/save', data);
  },
  //获取外部数据源配置
  getExternalConfig(data) {
    return axios.get('/api/rest/matrix/get', {
      params: data
    });
  },
  //外部数据搜索
  getExternalData(data) {
    return axios.get('/api/rest/matrix/data/search', {
      params: data
    });
  },
  //矩阵名称修改
  editMatrixName(data) {
    return axios.post('/api/rest/matrix/name/update', data);
  },
  //获取自定义矩阵单行数据
  getMatrixDetail(data) {
    return axios.post('/api/rest/matrix/data/get', data);
  },
  //矩阵编辑外部数据源列表
  getIntegrationList() {
    return axios.post('/api/rest/integration/search', {'handler': 'MatrixIntegrationHandler', 'isActive': 1});
  },
  //获取视图数据源配置
  getMatrixViewList(data) {
    return axios.get('/api/rest/matrix/get', {
      params: data
    });
  },
  //保存视图数据源配置
  saveMatrixViewList(data) {
    return axios.get('/api/rest/matrix/save', {
      params: data
    });
  },
  getDependencyList(params) {
    // 获取引用列表
    return axios.post('/api/rest/dependency/list', params);
  }
};
export default matrix;

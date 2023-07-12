import axios from '../../http';
const version = {
  searchVersion(params) {
    // 获取版本
    return axios.post('/api/rest/deploy/version/search', params);
  },
  saveVersion(params) {
    // 保存版本
    return axios.post('/api/rest/deploy/version/save', params);
  },
  deleteVersion(params) {
    // 删除版本
    return axios.post('/api/rest/deploy/version/delete', params);
  },
  unLockVersion(params) {
    // 解封版本
    return axios.post('/api/rest/deploy/version/unlock', params);
  },
  getTypeList(params) {
    // 获取制品类型列表
    return axios.post('/api/rest/deploy/version/resource/type/list', params);
  },
  getDirectoryList(params) {
    // 获取目录内容
    return axios.post('api/rest/deploy/version/resource/directory/content/get', params);
  },
  saveDirectory(params) {
    // 保存目录
    return axios.post('api/rest/deploy/version/resource/directory/create', params);
  },
  moveOrRenameFile(params) {
    // 移动文件
    return axios.post('api/rest/deploy/version/resource/file/move', params);
  },
  delFile(params) {
    // 删除文件
    return axios.post('api/rest/deploy/version/resource/file/delete', params);
  },
  searchVersionBuildno(params) {
    return axios.post('/api/rest/deploy/job/version/buildno/search', params);
  },
  updateFileChmod(params) {
    // 更新文件权限
    return axios.post('api/rest/deploy/version/resource/file/chmod', params);
  },
  copyFile(params) {
    // 复制文件
    return axios.post('api/rest/deploy/version/resource/file/copy', params);
  },
  versionInstanceSearch(params) {
    // 版本实例发布状态
    return axios.post('api/rest/deploy/version/instance/search', params);
  },
  getVersionEnvList(params) {
    // 版本环境列表
    return axios.post('/api/rest/deploy/version/env/list', params);
  },
  getVersionChart(params) {
    // 获取发布版本图表数据
    return axios.post('/api/rest/deploy/versoin/chart/get', params);
  },
  getLastUnitTestRecord(params) {
    // 获取发布版本最近一次单元测试记录
    return axios.post('/api/rest/deploy/versoin/lastunittest/get', params);
  },
  getCodeScanRecord(params) {
    // 获取发布版本最后一次构建质量记录
    return axios.post('/api/rest/deploy/versoin/lastbuildquality/get', params);
  },
  getCveloopholeList(params) {
    // 获取cve漏洞列表
    return axios.post('/api/rest/deploy/version/cvelist/get', params);
  },
  saveVersionCenterTheadList(params) {
    // 保存版本中心管理页面，表头可拖拽，可隐藏
    return axios.post('/api/rest/deploy/version/thead/save', params);
  }
};
export default version;

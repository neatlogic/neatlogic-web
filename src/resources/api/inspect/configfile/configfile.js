import axios from '../../http';

const configfile = {
  getConfigFileList(params) {
    return axios.post('/api/rest/inspect/configfile/resource/list', params);
  },
  batchAddPath(params) { //批量添加路径
    return axios.post('/api/rest/inspect/configfile/resource/path/batchadd', params);
  },
  batchDeletePath(params) { //批量删除路径
    return axios.post('/api/rest/inspect/configfile/resource/path/batchdelete', params);
  },
  getFilePathList(params) { //巡检配置文件资源文件路径列表
    return axios.post('/api/rest/inspect/configfile/resource/path/list', params);
  },
  saveFilePath(params) { //保存巡检配置文件资源路径
    return axios.post('/api/rest/inspect/configfile/resource/path/save', params);
  },
  clearResourceFile(params) { //清理巡检配置文件资源文件
    return axios.post('/api/rest/inspect/configfile/resource/file/clear', params);
  },
  batchDeleteFile(params) { //批量清除巡检配置文件资源文件
    return axios.post('/api/rest/inspect/configfile/resource/file/batchclear', params);
  },
  getHistoryFileList(params) { //文件扫描历史列表
    return axios.post('/api/rest/inspect/configfile/resource/audit/list', params);
  },
  getVersionFileList(params) { //文件变更记录列表
    return axios.post('/api/rest/inspect/configfile/resource/version/list', params);
  },
  getVersionData(params) {
    return axios.post('/api/rest/inspect/configfile/version/get', params);
  },
  getVersionCompareData(params) {
    return axios.post('/api/rest/inspect/configfile/version/compare', params);
  },
  getFileList(params) {
    return axios.post('/api/rest/inspect/configfile/resource/file/list', params);
  },
  searchFileList(params) { //配置文件清单
    return axios.post('/api/rest/inspect/configfile/path/list', params);
  }
};
export default configfile;

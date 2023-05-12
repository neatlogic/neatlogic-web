import axios from '../../http';
const tagent = {
  searchTagent(params) {
    return axios.post('/api/rest/tagent/search', params);
  },
  //删除tagent
  deleteTagents(params) {
    return axios.post('/api/rest/tagent/delete', params);
  },
  //查看密码
  getAccountById(params) {
    return axios.post('api/rest/tagent/account/get', params);
  },
  //获取配置
  getTagentConfig(params) {
    return axios.post('api/rest/tagent/exec/config/get', params);
  },
  //日志列表
  getWorkList(params) {
    return axios.post('api/binary/tagent/exec/log/get', params);
  },
  //保存配置
  saveTagentConfig(params) {
    return axios.post('api/rest/tagent/exec/config/save', params);
  },
  getRunner(params) {
    return axios.post('api/rest/runnergroup/runner/list', params);
  },
  resetPassword(params) {
    return axios.post('api/rest/tagent/exec/password/reset', params);
  },
  restart(params) {
    return axios.post('api/rest/tagent/exec/reload', params);
  },
 
  versionUpgrade(params) { 
    // 升级版本
    return axios.post('api/rest/tagent/upgrade', params);
  },
  getBatchUpgradeList(params) {
    // 获取批量升级记录列表
    return axios.post('api/rest/tagent/upgrade/audit/list', params);
  },
  getBatchUpgradeDetail(params) {
    // 获取升级记录详情
    return axios.post('api/rest/tagent/upgrade/audit/detail/list', params);
  },
  saveBatchUpgrade(params) {
    // 批量升级
    return axios.post('api/rest/tagent/batch/upgrade', params);
  },
  checkVersion(params) {
    // 检测版本
    return axios.post('api/rest/tagent/batch/action/check', params);
  },
  getInstallPackageList(params) {
    // 获取安装包列表
    return axios.post('api/rest/tagent/pkg/list', params);
  },
  saveInstallPackage(params) {
    // 上传安装包
    return axios.post('api/rest/tagent/version/save', params);
  },
  delInstallPackage(params) {
    // 删除安装包
    return axios.post('api/rest/file/delete', params);
  },
  downloadInstallPackage(params) {
    // 下载安装包
    return axios.post('api/rest/file/download', params);
  },
  updateStatus(params) {
    // 检测状态
    return axios.post('api/rest/tagent/exec/status/check', params);
  },
  batchReload(params) {
    // 批量重启
    return axios.post('/api/rest/tagent/exec/batch/reload', params);
  },
  batchResetPassword(params) {
    // 批量更新密码
    return axios.post('/api/rest/tagent/exec/password/batch/reset', params);
  }
};
export default tagent;

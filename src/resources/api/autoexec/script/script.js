import axios from '../../http';

const script = {
  //查询脚本列表
  searchScriptToolList(params) {
    return axios.post('/api/rest/autoexec/scriptandtool/search', params);
  },
  getScriptList(params) {
    return axios.post('/api/rest/autoexec/script/search', params);
  },
  deleteScript(params) {
    return axios.post('/api/rest/autoexec/script/delete', params);
  },
  getScriptDetail(params) {
    return axios.post('/api/rest/autoexec/script/get', params);
  },
  getJobScriptContent(params) {
    // 获取操作当前激活版本脚本内容
    return axios.post('/api/rest/autoexec/job/phase/operation/script/get', params);
  },
  //获取脚本版本列表
  getVersionList(params) {
    return axios.post('/api/rest/autoexec/script/version/list', params);
  },
  //激活或禁用脚本版本
  updateActivestatus(params) {
    return axios.post('/api/rest/autoexec/script/version/activestatus/update', params);
  },
  //保存脚本基本信息
  saveBaseinfo(params) {
    return axios.post('/api/rest/autoexec/script/baseinfo/save', params);
  },
  copyScript(params) {
    return axios.post('/api/rest/autoexec/script/copy', params);
  },
  //保存脚本
  saveScript(params) {
    return axios.post('/api/rest/autoexec/script/save', params);
  },
  //提交脚本
  submitScript(params) {
    return axios.post('/api/rest/autoexec/script/submit', params);
  },
  //审核脚本
  reviewScript(params) {
    return axios.post('/api/rest/autoexec/script/review', params);
  },
  //脚本/工具发布生成组合工具
  generateAction(params) {
    return axios.post('/api/rest/autoexec/combop/generate', params);
  },
  //版本对比
  versionCompare(params) {
    return axios.post('/api/rest/autoexec/script/version/compare', params);
  },
  //校验脚本内容
  validCheck(params) {
    return axios.post('/api/rest/autoexec/script/check', params);
  },
  //切换脚本当前版本
  switchVersion(params) {
    return axios.post('/api/rest/autoexec/script/version/switch', params);
  },
  //获取工具库基本信息（复制时获取）
  getScriptBaseinfo(params) {
    return axios.post('/api/rest/autoexec/script/baseinfo/get', params);
  },
  //撤回提交审核
  revokeScript(params) {
    return axios.post('/api/rest/autoexec/script/revoke', params);
  },
  //版本下拉列表
  versionList(params) {
    return axios.post('/api/rest/autoexec/script/version/list/forselect', params);
  },
  validDelete(params) { //校验删除
    return axios.post('/api/rest/autoexec/script/delete', params, { headers: { unConsole: 1, 'neatlogic-validfield': 'id'} });
  },
  //获取测试详情数据
  getTestDetail(params) {
    return axios.get('/api/rest/autoexec/scriptortool/inputparam/get', {params: params});
  },
  //执行脚本测试
  testScript(params) {
    return axios.post('/api/rest/autoexec/job/from/operation/create', params);
  },
  getArgument(params) { //自由参数
    return axios.get('/api/rest/autoexec/scriptortool/argument/get', { params: params });
  },
  batchDeleteScript(params) {
    return axios.post('/api/rest/autoexec/script/batchdelete', params);
  }
};

export default script;

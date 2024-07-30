import axios from '../../http';

const job = {
  //作业搜索（作业执行列表）
  searchJobList(params) {
    return axios.post('/api/rest/autoexec/job/search', params);
  },
  //作业搜索（组合工具视图）
  searchJobByCombop(params) {
    return axios.post('/api/rest/autoexec/job/combop/search', params);
  },
  //删除作业
  deleteJob(params) {
    return axios.post('/api/rest/autoexec/job/delete', params);
  },
  getJobDetail(params) {
    return axios.post('api/rest/autoexec/job/detail/get', params);
  },
  //获取作业runner列表
  getJobRunner(jobId) {
    return axios.post('/api/rest/autoexec/job/runner/list', { jobId: jobId });
  },
  //获取节点，通过作业对应的阶段
  searchPhaseNode(params) {
    return axios.post('/api/rest/autoexec/job/phase/node/search', params);
  },
  //获取runner节点，通过作业对应的阶段
  getRunnerByPhase(params) {
    return axios.post('/api/rest/autoexec/job/phase/runner/get', params);
  },
  //获取操作列表
  getOperationList(params) {
    return axios.post('/api/rest/autoexec/job/phase/node/operation/list', params);
  },
  //获取节点运行的输出日志
  getNodeLog(params) {
    return axios.post('/api/rest/autoexec/job/phase/node/log/tail', params);
  },
  getJobLog(params) {
    return axios.post('/api/rest/autoexec/job/console/log/tail', params);
  },
  //获取节点运行的运行记录
  getNodeRecord(params) {
    return axios.post('/api/rest/autoexec/job/phase/node/audit/list', params);
  },
  //获取节点运行的脚本列表
  /*getNodeScript(params) {
    return axios.post('/api/rest/autoexec/job/phase/node/log/tail', params);
  },*/
  //获取节点输出参数
  getOutputNodeParam(params) {
    return axios.post('/api/rest/autoexec/job/phase/node/output/param/get', params);
  },
  //获取节点输出参数
  getInputNodeParam(params) {
    return axios.post('/api/rest/autoexec/job/phase/node/operation/input/param/get', params);
  },
  getJobParam(params) {
    return axios.post('/api/rest/autoexec/job/runtime/param/get', params);
  },
  getJobEnv(params) {
    return axios.post('/api/rest/autoexec/job/env/get', params);
  },
  pauseJob(params) {
    //暂停作业
    return axios.post('/api/rest/autoexec/job/pause', params);
  },
  abortJob(params) {
    //终止作业
    return axios.post('/api/rest/autoexec/job/abort', params);
  },
  validJob(params) {
    //验证作业
    return axios.post('/api/rest/autoexec/job/check', params);
  },
  reFireJob(params) {
    //重做作业
    return axios.post('/api/rest/autoexec/job/refire', params);
  },
  ignoreNode(params) {
    //忽略节点
    return axios.post('/api/rest/autoexec/job/phase/node/ignore', params);
  },
  ignorePhase(params) {
    //忽略阶段
    return axios.post('/api/rest/autoexec/job/phase/ignore', params);
  },
  resetNode(params) {
    //重置节点
    return axios.post('/api/rest/autoexec/job/phase/node/reset', params);
  },
  redoNode(params) {
    //重跑节点
    return axios.post('/api/rest/autoexec/job/phase/node/refire', params);
  },
  exectWaitInput(params) {
    //waitinput
    return axios.post('/api/rest/autoexec/job/phase/node/submit/waitInput', params);
  },
  getSqlList(params) {
    //获取sql列表
    return axios.post('/api/rest/autoexec/job/phase/node/sql/list', params);
  },
  getSqlCode(params) {
    //获取sql的code
    return axios.post('/api/rest/autoexec/job/phase/node/sql/content/get', params);
  },
  getConsoleRecords(params) {
    //获取作业控制台操作记录
    return axios.post('/api/rest/autoexec/job/console/log/audit/list', params);
  },
  executeJob(params) {
    //执行作业
    return axios.post('/api/rest/autoexec/job/from/combop/execute', params);
  },
  revokeJob(params) {
    //撤销作业
    return axios.post('/api/rest/autoexec/job/from/combop/revoke', params);
  },
  takeoverJob(params) {
    //接管作业
    return axios.post('/api/rest/autoexec/job/takeover', params);
  },
  updatePlanJob(params) {
    //修改执行时间和触发方式
    return axios.post('/api/rest/autoexec/job/from/combop/update', params);
  },
  getPhaseList(params) {
    //获取作业阶段列表
    return axios.post('/api/rest/autoexec/job/phase/list', params);
  },
  getPhaseTopo(jobId) {
    return axios.post('/api/rest/autoexec/job/phase/topo', { jobId: jobId });
  },
  getNodePhaseList(params) {
    //获取作业阶段节点列表
    return axios.post('/api/rest/autoexec/job/phase/node/list', params);
  },
  getJobById(id) {
    //获取获取作业详情
    return axios.post('/api/rest/autoexec/job/info/get', { jobId: id });
  },
  refirePhaseJob(params) {
    return axios.post('/api/rest/autoexec/job/phase/refire', params);
  },
  getSqlListByPhase(params) {
    // sql执行详情
    return axios.post('api/rest/autoexec/job/phase/sql/search', params);
  },
  resetSqlFileNode(params) {
    // 重置sqlFile节点
    return axios.post('/api/rest/autoexec/job/sql/status/reset', params);
  },
  //获取自动化作业日志字符编码集合
  getJobEncodeList() {
    return axios.post('/api/rest/autoexec/job/log/encoding/list');
  },
  getCreateJobData(params) {
    //获取创建作业payload接口
    return axios.post('/api/rest/autoexec/job/create/payload/get', params);
  },
  getjobCustomTemplateListList(params) {
    //获取自动化作业阶段工具引用的自定义模版列表
    return axios.post('/api/rest/autoexec/job/phase/operation/customtemplate/list', params);
  },
  getJobCustomdata(params) {
    return axios.post('/api/rest/autoexec/job/phase/operation/customdata/get', params);
  },
  getInputParamList(params) {
    return axios.post('/api/rest/autoexec/job/phase/node/operation/input/param/get', params);
  }
};

export default job;

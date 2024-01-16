import axios from '../../http';

const process = {
  //流程列表搜索接口
  processSearch(data) {
    return axios.post('/api/rest/process/search', data);
  },
  copyProcess(data) {
    //复制流程
    return axios.post('/api/rest/process/copy', data);
  },
  processComponent(data) {
    //获取节点列表数据
    return axios.get('/api/rest/process/step/handler/list', data);
  },
  processReference(data) {
    return axios.post('/api/rest/process/reference/list', data);
  },
  processSave(data) {
    //保存
    return axios.post('/api/rest/process/save', data);
  },
  processDraftSave(data) {
    //草稿保存
    return axios.post('/api/rest/process/draft/save', data);
  },
  processDraftList(data) {
    //草稿列表
    return axios.post('/api/rest/process/draft/list', data);
  },
  processDraftGet(data) {
    //草稿获取
    return axios.post('/api/rest/process/draft/get', data);
  },
  getProcess(data) {
    //获取单个流程信息
    return axios.post('/api/rest/process/get', data);
  },
  delProcess(data) {
    //删除
    return axios.post('/api/rest/process/delete', data);
  },
  updateProcess(data) {
    //更新
    return axios.post('/api/rest/process/update', data);
  },
  //分派器下拉列表接口
  workerdispatcher(data) {
    return axios.post('/api/rest/process/workerdispatcher/list', data);
  },
  //节点设置：触发条件下拉
  nodetriggerList(data) {
    return axios.post('/api/rest/notify/trigger/list', data);
  },
  //节点设置：通知方式下拉
  nodehandlerList() {
    return axios.get('/api/rest/notify/handler/list');
  },
  //节点设置：模版下拉,接口已废弃，勿用！！！
  nodetemplateList() {
    //return axios.get('/api/rest/notify/template/list/forselect');
  },
  //条件节点：获取条件接口（新）
  conditionList(data) {
    return axios.post('/api/rest/process/condition/list', data);
  },
  //流程参数下拉列表
  processParamList(data) {
    return axios.post('/api/rest/process/param/list', data);
  },
  channelForm(data) {
    return axios.post('/api/rest/process/channel/form/get', data);
  },
  //获取用户列表
  userList(data) {
    return axios.post('/api/rest/user/role/team/search', data);
  },
  //节点管理，获取节点列表
  getNodeList(data) {
    return axios.post('/api/rest/process/step/handler/search', data);
  },
  //节点管理，保存节点配置
  saveNode(data) {
    return axios.post('/api/rest/process/step/handler/config/save', data);
  },
  //服务类型获取
  channelType(data) {
    return axios.post('/api/rest/process/channeltype/search', data);
  },
  //工单草稿数据获取接口，上报页服务获取初始信息
  getDraft(data) {
    return axios.post('/api/rest/processtask/draft/get', data);
  },
  //表单组件获取接口
  /*getFormHandler(data) {
    return axios.post('/api/rest/form/handler/get', data);
  },*/
  //auto节点
  getAutomatic() {
    //初始化数据
    return axios.get('/api/rest/process/automatic/init');
  },
  integrationconfig(data) {
    //获取集成下拉列表
    return axios.post('/api/rest/integration/param/list', data);
  },
  //查询外部数据源具体数据
  searchIntegration(params) {
    return axios.post('/api/rest/integration/search', params);
  },
  //获取所有表达式
  getExpressionlist() {
    return axios.post('/api/rest/expression/list');
  },
  autoComplete() {
    //auto节点：等待数据
    return axios.get('/public/api/help/rest/processtask/automatic/complete');
  },
  //autoexec节点
  getAutoexecCombop(data) { //自动化节点获取组合工具
    return axios.post('/api/rest/autoexec/combop/processconfig/init', data);
  },
  //保存会签处理人
  saveTask(data) { //新增
    return axios.post('/api/rest/processtask/step/task/save', data);
  },
  deleteTask(data) { //删除
    return axios.post('/api/rest/processtask/step/task/delete', data);
  },
  completeTask(data) { //添加回复
    return axios.post('/api/rest/processtask/step/task/complete', data);
  },
  getProcesstask(data) {
    return axios.post('/api/rest/processtask/step/task/list', data);
  },
  //查询执行目标列表
  getResourceList(params) {
    return axios.post('/api/rest/resourcecenter/resource/list', params);
  },
  getNotifyPolicyList(params) { //通知策略参数右边下拉框可选列表
    return axios.post('/api/rest/process/notify/policy/param/list', params);
  },
  saveTaskFile(params) { //子任务策略：保存附件
    return axios.post('/api/rest/processtask/step/task/file/save', params);
  },
  deleteTaskFile(params) { //子任务策略：删除附件
    return axios.post('/api/rest/processtask/step/task/file/delete', params);
  },
  getEoaData(params) { //工单eoa节点
    return axios.post('/api/rest/eoa/get', params);
  },
  saveEoaData(params) { //保存工单eoa节点
    return axios.post('/api/rest/eoa/save', params);
  },
  completeEoaStep(params) { //完成EOA步骤
    return axios.post('/api/rest/eoa/step/complete', params);
  }
};

export default process;

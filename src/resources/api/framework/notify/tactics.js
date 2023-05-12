import axios from '../../http';

const tactics = {
  getNotifyHandler(data) {
    //通知模块
    return axios.get('/api/rest/notify/policy/handler/list', data);
  },
  getNotifyHandlerGroup(data) {
    //通知模块分组
    return axios.get('/api/rest/notify/policy/handlergroup/list', data);
  },
  searchNotifyList(data) {
    //通知策略列表
    return axios.post('/api/rest/notify/policy/search', data);
  },
  saveNotify(data) {
    //新增（修改）通知策略
    return axios.post('/api/rest/notify/policy/save', data);
  },
  delNotify(data) {
    //删除通知策略
    return axios.post('/api/rest/notify/policy/delete', data);
  },
  copyNotify(data) {
    //复制通知策略
    return axios.post('/api/rest/notify/policy/copy', data);
  },
  //策略编辑
  editNotify(data) {
    //编辑通知策略
    return axios.post('/api/rest/notify/policy/get', data);
  },
  cleanHandlerNotify(data) {
    //清空策略
    return axios.post('/api/rest/notify/policy/trigger/config/clean', data);
  },
  saveHandlerNotify(data) {
    //保存通知策略
    return axios.post('/api/rest/notify/policy/trigger/config/save', data);
  },
  //通知方式
  handlerList() {
    return axios.get('/api/rest/notify/handler/list');
  },
  //通知策略参数保存接口
  paramSave(data) {
    return axios.post('/api/rest/notify/policy/param/save', data);
  },
  //通知策略参数删除接口
  paramDelete(data) {
    return axios.post('/api/rest/notify/policy/param/delete', data);
  },
  //通知策略变量类型列表接口
  getParamtypeList(data) {
    return axios.post('/api/rest/notify/policy/paramtype/list', data);
  },
  //参数列表
  notifyParamList(data) {
    return axios.post('/api/rest/notify/policy/param/list', data);
  },
  //参数类型匹配数据
  notifyParamTypeList(data) {
    return axios.post('/api/rest/notify/policy/paramtype/list', data);
  },
  //删除策略条件
  delTriggerConfig(data) {
    return axios.post('/api/rest/notify/policy/trigger/config/delete', data);
  },
  //模板列表
  getTemplateList(data) {
    return axios.post('/api/rest/notify/policy/template/list', data);
  },
  //模板保存
  templateSave(data) {
    return axios.post('/api/rest/notify/policy/template/save', data);
  },
  //模板删除
  templateDelete(data) {
    return axios.post('/api/rest/notify/policy/template/delete', data);
  },
  //策略触发编辑
  editTriggerConfig(data) {
    return axios.post('/api/rest/notify/policy/trigger/config/list', data);
  },
  getProcess(data) {
    //获取单个流程信息
    return axios.post('/api/rest/process/get', data);
  },
  getConditionoption(data) {
    //获取通知条件
    return axios.post('/api/rest/notify/policy/conditionoption/list', data);
  },
  getTemplateData(data) {
    //编辑模板信息
    return axios.post('/api/rest/notify/policy/template/get', data);
  },
  getTriggerList(data) {
    return axios.post('/api/rest/notify/policy/trigger/list', data);
  },
  getHelpList(data) {
    return axios.post('/api/rest/notify/policy/trigger/help/list', data);
  },
  //删除通知定时任务
  deleteJob(data) {
    return axios.post('/api/rest/notify/job/delete', data);
  },
  //获取通知定时任务
  getJob(data) {
    return axios.post('/api/rest/notify/job/get', data);
  },
  //保存通知定时任务
  saveJob(data) {
    return axios.post('/api/rest/notify/job/save', data);
  },
  //查询通知定时任务
  searchJob(data) {
    return axios.post('/api/rest/notify/job/search', data);
  },
  //修改通知定时任务激活状态
  updateStatusJob(data) {
    return axios.post('api/rest/notify/job/status/update', data);
  },
  //获取通知内容插件详情
  handlerDetail(data) {
    return axios.post('api/rest/notify/content/handler/detail', data);
  },
  //获取通知消息属性列表
  getMessageattr(data) {
    return axios.post('api/rest/notify/content/handler/messageattr/list', data);
  },
  //定时任务预览
  handlertPreview(data) {
    return axios.post('api/rest/notify/content/handler/preview', data);
  },
  auditSearch(data) { //发送记录
    return axios.post('api/rest/notify/job/audit/search', data);
  },
  // 搜索发送记录
  getAuditLog(params) {
    return axios.post('/api/rest/job/audit/log/get', params);
  },
  updateIsDefaultNotifyPolicy(params) {
    return axios.post('/api/rest/notify/policy/isdefault/update', params);
  }
};
export default tactics;

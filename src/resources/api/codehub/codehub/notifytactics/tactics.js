import axios from '@/resources/api/http.js';

const tactics = {
  getHandlerNotify(data) {
    //通知模块
    return axios.get('/api/rest/codehub/notify/policy/handler/list', data);
  },
  searchNotifyList(data) {
    //通知策略列表
    return axios.post('/api/rest/codehub/notify/policy/search', data);
  },
  saveNotify(data) {
    //新增（修改）通知策略
    return axios.post('/api/rest/codehub/notify/policy/save', data);
  },
  delNotify(data) {
    //删除通知策略
    return axios.post('/api/rest/codehub/notify/policy/delete', data);
  },
  copyNotify(data) {
    //复制通知策略
    return axios.post('/api/rest/codehub/notify/policy/copy', data);
  },
  //策略编辑
  editNotify(data) {
    //编辑通知策略
    return axios.post('/api/rest/codehub/notify/policy/get', data);
  },
  cleanHandlerNotify(data) {
    //清空策略
    return axios.post('/api/rest/codehub/notify/policy/trigger/config/clean', data);
  },
  saveHandlerNotify(data) {
    //保存通知策略
    return axios.post('/api/rest/codehub/notify/policy/trigger/config/save', data);
  },
  //通知方式
  handlerList() {
    return axios.get('/api/rest/codehub/notify/handler/list');
  },
  //通知策略参数保存接口
  paramSave(data) {
    return axios.post('/api/rest/codehub/notify/policy/param/save', data);
  },
  //通知策略参数删除接口
  paramDelete(data) {
    return axios.post('/api/rest/codehub/notify/policy/param/delete', data);
  },
  //通知策略变量类型列表接口
  getParamtypeList(data) {
    return axios.post('/api/rest/codehub/notify/policy/paramtype/list', data);
  },
  //参数列表
  notifyParamList(data) {
    return axios.post('/api/rest/codehub/notify/policy/param/list', data);
  },
  //参数类型匹配数据
  notifyParamTypeList(data) {
    return axios.post('/api/rest/codehub/notify/policy/paramtype/list', data);
  },
  //删除策略条件
  delTriggerConfig(data) {
    return axios.post('/api/rest/codehub/notify/policy/trigger/config/delete', data);
  },
  //模板列表
  getTemplateList(data) {
    return axios.post('/api/rest/codehub/notify/policy/template/list', data);
  },
  //模板保存
  templateSave(data) {
    return axios.post('/api/rest/codehub/notify/policy/template/save', data);
  },
  //模板删除
  templateDelete(data) {
    return axios.post('/api/rest/codehub/notify/policy/template/delete', data);
  },
  //通知策略引用
  invokerList(data) {
    return axios.post('/api/rest/codehub/notify/policy/invoker/list', data);
  },
  //策略触发编辑
  editTriggerConfig(data) {
    return axios.post('/api/rest/codehub/notify/policy/trigger/config/list', data);
  },
  //通知策略管理员添加接口
  addAdminUser(data) {
    return axios.post('/api/rest/codehub/notify/policy/exceptionnotify/add', data);
  },
  //通知策略管理员删除接口
  deleteAdminUser(data) {
    return axios.post('/api/rest/codehub/notify/policy/exceptionnotify/delete', data);
  },
  //获取策略引用列表
  getPolicyInvokerList(data) {
    return axios.post('/api/rest/codehub/notify/policy/invoker/list', data);
  },
  getProcess(data) {
    //获取单个流程信息
    return axios.post('/api/rest/codehub/process/get', data);
  },
  getConditionoption(data) {
    //获取通知条件
    return axios.post('/api/rest/codehub/notify/policy/conditionoption/list', data);
  },
  getTemplateData(data) {
    //编辑模板信息
    return axios.post('/api/rest/codehub/notify/policy/template/get', data);
  },
  getTriggerList(data) {
    return axios.post('/api/rest/codehub/notify/policy/trigger/list', data);
  }
  // getHelpList(data) { //模板帮助
  //   return axios.post('/api/rest/codehub/notify/policy/trigger/help/list', data);
  // }
};
export default tactics;

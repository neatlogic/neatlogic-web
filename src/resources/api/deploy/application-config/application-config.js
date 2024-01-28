import axios from '../../http';
const applicationConfig = {
  getAppModuleTreeList(params) {
    // 模块列表
    return axios.post('/api/rest/deploy/app/config/module/list', params);
  },
  getEnvTreeList(params) {
    // 环境
    return axios.post('/api/rest/deploy/app/config/env/list', params);
  },
  getAppConfigAuthList(params) {
    // 查询应用配置权限接口
    return axios.post('/api/rest/deploy/app/config/authority/search', params);
  },
  getAuthList(params) {
    // 获取授权列表
    return axios.post('/api/rest/deploy/app/config/authority/action/list', params);
  },
  saveAppConfigAuth(params) {
    // 保存应用配置权限
    return axios.post('/api/rest/deploy/app/config/authority/save', params);
  },
  batchDelAuthApp(params) {
    // 批量删除权限（应用层）
    return axios.post('/api/rest/deploy/app/config/authority/batch/delete', params);
  },
  saveModuleRunnerGroup(params) {
    // 保存应用模块runner组接口
    return axios.post('/api/rest/deploy/app/config/module/runner/group/save', params);
  },
  saveEnvAutoConfig(params) {
    // 保存应用环境autoconfig
    return axios.post('/api/rest/deploy/app/config/env/auto/config/save', params);
  },
  searchAppSystemList(params) {
    // 查询应用配置树
    return axios.post('/api/rest/deploy/app/config/appsystem/search', params);
  },
  getEnvInfo(params) {
    // 获取环境层配置信息
    return axios.post('/api/rest/deploy/app/config/env/info/get', params);
  },
  getModuleInfo(params) {
    // 获取模块层信息
    return axios.post('/api/rest/deploy/app/config/app/module/info/get', params);
  },
  getAppInfo(params) {
    // 获取应用层信息
    return axios.post('/api/rest/app/system/simple/get', params);
  },
  delEnvExample(params) {
    // 删除环境实例差异
    return axios.post('/api/rest/deploy/app/config/env/auto/config/delete', params);
  },
  saveAppFavorite(params) {
    // 收藏应用
    return axios.post('/api/rest/deploy/app/config/system/favorite/save', params);
  },
  saveEnvTree(params) {
    // 保存环境树
    return axios.post('/api/rest/deploy/app/config/env/save', params);
  },
  clearConfigEnv(params) {
    // 清空配置（环境）
    return axios.post('/api/rest/deploy/app/config/env/config/delete', params);
  },
  clearConfigModule(params) {
    // 清空配置（模块）
    return axios.post('/api/rest/deploy/app/config/module/config/delete', params);
  },
  clearConfigApp(params) {
    // 清空配置（应用）
    return axios.post('/api/rest/deploy/app/config/system/config/delete', params);
  },
  saveEnvInstance(params) {
    // 保存环境实例
    return axios.post('/api/rest/deploy/app/config/instance/save', params);
  },
  saveAppTree(params) {
    // 保存应用配置树（应用层）
    return axios.post('/api/rest/deploy/app/config/app/save', params);
  },
  saveCopyConfigEnv(params) {
    // 保存复制配置（环境层）
    return axios.post('/api/rest/deploy/app/config/env/config/copy', params);
  },
  saveCopyConfigModule(params) {
    // 保存复制配置（模块层）
    return axios.post('/api/rest/deploy/app/config/module/config/copy', params);
  },
  getDbList(params) {
    // 获取数据库配置（数据库列表）
    return axios.post('/api/rest/deploy/app/config/env/database/search', params);
  },
  saveAppModue(params) {
    // 应用配置（应用模块）
    return axios.post('/api/rest/deploy/app/config/appmodule/save', params);
  },
  getAppModue(id) {
    // 应用配置（应用模块）
    return axios.post('/api/rest/deploy/app/config/appmodule/get', {id});
  },
  saveAppSystem(params) {
    // 应用配置
    return axios.post('/api/rest/deploy/app/config/appsystem/save', params);
  },
  getAppSystem(id) {
    // 应用配置
    return axios.post('/api/rest/deploy/app/config/appsystem/get', {id});
  },
  delEnv(params) {
    // 删除环境
    return axios.post('/api/rest/deploy/app/config/env/delete', params);
  },
  getAppSystemCiAttrList(params) {
    //获取应用系统模型属性列表
    return axios.post('/api/rest/deploy/app/ci/attr/list', params);
  },
  getAppModuleCiAttrList(params) {
    //获取应用模块模型属性列表
    return axios.post('/api/rest/deploy/app/module/ci/attr/list', params);
  },
  getAppInstanceCiAttrList(params) {
    //获取应用实例模型属性列表
    return axios.post('/api/rest/deploy/app/instance/ci/attr/list', params);
  },
  getAppAppmoduleEnvTree(params) {
    //查询发布应用配置的应用系统模块环境树
    return axios.post('/api/rest/deploy/app/config/appsystem/appmodule/env/tree', params);
  },
  saveAppSystemNotify(params) {
    //保存发布作业通知策略
    return axios.post('/api/rest/deploy/job/notify/policy/save', params);
  },
  getAppSystemNotifyId(params) {
    //获取发布应用的通知策略id
    return axios.post('/api/rest/deploy/job/notify/policy/get', params);
  }
};

export default applicationConfig;

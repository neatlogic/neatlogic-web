import axios from '../../http';
const env = {
  getEnvTreeList(params) {
    // 环境
    return axios.post('api/rest/deploy/app/config/env/list', params);
  },
  saveEnvAutoConfig(params) {
    // 保存应用环境autoconfig
    return axios.post('api/rest/deploy/app/config/env/auto/config/save', params);
  },
  getEnvInfo(params) {
    // 获取环境层配置信息
    return axios.post('api/rest/deploy/app/config/env/info/get', params);
  },
  delEnvExample(params) {
    // 删除环境实例差异
    return axios.post('api/rest/deploy/app/config/env/auto/config/delete', params);
  },
  saveEnvTree(params) {
    // 保存环境树
    return axios.post('api/rest/deploy/app/config/env/save', params);
  },
  clearConfigEnv(params) {
    // 删除环境层树引用关系
    return axios.post('api/rest/deploy/app/config/env/delete', params);
  },
  saveEnvInstance(params) {
    // 保存环境实例
    return axios.post('api/rest/deploy/app/config/instance/save', params);
  },
  getEnvDbConfig(params) {
    // 获取db配置信息
    return axios.post('api/rest/deploy/app/config/env/db/config/get', params);
  },
  saveEnvDbConfig(params) {
    // 保存db配置信息
    return axios.post('api/rest/deploy/app/config/env/db/config/save', params);
  },
  delEnvDbConfigById(params) {
    // 删除db配置信息
    return axios.post('api/rest/deploy/app/config/env/db/config/delete', params);
  },
  getInstanceList(params) {
    // 实例列表
    return axios.post('/api/rest/deploy/app/module/env/auto/config/instance/search', params);
  }
};

export default env;

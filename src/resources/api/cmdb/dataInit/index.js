import axios from '../../http';

const dataInit = {
  getConfigList(params) {
    // 查询资源中心配置信息
    return axios.post('/api/rest/resourcecenter/config/get', params);
  },
  saveConfig(params) {
    // 保存资源中心配置信息
    return axios.post('/api/rest/resourcecenter/config/save', params);
  }
};

export default dataInit;

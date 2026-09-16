import axios from '../../http';

// 公共模块只提供能力发现，不暴露商业配置接口。
export default {
  getCapability() { return axios.post('/api/rest/rdm/event/capability/get'); }
};

import axios from '../../http';

const channeltype = {
  //服务类型列表搜索接口
  search(data) {
    return axios.post('/api/rest/process/channeltype/search', data);
  },
  get(data) {
    return axios.post('/api/rest/process/channeltype/get', data);
  },
  save(data) {
    return axios.post('/api/rest/process/channeltype/save', data);
  },
  delete(data) {
    return axios.post('/api/rest/process/channeltype/delete', data);
  },
  policyList(data) {
    return axios.post('/api/rest/processtask/serialnumber/policy/list', data);
  },
  updateUuid(data) {
    return axios.post('/api/rest/processtask/serialnumber/update', data);
  }
};

export default channeltype;

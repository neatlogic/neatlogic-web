import axios from '../../http';

const priority = {
  //优先级列表搜索接口
  search(data) {
    return axios.post('/api/rest/process/priority/search', data);
  },
  get(data) {
    return axios.post('/api/rest/process/priority/get', data);
  },
  save(data) {
    return axios.post('/api/rest/process/priority/save', data);
  },
  delete(data) {
    return axios.post('/api/rest/process/priority/delete', data);
  },
  // 拖拽排序优先级
  move(data) {
    return axios.post('/api/rest/process/priority/move', data);
  }
};

export default priority;

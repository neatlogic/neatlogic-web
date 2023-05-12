import axios from '../../http';

const strategy = {
  //子策略任务列表
  searchStrategy(data) {
    return axios.post('/api/rest/task/search', data);
  },
  saveStrategy(data) {
    //添加子策略
    return axios.post('/api/rest/task/save', data);
  },
  deleteStrategy(data) {
    //删除子策略
    return axios.post('/api/rest/task/delete', data);
  },
  listEnumGet(data) {
    //删除子策略
    return axios.get('/api/rest/universal/enum/get?enumClass=' + data);
  }
};

export default strategy;

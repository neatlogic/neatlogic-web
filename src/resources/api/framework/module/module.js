import axios from '@/resources/api/http';

const module = {
  searchModule() {
    return axios.get('/api/rest/module/search', {});
  },
  searchVersionUpdateData(params) {
    // 查询版本更新数据
    return axios.get('/api/rest/module/version/search', params);
  },
  searchSqlUpdateData(params) {
    // 查询SQL更新数据
    return axios.get('/api/rest/module/sql/search', params);
  }
};
export default module;

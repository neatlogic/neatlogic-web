import axios from '@/resources/api/http';

const module = {
  searchModule() {
    return axios.get('/api/rest/module/search', {});
  },
  searchVersionLogList(params) {
    // 查询变更版本日志列表接口
    return axios.post('/api/rest/module/changelog/search', params);
  },
  searchVersionLogDetail(params) {
    // 查询变更版本日志详情
    return axios.post('/api/rest/module/changelog/get', params);
  },
  getModuleManageSetting() {
    // 获取模块管理显示设置
    return axios.post('/api/rest/module/manage/setting/get', {});
  },
  saveModuleManageSetting(params) {
    // 保存模块管理显示设置
    return axios.post('/api/rest/module/manage/setting/save', params);
  }
};
export default module;

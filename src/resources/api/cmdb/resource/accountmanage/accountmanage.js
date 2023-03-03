import axios from '../../../http';
const accountManage = {
  // 查询资源中心帐号
  searchAccount(params) {
    return axios.post('api/rest/resourcecenter/account/search', params);
  },
  // 获取资源中心帐号
  getAccountById(id) {
    return axios.post('api/rest/resourcecenter/account/get', { id: id });
  },
  // 查询资源中心数据列表
  getAccountList(params) {
    return axios.post('api/rest/resourcecenter/resource/list', params);
  },
  // 保存资源中心帐号
  saveAccount(params) {
    return axios.post('api/rest/resourcecenter/account/save', params);
  },
  // 删除资源中心帐号
  deleteAccountById(id) {
    return axios.post('api/rest/resourcecenter/account/delete', { id: id });
  }, // 获取枚举值
  enumGet(params) {
    return axios.post('api/rest/universal/enum/get', params);
  },
  searchlistresourcecenter(params) {
    return axios.post('api/rest/resourcecenter/account/protocol/search', params);
  },
  savelistresourcecenter(params) {
    return axios.post('api/rest/resourcecenter/account/protocol/save', params);
  }, //增加、编辑协议
  deletelistresourcecenter(params) {
    return axios.post('api/rest/resourcecenter/account/protocol/delete', params);
  } //删除
};
export default accountManage;

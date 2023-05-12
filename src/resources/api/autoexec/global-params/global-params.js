import axios from '../../http';
const globalParams = {
  saveGlobalParams(params) {
    // 保存全局参数
    return axios.post('/api/rest/autoexec/global/param/save', params);
  },
  getGlobalParamsList(params) {
    // 获取全局参数列表
    return axios.post('/api/rest/autoexec/global/param/search', params);
  },
  deleteGlobalParamsById(id) {
    // 删除全局参数通过id
    return axios.post('/api/rest/autoexec/global/param/delete', {id: id});
  },
  getGlobalParamsDetail(id) {
    // 获取详情
    return axios.post('/api/rest/autoexec/global/param/get', {id: id});
  },
  getTypeList(params) {
    // 获取值类型列表
    return axios.post('/api/rest/universal/enum/get', params);
  }
};

export default globalParams;

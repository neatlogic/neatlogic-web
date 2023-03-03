import axios from '../../http';
const operate = {
  //移动操作级别
  moveOperate(params) {
    return axios.post('/api/rest/autoexec/risk/move', params);
  }, //保存操作级别
  saveOperate(params) {
    return axios.post('/api/rest/autoexec/risk/save', params);
  }, //查询操作级别
  searchOperateList(params) {
    return axios.post('/api/rest/autoexec/risk/search', params);
  }, //删除操作级别
  deleteOperate(params) {
    return axios.post('/api/rest/autoexec/risk/delete', params);
  }
};
export default operate;

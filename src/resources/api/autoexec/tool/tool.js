import axios from '../../http';

const tool = {
  //TODO 工具库根据条件获取列表,待更新接口
  getToolList(params) {
    return axios.post('/api/rest/autoexec/tool/search', params);
  },
  //工具库：激活或禁用
  updateToolStatus(params) {
    return axios.post('/api/rest/autoexec/tool/activestatus/update', params);
  },
  //工具库详情
  getToolDetail(params) {
    return axios.post('/api/rest/autoexec/tool/get', params);
  },
  updateToolCustomtemplate(params) { //更新工具库模板
    return axios.post('/api/rest/autoexec/tool/customtemplate/update', params);
  }
};
export default tool;

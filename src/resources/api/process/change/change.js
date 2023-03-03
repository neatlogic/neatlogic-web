import axios from '../../http';

const change = {
  //查询变更模板列表
  getChangeTemplateList(data) {
    return axios.post('/api/rest/change/template/list', data);
  },
  //查询变更模板
  getChangeTemplate(data) {
    return axios.post('/api/rest/change/template/get', data);
  },
  //更新变更模板
  updateChangeTemplate(data) {
    return axios.post('/api/rest/change/template/isactive/update', data);
  },
  //删除变更模板
  delChangeTemplate(data) {
    return axios.post('/api/rest/change/template/delete', data);
  },
  //复制变更模板
  copyChangeTemplate(data) {
    return axios.post('/api/rest/change/template/copy', data);
  },
  //保存变更模板
  saveChangeTemplate(data) {
    return axios.post('/api/rest/change/template/save', data);
  },
  //变更模板类型
  changeTemplateTypeList(data) {
    return axios.post('/api/rest/change/template/type/list', data);
  },
  //sop
  //复制变更sop模板
  copyChangeSop(data) {
    return axios.post('/api/rest/change/sop/copy', data);
  },
  //删除变更sop模板
  delChangeSop(data) {
    return axios.post('/api/rest/change/sop/delete', data);
  },
  //查询变更sop模板
  getChangeSop(data) {
    return axios.post('/api/rest/change/sop/get', data);
  },
  //查询变更sop模板列表
  getChangeSopList(data) {
    return axios.post('/api/rest/change/sop/list', data);
  },
  //保存变更sop模板
  saveChangeSop(data) {
    return axios.post('/api/rest/change/sop/save', data);
  },
  //查询变更sop模板类型列表
  changeSopTypeList(data) {
    return axios.post('/api/rest/change/sop/type/list', data);
  },
  //变量
  //查询变更变量
  searchChangeParam(data) {
    return axios.post('/api/rest/change/param/get', data);
  },
  //删除变更变量
  delChangeParam(data) {
    return axios.post('/api/rest/change/param/delete', data);
  },
  //查询变更变量列表
  getChangeParamList(data) {
    return axios.post('/api/rest/change/param/list', data);
  },
  //查询变更变量映射方式列表
  changeParamMappingmethodList(data) {
    return axios.post('/api/rest/change/param/mappingmethod/list', data);
  },
  //保存变更变量
  saveChangeParam(data) {
    return axios.post('/api/rest/change/param/save', data);
  },
  //查询变更步骤列表
  getChangeStepList(data) {
    return axios.post('/api/rest/change/step/list', data);
  },
  //查询变量引用列表
  getParamReferenceList(data) {
    return axios.post('/api/rest/change/param/reference/list', data);
  }
};
export default change;

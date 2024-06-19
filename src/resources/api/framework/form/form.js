import axios from '../../http';

const form = {
  getCustomItemById(id) {
    return axios.post('/api/rest/form/customitem/get', { id: id });
  },
  getCustomItemByName(name) {
    return axios.post('/api/rest/form/customitem/get', { name: name });
  },
  searchCustomItem(params) {
    return axios.post('/api/rest/form/customitem/search', params);
  },
  saveCustomItem(params) {
    return axios.post('/api/rest/form/customitem/save', params);
  },
  //表单管理页列表
  searchFormOverview(data) {
    return axios.post('/api/rest/form/search', data);
  },
  //引用列表
  referenceData(data) {
    return axios.post('/api/rest/dependency/list', data);
  },
  //表单更新
  updateData(data) {
    return axios.post('/api/rest/form/update', data);
  },
  //删除表单
  delFormItem(data) {
    return axios.post('/api/rest/form/delete', data);
  },
  //表单保存
  saveForm(data) {
    return axios.post('/api/rest/form/save', data);
  },
  //复制表单
  copyForm(data) {
    return axios.post('/api/rest/form/copy', data);
  },
  //查询某个版本的表单
  getFormByVersionUuid(data) {
    return axios.post('/api/rest/form/get', data);
  },
  //激活单独一个版本
  setFormActionVersion(data) {
    return axios.post('/api/rest/form/version/active', data);
  },
  //删除表单的某个版本
  delFormVersion(data) {
    return axios.post('/api/rest/form/version/delete', data);
  },
  //表单编辑日期组件工作日的校验
  validFormDate(data) {
    return axios.post('/api/rest/process/form/attribute/check', data);
  },
  //获取组类型
  getGrouplist() {
    return axios.post('/api/rest/groupsearch/list');
  },
  //获取老的表单的html
  getOldFormHtml(data) {
    return axios.post('/api/rest/processtask/old/formprop/get', data);
  },
  //获取编辑页面组件类型
  getHandlerList() {
    return axios.get('api/rest/form/handler/list');
  },
  //删除表单自定义组件
  deleteCustomItem(id) {
    return axios.post('/api/rest/form/customitem/delete', { id: id });
  },
  //删除表单场景
  deleteScene(params) {
    return axios.post('/api/rest/form/version/scene/delete', params);
  },
  getReferenceCount(params) {
    //查询引用数量
    return axios.post('/api/rest/dependency/count', params);
  },
  saveFormDefaultscene(params) {
    //保存默认场景
    return axios.post('/api/rest/form/version/defaultscene/save', params);
  },
  saveFormSceneReadonly(params) {
    //场景设置只读
    return axios.post('/api/rest/form/version/scene/readonly', params);
  },
  searchMatrixColumnData(params) {
    // 表格输入组件批量矩阵属性查询下拉接口
    return axios.post('/api/rest/matrix/column/data/search/forbatch', params);
  },
  getFormItemList(params) {
    // 获取表单组件列表(包含消费数据)
    return axios.post('/api/rest/form/attribute/list', params);
  },
  getFormTagList(params) { //获取表单扩展数据标签列表
    return axios.post('/api/rest/form/tag/list', params);
  }
};
export default form;

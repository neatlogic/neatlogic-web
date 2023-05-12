import axios from '../../http';

const action = {
  //查询组合工具列表
  searchActionList(params) {
    return axios.post('/api/rest/autoexec/combop/list', params);
  },
  //保存组合工具版本信息
  saveActionVersion(params) {
    return axios.post('/api/rest/autoexec/combop/version/save', params);
  },
  //保存组合工具基本信息
  saveActionBasicInfo(params) {
    return axios.post('/api/rest/autoexec/combop/basic/info/save', params);
  },
  //保存组合工具场景信息
  // saveActionScenario(params) {
  //   return axios.post('/api/rest/autoexec/combop/scenario/save', params);
  // },
  //查询组合工具详情
  getActionDetail(params) {
    return axios.post('/api/rest/autoexec/combop/detail/get', params);
  },
  //查询组合工具基本信息
  getActionBasicInfo(params) {
    return axios.post('/api/rest/autoexec/combop/basic/info/get', params);
  },
  //查询组合工具版本信息
  getActionVersion(params) {
    return axios.post('/api/rest/autoexec/combop/version/get', params);
  },
  //查询组合工具版本信息
  getActionVersionList(params) {
    return axios.post('/api/rest/autoexec/combop/version/list', params);
  },
  //查询组合工具版本信息
  getActionVersionCount(params) {
    return axios.post('/api/rest/autoexec/combop/version/count', params);
  },
  //更新组合工具状态
  toggleAction(params) {
    return axios.post('/api/rest/autoexec/combop/isactive/update', params);
  },
  //更新组合工具isActive
  updateVersionIsActiveAction(params) {
    return axios.post('/api/rest/autoexec/combop/version/isactive/update', params);
  },
  //更新组合工具版本status
  updateVersionStatusAction(params) {
    return axios.post('/api/rest/autoexec/combop/version/status/update', params);
  },
  //复制
  copyAction(params) {
    return axios.post('/api/rest/autoexec/combop/copy', params);
  },
  //删除操作
  deleteAction(params) {
    return axios.post('/api/rest/autoexec/combop/delete', params);
  },
  //删除版本操作
  deleteVersionAction(params) {
    return axios.post('/api/rest/autoexec/combop/version/delete', params);
  },
  //获取工具类型
  getActionType(params) {
    return axios.post('/api/rest/autoexec/type/search', params);
  },
  //删除类型
  deleteType(params) {
    return axios.post('/api/rest/autoexec/type/delete', params);
  },
  //保存类型
  saveType(params) {
    return axios.post('/api/rest/autoexec/type/save', params);
  },
  //获取类型
  getType(params) {
    return axios.post('/api/rest/autoexec/type/get', params);
  },
  //获取组合工具全局参数
  getParamList(params) {
    return axios.post('/api/rest/autoexec/combop/param/list', params);
  },
  //参数类型列表
  getParamsTypeLit(params) {
    return axios.post('/api/rest/universal/enum/get', params);
  },
  //执行组合工具
  executeAction(params) {
    return axios.post('/api/rest/autoexec/combop/job/create', params);
  },
  //查询执行目标列表
  getNodeList(params) {
    return axios.post('/api/rest/resourcecenter/resource/list', params);
  },
  getNodeTagList(params) {
    return axios.post('/api/rest/resourcecenter/tag/list/forselect', params);
  },
  searchNotifyList(data) {
    //通知策略列表
    return axios.post('/api/rest/notify/policy/search', data);
  },
  getMatrixAttributeByUuid(params) { //矩阵数据
    return axios.post('/api/rest/matrix/attribute/search', params);
  },
  //执行目标校验
  getValidList(params) {
    return axios.post('/api/rest/resourcecenter/resource/check', params);
  },
  //组合工具预置参数列表
  getProfileList(params) {
    return axios.post('/api/rest/autoexec/combop/profile/list', params);
  },
  getCombopExecutableList(params) {
    // 查询当前用户可执行的组合工具列表
    return axios.post('api/rest/autoexec/combop/executable/list', params);
  },
  getCombopExecutableTypeList(params) {
    // 获取可执行组合工具分类列表
    return axios.post('/api/rest/autoexec/combop/type/executable/list', params);
  },
  searchResourceCustomList(params) {
    // 高级查询资源中心数据列表
    return axios.post('/api/rest/resourcecenter/resource/custom/list', params);
  },
  getValueconverttextList(params) {
    // 获取资产高级过滤条件,根据值补充中文
    return axios.post('/api/rest/resourcecenter/custom/condition/valueconverttext/get', params);
  },
  updateServiceActiveStatus(params) {
    // 更新服务目录激活状态
    return axios.post('/api/rest/autoexec/service/isactive/update', params);
  },
  validinputnodelist(params) {
    // 检查输入节点列表的节点是否合法
    return axios.post('/api/rest/resourcecenter/resource/inputnodelist/check', params);
  }
};

export default action;

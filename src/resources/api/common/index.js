import axios from '../http';
const common = {
  getModule(data) {
    return axios.post('/api/rest/module/list', data);
  },
  getModuleList(data) {
    return axios.post(`/api/rest/auth/module/get`, {
      params: data
    });
  },
  getAuthlist(data) {
    return axios.get('/api/rest/auth/search', {
      params: data
    });
  },
  getUser(data) {
    return axios.post('/api/rest/user/get', data);
  },
  //获取当前用户令牌
  getCurrentUserToken() {
    return axios.get('/api/rest/user/current/token/get', {});
  },
  //获取用户令牌
  getUserToken(data) {
    return axios.post('/api/rest/user/token/get', data);
  },
  //用户权限保存
  saveAuth(data) {
    return axios.post('/api/rest/user/auth/save', data);
  },
  //获取用户权限
  getUserAuth(data) {
    return axios.post('/api/rest/user/auth/search', data);
  },
  //角色权限保存
  saveRoleAuth(data) {
    return axios.post('/api/rest/role/auth/save', data);
  },
  //获取角色权限
  getRoleAuth(data) {
    return axios.post('/api/rest/role/auth/search', data);
  },
  //获取角色信息
  getRole(data) {
    return axios.post('/api/rest/role/get', data);
  },
  //角色用户添加接口
  roleUserSave(data) {
    return axios.post('/api/rest/role/user/save', data);
  },
  checkTenant() {
    return axios.post('/tenant/check');
  },
  //获取权限组列表
  getAuthGroup(data) {
    return axios.post('/api/rest/auth/group', data);
  },
  //通过权限组获取权限列表
  getAuthGrouplist(data) {
    return axios.post('/api/rest/user/role/auth/search', data);
  },
  //通过角色列表数组查询权限接口
  getRoleListAuth(data) {
    return axios.post('/api/rest/role/list/auth/search', data);
  },
  //权限角色查询接口
  getAuthRoleList(data) {
    return axios.post('/api/rest/auth/role/search', data);
  },
  //权限用户查询接口
  getAuthUserList(data) {
    return axios.post('/api/rest/auth/user/search', data);
  },
  //权限用户保存接口
  saveAuthUser(data) {
    return axios.post('/api/rest/auth/user/save', data);
  },
  //权限角色保存接口
  saveAuthRole(data) {
    return axios.post('/api/rest/auth/role/save', data);
  },
  //图标查询接口
  getIconList(data) {
    return axios.post('/api/rest/icon/list', data);
  },
  logout(data) {
    return axios.post(`/api/rest/logout`, data);
  },
  downLoad(data) {
    return axios.get('api/binary/file/download', {
      params: data,
      responseType: 'arraybuffer'
    });
  },
  //获取仪表板列表
  searchDashboard(data) {
    return axios.post('/api/rest/dashboard/search', data);
  },
  //通过组uuid获取用户uuidList,可传入组uuid List
  getUserUuidForTeam(data) {
    return axios.post('/api/rest/user/list', data);
  },
  //通过组uuid获取该组下成员信息
  getUserListForTeam(data) {
    return axios.get('/api/rest/team/user/list', {
      params: data
    });
  },
  //保存用户职务
  saveUserLevel(data) {
    return axios.post('/api/rest/team/user/title/update', data);
  },
  // 消息中心：获取消息数量和最新的消息
  getMessageCount(data) {
    return axios.post('/api/rest/message/count', data);
  },
  // 消息中心：获取消息列表
  getMessageList(data) {
    return axios.post('/api/rest/message/list', data);
  },
  // 消息中心：更新消息为已读
  readMessage(data) {
    return axios.post('/api/rest/message/isread/update', data);
  },
  // 消息中心：关闭弹框
  closePopupMsg(data) {
    return axios.post('/api/rest/message/popup/close', data);
  },
  // 消息中心：拉取系统公告列表
  pullNotice(data) {
    return axios.post('/api/rest/systemnotice/pull', data);
  },
  // 消息中心：获取某条系统公告的详细内容
  getNotice(id) {
    return axios.post('/api/rest/systemnotice/popupnotice/get', { id });
  },
  // 消息中心：设置系统公告为已读
  readNotice(params) {
    return axios.post('/api/rest/systemnotice/readstatus/update', params);
  },
  //下拉列表：枚举数据源通用接口
  getSelectList(params) {
    return axios.post('/api/rest/universal/enum/get', params);
  },
  //查询执行目标列表
  getNodeList(params) {
    return axios.post('/api/rest/resourcecenter/resource/list', params);
  },
  //获取多个下拉列表：枚举数据源通用接口（入参为数组）
  getBatchSelectList(params) {
    return axios.post('/api/rest/universal/enum/get/batch', params);
  },
  // 获取最近使用的仪表板
  updateDashboardMenu(params) {
    return axios.post('/api/rest/dashboard/search', params);
  },
  // 获取知识库的知识分类列表
  updateKnowledgeMenu(params) {
    return axios.get('api/rest/knowledge/type/list', params);
  },
  // 获取报表实例列表
  updateReportMenu(params) {
    return axios.post('/api/rest/reportinstance/list', params);
  },
  // 获取CMDB的模型类型和模型列表
  updateCmdbMenu(params) {
    return axios.post('/api/rest/cmdb/ci/citype/search', params);
  },
  // 获取工单中心分类
  updateProcessMenu(params) {
    return axios.post('/api/rest/workcenter/list', params);
  },
  updateInspectMenu(params) {
    // 获取巡检结果分类
    return axios.post('/api/rest/inspect/new/problem/customview/list', params);
  },
  getUserRoleTeam(params) {
    // 用户角色及组织架构查询接口
    return axios.post('/api/rest/user/role/team/search', params);
  },
  getLicenseInvalidMsg() {
    return axios.post('/api/rest/license/invalid/msg/get');
  }
};

export default common;

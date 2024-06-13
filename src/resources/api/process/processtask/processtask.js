import axios from '../../http';

const processtask = {
  //工单上报暂存接口
  save(data) {
    return axios.post('/api/rest/processtask/draft/save', data);
  },
  //工单处理：
  getTaskAction(data) {
    //获取处理权限
    return axios.post('/api/rest/processtask/step/action/list', data);
  },
  saveTaskDetail(data) {
    //暂存
    return axios.post('/api/rest/processtask/step/draft/save', data);
  },
  cancelTaskDetail(data) {
    //取消
    return axios.post('/api/rest/processtask/abort', data);
  },
  recoverTaskDetail(data) {
    //恢复
    return axios.post('/api/rest/processtask/recover', data);
  },
  transferTaskDetail(data) {
    //转交
    return axios.post('/api/rest/processtask/transfer', data);
  },
  complete(data) {
    //流转、完成提交
    return axios.post('/api/rest/processtask/complete', data);
  },
  startprocess(data) {
    //工单上报提交
    return axios.post('/api/rest/processtask/startprocess', data);
  },
  getAuditList(data) {
    //工单活动列表
    return axios.post('/api/rest/processtask/audit/list', data);
  },
  getStepStatusList(data) {
    //工单步骤列表
    return axios.post('/api/rest/processtask/step/list', data);
  },
  getTaskMessage(data) {
    //基本信息
    return axios.post('/api/rest/processtask/step/get', data);
  },
  getNextStep(data) {
    //可流转步骤列表
    return axios.post('/api/rest/processtask/nextstep/list', data);
  },
  getTaskList(data) {
    //当前用户任务列表
    return axios.post('/api/rest/processtask/currentuser/task/list', data);
  },
  retreatTask(data) {
    //撤回
    return axios.post('/api/rest/processtask/retreat', data);
  },
  getRetreatlist(id) {
    //获取可以撤回的列表
    return axios.post('/api/rest/processtask/retreatablestep/list', {
      processTaskId: id
    });
  },
  startTask(data) {
    //开始
    return axios.post('/api/rest/processtask/start', data);
  },
  ifNecessaryStartTask(data) {
    //如果需要，开始工单步骤
    return axios.post('/api/rest/processtask/step/start/ifnecessary', data);
  },
  commentTask(data) {
    //回复
    return axios.post('/api/rest/processtask/comment', data);
  },
  deleteComment(data) {
    //删除回复
    return axios.post('/api/rest/processtask/comment/delete', data);
  },
  editComment(data) {
    //编辑回复
    return axios.post('/api/rest/processtask/comment/edit', data);
  },
  stepStatus(data) {
    //流程图数据
    return axios.post('/api/rest/processtask/step/status/list', data);
  },
  stepFlowTop(data) {
    //工单流程图渲染topo的所有数据
    return axios.post('/api/rest/processtask/flowchart', data);
  },
  createSubtask(data) {
    //创建子任务
    return axios.post('/api/rest/processtask/step/subtask/create', data);
  },
  subRedoable(data) {
    //子任务重做
    return axios.post('/api/rest/processtask/step/subtask/redo', data);
  },
  subEditable(data) {
    //子任务编辑
    return axios.post('/api/rest/processtask/step/subtask/edit', data);
  },
  subAbortable(data) {
    //子任务取消
    return axios.post('/api/rest/processtask/step/subtask/abort', data);
  },
  subComplete(data) {
    //子任务完成
    return axios.post('/api/rest/processtask/step/subtask/complete', data);
  },
  subTaskComment(data) {
    //子任务回复
    return axios.post('/api/rest/processtask/step/subtask/comment', data);
  },
  urgeProcesssTask(data) {
    //催办
    return axios.post('/api/rest/processtask/urge', data);
  },
  retryAuto(data) {
    //auto:重试
    return axios.post('/api/rest/processtask/automatic/retry', data);
  },
  pauseTaskStep(data) {
    //暂停步骤
    return axios.post('/api/rest/processtask/step/pause', data);
  },
  recoverTaskStep(data) {
    //恢复步骤
    return axios.post('/api/rest/processtask/step/recover', data);
  },
  //变更步骤
  changeStepStart(data) {
    //开始
    return axios.post('/api/rest/change/step/start', data);
  },
  changeStepAbort(data) {
    //取消
    return axios.post('/api/rest/change/step/abort', data);
  },
  changeStepComment(data) {
    //回复
    return axios.post('/api/rest/change/step/comment', data);
  },
  changeStepCommentList(data) {
    //回复列表
    return axios.post('/api/rest/change/step/comment/list', data);
  },
  delchangeStepComment(data) {
    //删除回复
    return axios.post('/api/rest/change/step/comment/delete', data);
  },
  editchangeStepComment(data) {
    //删除回复
    return axios.post('/api/rest/change/step/comment/edit', data);
  },
  changeStepComplete(data) {
    //完成
    return axios.post('/api/rest/change/step/complete', data);
  },
  changeStepWorker(data) {
    //批量更新处理人
    return axios.post('/api/rest/change/step/worker/batchupdate', data);
  },
  getChangeStep(data) {
    //查询变更信息
    return axios.post('/api/rest/change/step/get', data);
  },
  updateChangeStep(data) {
    //更新变更信息
    return axios.post('/api/rest/change/step/update', data);
  },
  commentChangeStep(data) {
    //回复变更信息
    return axios.post('/api/rest/change/step/comment', data);
  },
  changePause(data) {
    //暂停变更
    return axios.post('/api/rest/change/pause', data);
  },
  changeRecover(data) {
    //恢复变更
    return axios.post('/api/rest/change/recover', data);
  },
  changeRestart(data) {
    //重新开始变更
    return axios.post('/api/rest/change/restart', data);
  },
  changeStart(data) {
    //开始变更
    return axios.post('/api/rest/change/start', data);
  },
  updateChange(data) {
    //开始变更
    return axios.post('/api/rest/change/update', data);
  },
  redoTask(data) {
    //工单评分前回退
    return axios.post('/api/rest/processtask/step/redo', data);
  },
  //工单草稿数据获取接口
  draftGet(data) {
    return axios.post('/api/rest/processtask/draft/get', data);
  },
  //工单中心操作搜索接口
  listOperation(data) {
    return axios.post('/api/rest/workcenter/operation/list', data);
  },
  // 工单中心 20201019_zqp_工单中心切换频繁上一次搜索结果会影响之后的，新增config参数用来取消之前的接口防止回调
  searchWorkcenter(data, config) {
    //数据获取
    if (config) {
      return axios.post('/api/rest/workcenter/search', data, config);
    } else {
      return axios.post('/api/rest/workcenter/search', data);
    }
  },
  searchBatchDispatch(params) {
    //搜索工单批量上报的记录
    return axios.post('api/rest/processtask/import/audit/search', params);
  },
  Workcenterget(data, cancelAxios) {
    //数据获取
    return axios.post('/api/rest/workcenter/get', data, cancelAxios);
  },
  //获取工单中心数据
  getWorkcenterByUuid(uuid) {
    return axios.post('/api/rest/workcenter/get', {uuid: uuid});
  },
  workcenterMenu(data) {
    //分类列表
    return axios.post('/api/rest/workcenter/list', data);
  },
  saveMenu(data) {
    //保存新的工单中心
    return axios.post('/api/rest/workcenter/save', data);
  },
  delMenu(data) {
    //删除
    return axios.post('/api/rest/workcenter/delete', data);
  },
  workcenterCondition(data) {
    // 工单搜索条件数据获取
    return axios.post('/api/rest/workcenter/condition/get', data);
  },
  workcenterTheadSave(data) {
    // 工单搜索表单数据获取
    return axios.post('/api/rest/workcenter/thead/save', data);
  },
  workcenterKeywordSearch(data) {
    // 返回可以匹配的关键字列表
    return axios.post('/api/rest/workcenter/keyword/search', data);
  },
  getNextsteplist(data) {
    // 获取当前用户可处理的步骤列表接口
    return axios.post('/api/rest/processtask/processablestep/list', data);
  },
  workcenterMenuSort(data) {
    //工单中心分类排序
    return axios.post('/api/rest/workcenter/user/profile/save', data);
  },
  workcenterConditionSave(data) {
    //工单中心条件保存
    return axios.post('/api/rest/workcenter/condition/save', data);
  },
  //工单中心按钮操作之后获取工单状态
  getAction(data) {
    return axios.post('/api/rest/workcenter/processtask/get', data);
  },
  updateFocus(data) {
    return axios.post('/api/rest/processtask/focus/update', data);
  },
  saveDraftDocument(data) {
    //工单保存为知识
    return axios.post('api/rest/knowledge/document/draft/save', data);
  },
  reviewDraftDocument(data) {
    //工单保存为知识审核
    return axios.post('api/rest/knowledge/document/draft/review', data);
  },
  knowledgeAudit(data) {
    //工单保存为知识生成活动
    return axios.post('api/rest/processtask/transfer/knowledge/audit', data);
  },
  knowledgeDetail(data) {
    //工单详情获取知识信息
    return axios.post('api/rest/knowledge/document/invoke/get', data);
  },
  //更新工单数据（标题/内容/标签/优先级）
  updateWorkData(data) {
    return axios.post('/api/rest/processtask/update', data);
  },
  updateFocusUser(data) {
    return axios.post('/api/rest/processtask/focususer/update', data);
  },
  stepSlatime(data) {
    //当前步骤时效
    return axios.post('api/rest/processtask/step/slatime/list', data);
  },
  slaTimeList(data) {
    //当前步骤时效
    return axios.post('api/rest/processtask/slatime/list', data);
  },
  getStepdata(data) {
    //当前步骤的数据
    return axios.post('api/rest/processtask/step/data/get', data);
  },
  getTransferablestep(id) {
    //获取转交步骤列表
    return axios.post('/api/rest/processtask/transferablestep/list', {
      processTaskId: id
    });
  },
  //批量导出工单数据
  exportWork(data) {
    return axios.post('/api/binary/workcenter/export', data);
  },
  //单独的获取当前工单的关注人列表
  getCurrentFocususerList(data) {
    return axios.post('/api/rest/processtask/focususer/list', data);
  },
  //查询工单列表(重复工单专用)
  getForRepeatList(data) {
    return axios.post('/api/rest/processtask/list/forrepeat', data);
  },
  //解绑重复工单接口
  deleteRepeat(data) {
    return axios.post('/api/rest/processtask/repeat/delete', data);
  },
  //查询重复工单列表
  getRepeatList(data) {
    return axios.post('/api/rest/processtask/repeat/list', data);
  },
  //标记重复工单接口
  saveRepeat(data) {
    return axios.post('/api/rest/processtask/repeat/save', data);
  },
  //重审
  reapprovalTask(data) {
    return axios.post('/api/rest/processtask/reapproval', data);
  },
  saveMenuCatalog(params) {
    // 保存菜单分类
    return axios.post('/api/rest/workcenter/catalog/save', params);
  },
  getMenuCatalogList(params) {
    // 获取菜单分类列表
    return axios.post('/api/rest/workcenter/catalog/list', params);
  },
  renameWorkcenter(params) {
    //修改工单中心分类名称
    return axios.post('/api/rest/workcenter/rename', params);
  },
  saveWorkcenterAuth(params) {
    //修改工单中心授权
    return axios.post('/api/rest/workcenter/auth/save', params);
  },
  getProcesstaskFileList(params) { //获取工单附件
    return axios.post('/api/rest/processtask/file/search', params);
  },
  searchrelateknowledge(params) { //搜索相关知识
    return axios.post('/api/rest/knowledge/document/search', params);
  },
  getReportingHistoryList(params) { // 工单上报历史
    return axios.post('/api/rest/processtask/list/forowner', params);
  },
  batchAbort(params) { // 批量取消工单
    return axios.post('/api/rest/processtask/batch/abort', params);
  },
  batchUrge(params) { // 批量催办工单
    return axios.post('/api/rest/processtask/batch/urge', params);
  },
  batchHide(params) { // 批量隐藏工单
    return axios.post('/api/rest/processtask/batch/hide', params);
  },
  batchPause(params) { // 批量暂停工单
    return axios.post('/api/rest/processtask/batch/pause', params);
  },
  batchDelete(params) { // 批量删除工单
    return axios.post('/api/rest/processtask/batch/delete', params);
  }
};
export default processtask;

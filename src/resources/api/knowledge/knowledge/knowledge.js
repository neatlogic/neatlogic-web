import axios from '../../http';
const knowledge = {
  getDocument(data) {
    //查询文档内容
    return axios.post('api/rest/knowledge/document/get', data);
  },
  documentList(data) {
    //查询文档列表
    return axios.post('api/rest/knowledge/document/list', data);
  },
  draftDocumentList(data) {
    //查询草稿列表
    return axios.post('api/rest/knowledge/document/draft/list', data);
  },
  saveDraftDocument(data) {
    //保存文档草稿
    return axios.post('api/rest/knowledge/document/draft/save', data);
  },
  // submitDraftDocument(data) { (废弃)
  //   //提交审核文档草稿
  //   return axios.post('api/rest/knowledge/document/draft/submit', data);
  // },
  reviewDraftDocument(data) {
    //审核文档草稿
    return axios.post('api/rest/knowledge/document/draft/review', data);
  },
  deleteDocument(data) {
    //删除文档
    return axios.post('api/rest/knowledge/document/delete', data);
  },
  deleteVersion(data) {
    //删除文档版本
    return axios.post('api/rest/knowledge/document/version/delete', data);
  },
  waitingforreviewList(data) {
    //查询待我审批列表
    return axios.post('api/rest/knowledge/document/waitingforreview/list', data);
  },
  knowledgeType(data) {
    //知识分类
    return axios.post('api/rest/knowledge/type/list', data);
  },
  historicalVersion(data) {
    //历史版本列表
    return axios.post('api/rest/knowledge/document/historicalversion/list', data);
  },
  switchVersion(data) {
    //切换、回退版本
    return axios.post('api/rest/knowledge/document/version/switch', data);
  },
  //保存文档
  saveDocument(data) {
    return axios.post('api/rest/knowledge/template/save', data);
  },
  collectDocument(data) {
    //文档收藏
    return axios.post('api/rest/knowledge/document/collect/toggle', data);
  },
  favorDocument(data) {
    //文档点赞
    return axios.post('api/rest/knowledge/document/favor/toggle', data);
  },
  versionDocument(data) {
    //比较文档
    return axios.post('api/rest/knowledge/document/version/compare', data);
  },
  auditList(data) {
    //活动列表
    return axios.post('api/rest/knowledge/document/audit/list', data);
  },
  selectHistoricalversion(data) {
    //选择历史版本列表
    return axios.post('api/rest/knowledge/document/historicalversion/list/forselect', data);
  },
  updateTitle(data) {
    //更新标题
    return axios.post('api/rest/knowledge/document/title/update', data);
  },
  updateType(data) {
    //更新文档类型
    return axios.post('api/rest/knowledge/document/type/update', data);
  },
  uploadFile(data) {
    //上传文件
    let config = { headers: { 'content-type': 'multipart/form-data' }, contentType: 'multipart/form-data'};
    return axios.post('api/binary/file/upload', data, config);
  }
};

export default knowledge;

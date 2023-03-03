import axios from '../../http';

const message = {
  // 获取订阅列表
  getHandlerList(params) {
    return axios.post('/api/rest/message/handler/list', params);
  },
  // 更新激活状态
  updateActiveStatus(params) {
    return axios.post('/api/rest/message/handler/active/update', params);
  },
  // 更新消息推送设置
  updatePopup(params) {
    return axios.post('/api/rest/message/handler/popup/update', params);
  },
  // 获取历史消息分类树
  getTree(params) {
    return axios.post('api/rest/message/history/tree', params);
  },
  // 获取历史消息列表
  getHistoryList(params) {
    return axios.post('/api/rest/message/history/list', params);
  },
  // 设置消息为已读
  readMessage(params) {
    return axios.post('/api/rest/message/isread/update', params);
  }
};
export default message;

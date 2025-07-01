import axios from '../../http';

const mq = {
  getSubscribeById(id) {
    return axios.post('/api/rest/mq/subscribe/get', { id: id });
  },
  searchSubscribe(params) {
    return axios.post('/api/rest/mq/subscribe/search', params);
  },
  getTopicByName(name) {
    return axios.post('/api/rest/mq/topic/get', { name: name });
  },
  listMqHandler(params) {
    return axios.post('/api/rest/mq/mqhandler/list', params || {});
  },
  listSubscribeHandler() {
    return axios.post('/api/rest/mq/subscribehandler/list', {});
  },
  listTopic(params) {
    return axios.post('/api/rest/mq/topic/list', params || {});
  },
  saveTopic(params) {
    return axios.post('/api/rest/mq/topic/save', params);
  },
  toggleTopicActive(param) {
    return axios.post('/api/rest/mq/topic/toggleactive', param);
  },
  saveSubscribe(param) {
    return axios.post('/api/rest/mq/subscribe/save', param);
  },
  toggleSubscribeActive(param) {
    return axios.post('/api/rest/mq/subscribe/toggleactive', param);
  },
  deleteSubscribe(id) {
    return axios.post('/api/rest/mq/subscribe/delete', { id: id });
  },
  deleteTopic(name) {
    return axios.post('/api/rest/mq/topic/delete', { name: name });
  },
  testTopic(param) {
    return axios.post('/api/rest/mq/topic/test', param);
  },
  healthCheck(id) {
    return axios.post('/api/rest/mq/subscribe/healthcheck', { id: id });
  }
};
export default mq;

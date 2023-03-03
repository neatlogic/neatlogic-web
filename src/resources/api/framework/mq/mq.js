import axios from '../../http';

const mq = {
  getSubscribeById(id) {
    return axios.post('/api/rest/mq/subscribe/get', {id: id});
  },
  searchSubscribe(params) {
    return axios.post('/api/rest/mq/subscribe/search', {
      params: params
    });
  },
  listSubscribeHandler() {
    return axios.post('/api/rest/mq/subscribehandler/list', {});
  },
  listTopic() {
    return axios.post('/api/rest/mq/topic/list', {});
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
    return axios.post('/api/rest/mq/subscribe/delete', {id: id});
  }
};
export default mq;

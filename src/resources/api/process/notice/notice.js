//通知接口
import axios from '../../http';

const notice = {
  //优先级列表搜索接口
  getHandle(data) {
    return axios.post('/api/rest/notify/handler/list', data);
  },
  templateSearch(data) {
    return axios.post('/api/rest/notify/template/search', data);
  },
  templateGet(data) {
    return axios.post('/api/rest/notify/template/get', data);
  },
  templateSave(data) {
    return axios.post('/api/rest/notify/template/save', data);
  },
  templateDelete(data) {
    return axios.post('/api/rest/notify/template/delete', data);
  },
  templateTypeList() {
    return axios.get('/api/rest/notify/template/type/list');
  },
  templateListForSelect() {
    return axios.get('/api/rest/notify/template/list/forselect');
  }
};

export default notice;

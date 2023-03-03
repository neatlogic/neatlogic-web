import axios from '../../http';

const worktime = {
  //优先级列表搜索接口
  search(data) {
    return axios.post('/api/rest/worktime/search', data);
  },
  get(data) {
    return axios.post('/api/rest/worktime/get', data);
  },
  save(data) {
    return axios.post('/api/rest/worktime/save', data);
  },
  delete(data) {
    return axios.post('/api/rest/worktime/delete', data);
  },
  calendarGet(data) {
    return axios.post('/api/rest/worktime/calendar/get', data);
  },
  calendarSave(data) {
    return axios.post('/api/rest/worktime/calendar/save', data);
  }
};

export default worktime;

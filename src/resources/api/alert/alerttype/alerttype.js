import axios from '../../http';

const alerttype = {
  searchAlertType(params) {
    return axios.post('/api/rest/alert/alerttype/search', params);
  },
  getAlertTypeById(id) {
    return axios.post('/api/rest/alert/alerttype/get', { id: id });
  },
  saveAlertType(params) {
    return axios.post('/api/rest/alert/alerttype/save', params);
  },
  deleteAlertType(id) {
    return axios.post('/api/rest/alert/alerttype/delete', { id: id });
  }
};

export default alerttype;

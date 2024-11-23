import axios from '../../http';

const alerttype = {
  searchAlertType(params) {
    return axios.post('/api/rest/alert/alerttype/search', params);
  },
  getAlertTypeById(id) {
    return axios.post('/api/rest/alert/alerttype/get', {id: id});
  }
};

export default alerttype;

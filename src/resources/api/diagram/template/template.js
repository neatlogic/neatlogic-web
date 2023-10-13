import axios from '../../http';

const widget = {
  getTemplateById(id) {
    return axios.post('/api/rest/diagram/template/get', { id: id });
  }
};

export default widget;

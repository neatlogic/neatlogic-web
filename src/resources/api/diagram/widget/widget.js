import axios from '../../http';

const widget = {
  listWidgetList(params) {
    return axios.post('/api/rest/diagram/widget/list', params || {});
  }
};

export default widget;

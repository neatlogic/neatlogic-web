import axios from '../../http';

const widget = {
  searchWidget(params) {
    return axios.post('/api/rest/diagram/widget/search', params || {});
  }
};

export default widget;

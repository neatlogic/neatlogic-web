import axios from '../../http';

const integration = {
  //查询集成
  getIntegrationTableSearch(params) {
    return axios.post('/api/rest/integration/table/data/search', params);
  }

};

export default integration;

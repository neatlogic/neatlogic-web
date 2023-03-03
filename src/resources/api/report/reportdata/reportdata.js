import axios from '../../http';

const reportdata = {
  //查询地理数据
  searchDistrict(params) {
    return axios.post('/api/rest/report/data/district/search', params);
  }
};

export default reportdata;

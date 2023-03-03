import utils from '@/resources/assets/js/util.js';
const navigation = {
  //首页导航接口
  getModuleList() {
    return axios.post('/api/rest/auth/module/get');
  }
};

export default navigation;

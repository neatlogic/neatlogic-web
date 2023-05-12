import axios from '../../http';

const apiManage = {
  //接口列表
  getHistoryList(params) {
    return axios.get('/api/rest/apimanage/search', {
      //这里的接口要换成实际的rest接口获取地址
      params: params
    });
  }
};
export default apiManage;

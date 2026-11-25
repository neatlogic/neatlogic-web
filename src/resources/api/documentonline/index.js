
import axios from '../http';

const documentonline = {
  getDocumentTableList(data) { //帮助中心模块文档列表
    return axios.post('/api/rest/documentonline/table/list', data);
  },
  getDirectory() { //在线帮助文档目录
    return axios.post('/api/rest/documentonline/directory');
  },
  getDocumentDetail(data, config) { //获取单个在线帮助文档
    return axios.post('/api/rest/documentonline/get', data, config);
  },
  getDocumentList(data) { //查询在线帮助文档列表
    return axios.post('/api/rest/documentonline/list', data);
  },
  getRouteDocumentList(data) { //问号跳转查询，失败时由调用方打开帮助中心首页
    return axios.post('/api/rest/documentonline/list', data, {headers: {unConsole: 1}});
  },
  searchDocument(data, config) { //全局搜索文档
    return axios.post('/api/rest/documentonline/search', data, config);
  }
};

export default documentonline;

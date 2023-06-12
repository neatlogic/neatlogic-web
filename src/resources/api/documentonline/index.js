
import axios from '../http';

const documentonline = {
  getDocumentTableList(data) { //帮助中心模块文档列表
    return axios.post('/api/rest/documentonline/table/list', data);
  },
  getDirectory() { //在线帮助文档目录
    return axios.post('/api/rest/documentonline/directory');
  },
  getDocumentDetail(data) { //获取单个在线帮助文档
    return axios.post('/api/rest/documentonline/get', data);
  },
  getDocumentList(data) { //查询在线帮助文档列表
    return axios.post('/api/rest/documentonline/list', data);
  },
  searchDocument(data) { //全局搜索文档
    return axios.post('/api/rest/documentonline/search', data);
  }
};

export default documentonline;

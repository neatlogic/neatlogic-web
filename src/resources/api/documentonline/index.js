
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
  },
  getUnclassifiedList(data) { //未分类文档列表
    return axios.post('/api/rest/documentonline/unclassified/list', data);
  },
  saveDocumentonlineConfig(data) { //保存在线帮助文档与模块菜单的映射关系
    return axios.post('/api/rest/documentonline/config/save', data);
  }
};

export default documentonline;

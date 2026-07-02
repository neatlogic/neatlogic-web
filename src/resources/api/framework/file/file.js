import axios from '../../http';

const file = {
  searchFile(params) {
    return axios.post('api/rest/file/search', params);
  },
  getFileTypeList() {
    return axios.post('api/rest/file/type/list', {});
  },
  searchFileTypeConfig() {
    return axios.post('api/rest/file/type/config/list', {});
  },
  saveFileTypeConfig(params) {
    return axios.post('api/rest/file/type/config/save', params);
  },
  deleteFileTypeConfig(params) {
    return axios.post('api/rest/file/type/config/delete', params);
  },
  getFileByIdList(fileIdList) {
    return axios.post('/api/rest/file/list', {idList: fileIdList});
  },
  getFileContentByPath(params) {
    return axios.post('/api/rest/file/content/read', params);
  },
  deleteFile(params) {
    return axios.post('/api/rest/file/delete', params);
  }
};
export default file;

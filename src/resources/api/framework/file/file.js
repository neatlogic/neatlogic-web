import axios from '../../http';

const file = {
  searchFile(params) {
    return axios.post('api/rest/file/search', params);
  },
  getFileTypeList() {
    return axios.post('api/rest/file/type/list', {});
  },
  getFileByIdList(fileIdList) {
    return axios.post('/api/rest/file/list', {idList: fileIdList});
  },
  getFileContentByPath(params) {
    return axios.post('/api/rest/file/content/read', params);
  }
};
export default file;

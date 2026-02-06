import axios from '../../http';
export default {
  
  searchUserExportFileList(params) {
    return axios.post('api/rest/user/exportfile/search', params);
  },
  deleteUserExportFile(params) {
    return axios.post('api/rest/user/exportfile/delete', params);
  },
  updateUserExportFileIsRead(params) {
    return axios.post('api/rest/user/exportfile/isread/update', params);
  },
  getUserExportFileUnReadCount(params) {
    return axios.post('api/rest/user/exportfile/unread/count/get', params);
  }
};

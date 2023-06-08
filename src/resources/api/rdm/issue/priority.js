import axios from '../../http';

const priority = {
  getPriorityList() {
    return axios.post('/api/rest/rdm/priority/list');
  },
  getPriorityById(id) {
    return axios.post('/api/rest/rdm/priority/get', {id: id});
  },
  savePriority(params) {
    return axios.post('/api/rest/rdm/priority/save', params);
  },
  updatePrioritySort(priorityList) {
    return axios.post('/api/rest/rdm/priority/updatesort', {priorityList: priorityList});
  },
  deletePriority(id) {
    return axios.post('/api/rest/rdm/priority/delete', {id: id});
  }
};
export default priority;

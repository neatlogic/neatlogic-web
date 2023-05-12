import axios from '../../http';

const priority = {
  getPriorityList() {
    return axios.post('/api/rest/rdm/priority/list');
  },
  getPriorityById(id) {
    return axios.post('/api/rest/rdm/priority/get', {id: id});
  }
};
export default priority;

import axios from '../../http';

const collection = {
  getCollectionById(id) {
    return axios.post('api/rest/process/collection/get', {id: id});
  }
};

export default collection;

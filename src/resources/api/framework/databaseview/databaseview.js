import axios from '../../http';

const databaseview = {
  rebuildDatabaesView() {
    return axios.post('api/rest/util/rebuilddatabaesview', {});
  }
};
export default databaseview;

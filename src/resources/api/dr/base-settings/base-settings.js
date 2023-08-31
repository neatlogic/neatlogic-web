import axios from '../../http';
const baseSettings = {
  getBaseSettings() {
    return axios.post('/api/rest/dr/basicsettings/get', {});
  }
};
export default baseSettings;

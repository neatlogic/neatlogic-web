import axios from '../../http';
const pipeline = {
  searchPipeline(params) { 
    return axios.post('/api/rest/deploy/pipeline/search', params);
  },
  getPipelineById(id) {
    return axios.post('/api/rest/deploy/pipeline/get', {id: id});
  },
  ListPipelineAppSystemModuleEnvScenario(id) {
    return axios.post('/api/rest/deploy/pipeline/appsystemmoduleenvscenario/list', {id: id});
  },
  getJobTemplateById(id) {
    return axios.post('/api/rest/deploy/pipeline/jobtemplate/get', {id: id});
  },
  searchJobTemplate(params) {
    return axios.post('/api/rest/deploy/pipeline/jobtemplate/search', params);
  },
  savePipeline(params) {
    return axios.post('/api/rest/deploy/pipeline/save', params);
  },
  addBatchJob(params) {
    return axios.post('/api/rest/deploy/pipeline/addbatchjob', params);
  },
  deletePipeline(id) {
    return axios.post('/api/rest/deploy/pipeline/delete', {id: id});
  }
};
export default pipeline;

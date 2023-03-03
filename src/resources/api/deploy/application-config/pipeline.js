import axios from '../../http';
const apppipeline = {
  saveAppPipeline(params) { //保存流水线
    return axios.post('/api/rest/deploy/app/pipeline/save', params);
  },
  getAppPipeline(params) { //获取流水线
    return axios.post('/api/rest/deploy/app/pipeline/get', params);
  },
  getAppProfileList(params) { //预置参数
    return axios.post('/api/rest/deploy/app/pipeline/profile/List', params);
  },
  getParamoverrideList(params) { //查看上下游参数
    return axios.post('/api/rest/deploy/app/pipeline/profile/paramoverride/List', params);
  },
  getPipelineDraft(params) { //获取流水线草稿
    return axios.post('/api/rest/deploy/app/pipeline/draft/get', params);
  },
  savePipelineDraft(params) { //保存流水线草稿
    return axios.post('/api/rest/deploy/app/pipeline/draft/save', params);
  },
  deletePipelineDraft(params) { //删除流水线草稿
    return axios.post('/api/rest/deploy/app/pipeline/draft/delete', params);
  },
  savePipelineParams(params) { //保存流水线作业参数
    return axios.post('/api/rest/deploy/app/pipeline/param/save', params);
  },
  getPipelineParams(params) { //获取流水线作业参数
    return axios.post('/api/rest/deploy/app/pipeline/param/list', params);
  }
};
export default apppipeline;

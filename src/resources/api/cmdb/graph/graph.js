import axios from '../../http';

const graph = {
  getGraphById(id) {
    return axios.post('/api/rest/cmdb/graph/get', { id: id });
  },
  searchGraph(params) {
    return axios.post('/api/rest/cmdb/graph/search', params);
  },
  saveGraph(params) {
    return axios.post('/api/rest/cmdb/graph/save', params);
  },
  getInvokeGraph(graphId) {
    return axios.post('/api/rest/cmdb/graph/listinvoke', { toGraphId: graphId });
  },
  getAllCiEntityId(graphIdList) {
    return axios.post('/api/rest/cmdb/graph/getallcientityid', {graphIdList: graphIdList});
  },
  getGraphTopo(params) {
    return axios.post('/api/rest/cmdb/graph/topo', params);
  },
  deleteGraph(id) {
    return axios.post('/api/rest/cmdb/graph/delete', { id: id });
  }
};

export default graph;

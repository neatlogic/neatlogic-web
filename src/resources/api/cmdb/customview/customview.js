import axios from '../../http';

const customview = {
  getCustomViewTemplateById(id) {
    return axios.post('/api/rest/cmdb/customview/template/get', { customViewId: id });
  },
  searchPublicCustomView(params) {
    return axios.post('/api/rest/cmdb/customview/public/search', params);
  },
  searchSceneCustomView(params) {
    return axios.post('/api/rest/cmdb/customview/scene/search', params);
  },
  searchCustomView(params) {
    return axios.post('/api/rest/cmdb/customview/search', params);
  },
  saveCustomView(params) {
    return axios.post('/api/rest/cmdb/customview/save', params);
  },
  toggleActivePublicCustomView(params) {
    return axios.post('/api/rest/cmdb/customview/public/toggleactive', params);
  },
  getCustomViewById(id) {
    return axios.post('/api/rest/cmdb/customview/get', { id: id });
  },
  getCustomViewAttrByCustomViewId(id, isHidden) {
    return axios.post('/api/rest/cmdb/customview/attr/get', { id: id, isHidden: isHidden });
  },
  searchCustomViewData(param) {
    return axios.post('/api/rest/cmdb/customview/data/search', param);
  },
  searchCustomViewCiEntity(param) {
    return axios.post('/api/rest/cmdb/customview/data/search/cientity', param);
  },
  getCustomViewData(viewId, ciEntityId) {
    return axios.post('/api/rest/cmdb/customview/data/get', { customViewId: viewId, ciEntityId: ciEntityId });
  },
  getCustomViewCiEntityTopoData(param) {
    return axios.post('/api/rest/cmdb/customview/data/cientity/topo', param);
  },
  deleteCustomView(id) {
    return axios.post('/api/rest/cmdb/customview/delete', { id: id });
  },
  saveCustomViewTemplate(params) {
    return axios.post('/api/rest/cmdb/customview/template/save', params);
  },
  deleteCustomViewTemplate(id) {
    return axios.post('/api/rest/cmdb/customview/template/delete', { customViewId: id });
  }
};

export default customview;

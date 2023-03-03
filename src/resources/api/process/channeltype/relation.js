import axios from '../../http';

const relation = {
  getRelationList(data) {
    //查询服务类型关系列表
    return axios.post('api/rest/process/channeltype/relation/list', data);
  },
  getRelation(data) {
    //查询服务类型关系
    return axios.post('api/rest/process/channeltype/relation/get', data);
  },
  updateRelation(data) {
    //启用或禁用服务类型关系
    return axios.post('api/rest/process/channeltype/relation/isactive/update', data);
  },
  saveRelation(data) {
    //添加服务类型关系
    return axios.post('api/rest/process/channeltype/relation/save', data);
  },
  delRelation(data) {
    //删除服务类型关系
    return axios.post('api/rest/process/channeltype/relation/delete', data);
  },
  relarelationSelect(data) {
    //查询服务类型关系列表
    return axios.post('api/rest/process/channeltype/relation/list/forselect', data);
  },
  searchtree(data) {
    //查询服务目录
    return axios.post('api/rest/process/catalog/tree', data);
  },
  getTaskCalalogroute(data) {
    //处理页转报的服务目录
    return axios.post('api/rest/process/catalog/breadcrumb', data);
  },
  getTaskRelationList(data) {
    //查询关联工单列表
    return axios.post('api/rest/processtask/relation/list ', data);
  },
  searchTaskList(data) { //查询工单列表(关联工单专用)
    return axios.post('api/rest/processtask/list/forrelation', data);
  },
  delTaskRelation(data) { //删除工单关联
    return axios.post('api/rest/processtask/relation/delete', data);
  },
  saveTaskRelation(data) {
    return axios.post('api/rest/processtask/relation/save', data);
  },
  searchRelationType(data) {
    return axios.post('api/rest/process/channeltype/search/forselect', data);
  }
};

export default relation;

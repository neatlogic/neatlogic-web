import axios from '../../http';

const ci = {
  //保存模型
  saveCi(params) {
    return axios.post('/api/rest/cmdb/ci/save', params);
  },
  searchAttr(params) {
    return axios.post('/api/rest/cmdb/attr/search', params);
  },
  searchCiAttrRel(ciId, keyword) {
    return axios.post('/api/rest/cmdb/ci/attrrel/search', { ciId: ciId, keyword: keyword });
  },
  //保存属性
  saveAttr(params) {
    return axios.post('/api/rest/cmdb/attr/save', params);
  },
  saveRel(params) {
    return axios.post('/api/rest/cmdb/rel/save', params);
  },
  saveRelGroup(params) {
    return axios.post('/api/rest/cmdb/relgroup/save', params);
  },
  saveCiAuth(params) {
    return axios.post('/api/rest/cmdb/ci/auth/save', params);
  },
  saveCiView(params) {
    return axios.post('/api/rest/cmdb/ciview/save', params);
  },
  saveRelType(params) {
    return axios.post('/api/rest/cmdb/reltype/save', params);
  },
  /*saveCiNameExpression(ciId, nameExpression) {
    return axios.post('/api/rest/cmdb/ci/nameexpression/save', {ciId: ciId, nameExpression: nameExpression});
  },*/
  getCiUniqueByCiId(ciId) {
    return axios.post('/api/rest/cmdb/ci/unique/get', { ciId: ciId });
  },
  updateCiNameAttrId(ciId, attrId) {
    return axios.post('/api/rest/cmdb/ci/savenameattr', { ciId: ciId, attrId: attrId });
  },
  saveCiUniqueRule(ciId, attrIdList) {
    return axios.post('/api/rest/cmdb/ciunique/save', { ciId: ciId, attrIdList: attrIdList });
  },
  searchCiTypeCi(params) {
    return axios.post('/api/rest/cmdb/ci/citype/search', params);
  },
  getRelativeRelList(params) {
    return axios.post('/api/rest/cmdb/relative/rel/list', params);
  },
  getCiById(ciId, needAction) {
    return axios.post('/api/rest/cmdb/ci/get', { id: ciId, needAction: !!needAction });
  },
  getCiListForTree() {
    return axios.post('/api/rest/cmdb/ci/listtree', {});
  },
  getAttrById(attrId) {
    return axios.post('/api/rest/cmdb/attr/get', { id: attrId });
  },
  getAttrByIdList(attrIdList) {
    return axios.post('/api/rest/cmdb/attr/getlist', { idList: attrIdList });
  },
  getViewConstList(ciId, showType) {
    return axios.post('/api/rest/cmdb/ciview/listconst', { ciId: ciId, showType: showType });
  },
  getAttrByCiId(ciId, params) {
    let param = {
      ciId: ciId
    };
    if (params) {
      param = Object.assign(param, params);
    }
    return axios.post('/api/rest/cmdb/ci/listattr', param);
  },
  getGlobalAttrByCiId(ciId, params) {
    let param = {
      ciId: ciId
    };
    if (params) {
      param = Object.assign(param, params);
    }
    return axios.post('/api/rest/cmdb/ci/listglobalattr', param);
  },
  getExpressionAttrRelByCiId(ciId) {
    return axios.post('/api/rest/cmdb/ci/' + ciId + '/listexpressionattrrel', {});
  },
  /*newGetRelByCiId(ciId, needAction) {
    return axios.post('/api/rest/cmdb/ci/' + ciId + '/showrel/list', { needAction: !!needAction });
  },*/
  getRelById(relId) {
    return axios.post('/api/rest/cmdb/rel/get', { id: relId });
  },
  getRelByCiId(ciId, params) {
    //原参数needAction, showType, allowEdit
    let param = {
      ciId: ciId
    };
    if (params) {
      param = Object.assign(param, params);
    }
    return axios.post('/api/rest/cmdb/ci/listrel', param);
  },
  getRelRuleTypeList() {
    return axios.post('/api/rest/cmdb/relruletype/list');
  },
  getRelGroupByCiId(ciId) {
    return axios.post('/api/rest/cmdb/ci/' + ciId + '/relgroup/list');
  },
  getRelGroupById(ciGroupId) {
    return axios.post('/api/rest/cmdb/relgroup/get', { id: ciGroupId });
  },
  getCiAuthByCiId(ciId) {
    return axios.post('/api/rest/cmdb/ci/auth/get', { ciId: ciId });
  },
  getCiViewByCiId(ciId) {
    return axios.post('/api/rest/cmdb/ciview/get', { ciId: ciId });
  },
  getShowTypeList() {
    return axios.post('api/rest/cmdb/ciview/showtype/list');
  },
  getRelTypeList() {
    return axios.post('api/rest/cmdb/reltype/list', {});
  },
  getCiTopoData(params) {
    return axios.post('/api/rest/cmdb/topo/ci', params);
  },
  getCiList(data) {
    return axios.post('/api/rest/cmdb/ci/list', data);
  },
  getRelTypeById(id) {
    return axios.post('/api/rest/cmdb/reltype/get', { id: id });
  },
  getAttrTypeList() {
    return axios.post('/api/rest/cmdb/attrtype/list');
  },
  getDownwardCiList(ciId) {
    return axios.post('/api/rest/cmdb/ci/downward/list', { id: ciId });
  },
  getAllCiRelList(params) {
    return axios.post('/api/rest/cmdb/ci/rel/list', params);
  },
  deleteCiById(ciId) {
    return axios.post('/api/rest/cmdb/ci/delete', { id: ciId });
  },
  deleteAttrById(attrId) {
    return axios.post('/api/rest/cmdb/attr/delete', { id: attrId });
  },
  deleteRelById(relId) {
    return axios.post('/api/rest/cmdb/rel/delete', { id: relId });
  },
  deleteRelTypeById(relTypeId) {
    return axios.post('/api/rest/cmdb/reltype/delete', { id: relTypeId });
  },
  getCiInfo(data) {
    return axios.post('/api/rest/cmdb/ci/attrrellist', data);
  },
  exportCi(id) {
    return axios.post('/api/binary/cmdb/ci/export', { ciId: id });
  },
  rebuildRelativeRel(relId) {
    return axios.post('/api/rest/cmdb/rel/relative/rebuild', { relId: relId });
  },
  getCiTree() {
    return axios.post('/api/rest/cmdb/ci/tree', {});
  },
  saveCiTreeItem(params) {
    return axios.post('/api/rest/cmdb/ci/tree/save', params);
  },
  getCiForprocessmapping(params) { //获取模型信息（流程图cmdb节点关系映射专用）
    return axios.post('/api/rest/cmdb/ci/get/forprocessmapping', params);
  }
};

export default ci;

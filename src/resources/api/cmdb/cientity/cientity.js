import axios from '../../http';

const cientity = {
  searchCiEntity(params) {
    return axios.post('/api/rest/cmdb/cientity/search', params);
  },
  searchDeleteCiEntity(params) {
    return axios.post('/api/rest/cmdb/deletecientity/search', params);
  },
  searchIllegalCiEntity(params) {
    return axios.post('/api/rest/cmdb/illegalcientity/search', params);
  },
  exportCiEntity(data) {
    return axios.get('/api/binary/cmdb/cientity/export', {
      params: data,
      responseType: 'blob'
    });
  },
  //批量修改配置项
  batchUpdateCiEntity(params) {
    return axios.post('/api/rest/cmdb/cientity/batchupdate', params);
  },
  //批量检查配置项
  batchValidateCiEntity(params) {
    return axios.post('/api/rest/cmdb/cientity/batchvalidate', params);
  },
  //保存配置项信息
  /*saveCiEntity(params) {
    return axios.post('/api/rest/cmdb/cientity/save', params);
  },*/
  //一次保存多个配置项
  batchSaveCiEntity(params) {
    return axios.post('/api/rest/cmdb/cientity/batchsave', params);
  },
  //校验配置项是否可以保存
  validateCiEntity(params) {
    return axios.post('/api/rest/cmdb/cientity/validate', params);
  },
  //获取密码属性明文
  getPasswordPlaintext(ciEntityId, attrId) {
    return axios.post('/api/rest/cmdb/attrentity/getplaintext', { ciEntityId: ciEntityId, attrId: attrId });
  },
  //更新关系有效日期
  updateRelEntityValidDay(id, validDay) {
    return axios.post('/api/rest/cmdb/relentity/updatevalidday', { id: id, validDay: validDay });
  },
  getCiEntityAuthById(ciEntityId, ciId, authList) {
    return axios.post('/api/rest/cmdb/cientity/auth/get', { ciEntityId: ciEntityId, ciId: ciId, authList: authList });
  },
  getCiEntityBaseInfoById(id) {
    return axios.post('/api/rest/cmdb/cientity/baseinfo/get', { id: id });
  },
  getCiEntityById(ciId, ciEntityId, needAction, limitRelEntity, limitAttrEntity, showAttrRelList) {
    const param = {};
    param.ciId = ciId;
    param.ciEntityId = ciEntityId;
    param.needAction = needAction;
    if (typeof limitRelEntity != 'undefined') {
      param.limitRelEntity = !!limitRelEntity;
    }
    if (typeof limitAttrEntity != 'undefined') {
      param.limitAttrEntity = !!limitAttrEntity;
    }
    //按需返回属性或关系，格式是attr_xxx,relfrom_xxx或relto_xxx
    if (showAttrRelList) {
      param.showAttrRelList = showAttrRelList;
    }
    return axios.post('/api/rest/cmdb/cientity/get', param);
  },
  getCiEntityBaseInfoByIdList(idList) {
    return axios.post('/api/rest/cmdb/cientity/baseinfo/list', { idList: idList });
  },
  getCiEntityByIdList(ciId, idList) {
    return axios.post('/api/rest/cmdb/cientity/list', { ciId: ciId, idList: idList });
  },
  getCiEntityTopoData(params) {
    return axios.post('/api/rest/cmdb/topo/cientity', params);
  },
  deleteCiEntityById(id, needCommit, description) {
    return axios.post('/api/rest/cmdb/cientity/delete', { id: id, needCommit: needCommit, description: description });
  },
  batchDeleteCiEntity(ciEntityList, needCommit, description) {
    return axios.post('/api/rest/cmdb/cientity/batchdelete', { ciEntityList: ciEntityList, needCommit: needCommit, description: description });
  },
  validCiEntity(data) {
    return axios.post('/api/rest/cmdb/cientity/validate', data);
  },
  getFileByIdList(fileIdList) {
    return axios.post('/api/rest/file/list', { idList: fileIdList });
  },
  getIllegalCiEntityCount(ciId) {
    return axios.post('/api/rest/cmdb/cientity/illegal/count', { ciId: ciId });
  },
  serverRender() {
    return axios.post('/api/rest/serverrender', {});
  },
  getCiEntityStatus(ciEntityIdList) {
    return axios.post('/api/rest/cmdb/cientity/status/list', { ciEntityIdList: ciEntityIdList });
  },
  searchCiEntityAlert(params) {
    return axios.post('/api/rest/cmdb/cientity/alert/search', params);
  },
  searchAlertLevel() {
    return axios.post('/api/rest/cmdb/alertlevel/search', {});
  },
  getAlertLevel(level) {
    return axios.post('/api/rest/cmdb/alertlevel/get', { level: level });
  },
  saveAlertLevel(alertLevel) {
    return axios.post('/api/rest/cmdb/alertlevel/save', alertLevel);
  },
  deleteAlertLevel(level) {
    return axios.post('/api/rest/cmdb/alertlevel/delete', { level: level });
  }
};

export default cientity;

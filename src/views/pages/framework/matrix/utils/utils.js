import api from '@/resources/api/api.js';
const utils = {
  isDependency(uuid, calleeType, isId = false) {
    // 是否存在引用列表，是true，否false, isId true表示id,false是uuid
    if (!uuid) {
      return false;
    }
    let isDependency = false;
    let params = {
      calleeType: calleeType,
      currentPage: 1,
      pageSize: 20
    };
    if (isId) {
      params.id = uuid;
    } else {
      params.uuid = uuid;
    }
    return api.framework.matrix.getDependencyList(params).then((res) => {
      if (res.Status == 'OK') {
        let dataInfo = res.Return;
        isDependency = dataInfo && dataInfo.list ? (dataInfo.list.length > 0) : false;
        return Promise.resolve(isDependency);
      } else {
        return Promise.resolve(isDependency);
      }
    }).catch(() => {
      return Promise.reject(isDependency);
    });
  }
};

export default utils;

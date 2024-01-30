import axios from '../../http';

const apiManage = {
  // 获取接口树形目录
  getTree(params) {
    return axios.post('/api/rest/apimanage/tree/search', params);
  },
  // 获取接口树形目录子目录
  getSubtree(params) {
    return axios.post('/api/rest/apimanage/subtree/search', params);
  },
  // 获取接口列表
  search(params) {
    return axios.post('/api/rest/apimanage/search', params);
  },
  // 获取某个接口的详细设置
  get(params) {
    return axios.post('/api/rest/apimanage/get', params);
  },
  // 保存接口设置
  save(data) {
    return axios.post('/api/rest/apimanage/save', data);
  },
  // 删除接口
  delete(params) {
    return axios.post('/api/rest/apimanage/delete', params);
  },
  // 获取接口处理器列表
  apiHandlerList(params) {
    return axios.post('/api/rest/apimanage/apihandler/list', params);
  },
  apiUdpateList(params) {
    return axios.post('/api/rest/apimanage/needaudit/udpate', params);
  },
  getApiManageAuditDetail(params) {
    return axios.post('/api/rest/apimanage/audit/detail/get', params);
  },
  // 获取接口的使用帮助
  help(url) {
    return axios.get(`${url}`);
  },
  upload(token, params, header) {
    if (token.indexOf('{') > -1) {
      const re = /\{([^\}]+)?\}/g;
      let match;
      // eslint-disable-next-line no-cond-assign
      while ((match = re.exec(token))) {
        token = token.replace(match[0], params[match[1]]);
      }
    }
    return axios.post(token, params, { headers: header || {}, responseType: 'blob', contentType: 'multipart/form-data' });
  },
  test(token, params, header) {
    if (token.indexOf('{') > -1) {
      const re = /\{([^\}]+)?\}/g;
      let match;
      // eslint-disable-next-line no-cond-assign
      while ((match = re.exec(token))) {
        token = token.replace(match[0], params[match[1]]);
      }
    }

    if (header) {
      if (header.type == 'get') {
        let url = '';
        if (Object.keys(params).length > 0) {
          let newData = '';
          Object.keys(params).forEach((v, i) => {
            if (i == 0) {
              newData += v + '=' + params[v];
            } else {
              newData += '&' + v + '=' + params[v];
            }
          });
          url = token + '?' + newData;
        } else {
          url = token;
        }

        return axios.get(url, { headers: header });
      } else {
        return axios.post(token, params, { headers: header });
      }
    }
    return axios.post(token, params);
  },
  // 获取接口的调用记录列表
  getCallRecord(params) {
    return axios.post('/api/rest/apimanage/audit/list', params);
  },
  //认证方式列表
  authTypeList(data) {
    return axios.post('/api/rest/apimanage/authtype/list/forselect', data);
  },
  getAuthHeader(authType, authData) {
    const params = {};
    params.authType = authType;
    params.authData = authData;
    return axios.post('/api/rest/apimanage/authheader/create', params);
  }
};
export default apiManage;

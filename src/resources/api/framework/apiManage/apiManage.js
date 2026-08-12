import axios from '../../http';

function getParamValue(params, key) {
  if (!params) {
    return undefined;
  }
  if (typeof FormData !== 'undefined' && params instanceof FormData) {
    return params.get(key);
  }
  return params[key];
}

function replacePathParams(token, params) {
  if (token.indexOf('{') > -1) {
    const re = /\{([^\}]+)?\}/g;
    let match;
    // eslint-disable-next-line no-cond-assign
    while ((match = re.exec(token))) {
      token = token.replace(match[0], getParamValue(params, match[1]));
    }
  }
  return token;
}

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
  // 获取接口MCP服务说明
  getMcpHelp(params) {
    return axios.post('/api/rest/apimanage/mcp/help/get', params);
  },
  // 按MCP协议调用tool
  async mcpCall(endpoint, params) {
    const tokenResponse = await axios.get('/api/rest/user/current/token/get');
    const token = tokenResponse.Return || '';
    return axios.post(endpoint, params, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json, text/event-stream',
        'Content-Type': 'application/json',
        'MCP-Protocol-Version': '2025-11-25',
        AuthType: undefined,
        AuthValue: undefined
      }
    });
  },
  // 获取接口的使用帮助
  help(url) {
    return axios.get(`${url}`);
  },
  upload(token, params, header) {
    token = replacePathParams(token, params);
    return axios.post(token, params, { headers: header || {}, responseType: 'blob', contentType: 'multipart/form-data' });
  },
  test(token, params, header) {
    token = replacePathParams(token, params);

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

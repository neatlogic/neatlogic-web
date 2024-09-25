var _pathname = window.location.pathname;
var TENANT = _pathname.split('/')[1];
var BASEURLPREFIX = '';
var HOME = '/' + TENANT;

if (TENANT.indexOf('.') <= -1) {
  BASEURLPREFIX += '/' + TENANT;
} else {
  TENANT = '';
  HOME = '/';
}
var BASELANGUAGES = getCookie('neatlogic_language') || 'zh';
var MODULEID = '';
var MENULIST = [];
var MENUTYPE = {};
var AUTHTYPE = ''; // 授权类型
var SSOTICKETKEY = ''; // 单点登录key值
var SSOTICKETVALUE = ''; // 单点登录value值
var ISNEEDAUTH = false; //是否需要免登录认证。如果需要，则页面会在第一个接口请求走myAuth认证后，才请求后续的接口。
const COMMERCIAL_MODULES = []; //已激活的商业模块
var HTTP_RESPONSE_STATUS_CODE = ''; // http返回状态码，用于错误回显
var GLOBAL_PAGELIST = '';
var GLOBAL_TABLESTRYLE = '';
var GLOBAL_LOGINTITLE = 'welcome';
setCookie('neatlogic_language', BASELANGUAGES, 7); // 设置cookie，解决部署首次，没有默认多语言问题

function setCookie(name, value, time) {
  // 设置cookie为name的值为value，期限是time(如果是数字，单位为天；如果是字符串，直接赋值结束时间)
  if (time) {
    if (typeof time == Number) {
      let d = new Date();
      d.setTime(d.getTime() + time * 24 * 60 * 60 * 1000);
      let expires = 'expires=' + d.toGMTString();
      document.cookie = name + '=' + value + '; ' + expires + ';path=' + HOME + ';';
    } else {
      document.cookie = name + '=' + value + '; expires=' + time + ';path=' + HOME + ';';
    }
  } else {
    document.cookie = name + '=' + encodeURIComponent(value);
  }
}

function getCookie(name) {
  if (name) {
    let cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      let ci = cookies[i];
      while (ci.charAt(0) == ' ') ci = ci.substring(1);
      if (ci.indexOf(name) >= 0) {
        return ci.substring(name.length + 1, ci.length);
      }
    }
  }
}

function removeCookie(name) {
  setCookie(name, ' ', new Date(0).toUTCString());
}
function handleUrl(url, httpresponsestatuscode) {
  // 处理url是否带有参数
  if (url) {
    return url.indexOf('?') != -1 ? '&httpresponsestatuscode=' + httpresponsestatuscode : '?httpresponsestatuscode=' + httpresponsestatuscode;
  }
  return url;
}

//获取url上所有参数
function getUrlParams(url) {
  const params = {};
  const urlParts = url.split('?');
  if (urlParts.length > 1) {
    const queryString = urlParts[1];
    const pairs = queryString.split('&');
    for (const pair of pairs) {
      const keyValue = pair.split('=');
      const key = decodeURIComponent(keyValue[0]);
      const value = keyValue.length > 1 ? decodeURIComponent(keyValue[1]) : '';
      params[key] = value;
    }
  }
  return params;
}

//用于后端认证，确保同步等接口返回即认证结束才执行发起后续请求
function getDirectUrl() {
  try {
    const currentUrl = location.href;
    const hashParams = getUrlParams(currentUrl);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', BASEURLPREFIX + '/api/rest/init/config/get', false);
    //将参数设置进header，因为referer不靠谱，不支持url带#号，会导致后面的参数都取不到，所以都塞header里
    for (const key in hashParams) {
      xhr.setRequestHeader(key, hashParams[key]);
    }
    if (SSOTICKETKEY && currentUrl && currentUrl.includes(SSOTICKETKEY)) {
      SSOTICKETVALUE = hashParams[SSOTICKETKEY];
    }
    xhr.setRequestHeader('AuthType', AUTHTYPE || SSOTICKETKEY);
    xhr.setRequestHeader('AuthValue', SSOTICKETVALUE || getCookie(SSOTICKETKEY));
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const responseText = xhr.responseText;
        if (responseText) {
          // 空判断，判断字符串是否为空
          try {
            const data = JSON.parse(responseText);
            if (data.Return.commercialModuleSet && data.Return.commercialModuleSet.length > 0) {
              COMMERCIAL_MODULES.push(...data.Return.commercialModuleSet);
            }
          } catch (error) {
            console.error('JSON 解析出错:', error.message);
          }
        }
      } else if (xhr.status === 520) {
        // 520 代表后端认证失败，跳转到错误信息提示页面
        removeCookie('neatlogic_authorization');
        const responseText = JSON.parse(xhr.responseText);
        let errorTipsContent = responseText && responseText.Message;
        if (errorTipsContent) {
          window.location.href = getBaseUrl() + '/error-tips.html?error_tips_content=' + encodeURIComponent(errorTipsContent);
        }
      } else if (xhr.status === 522) {
        const responseText = JSON.parse(xhr.responseText);
        removeCookie('neatlogic_authorization');
        if (responseText.Status === 'FAILED' && responseText.DirectUrl) {
          HTTP_RESPONSE_STATUS_CODE = '522';
          const directUrl = responseText.DirectUrl.startsWith('http') ? responseText.DirectUrl : 'http://' + responseText.DirectUrl;
          window.open(directUrl, '_self');
        }
      }
    };

    xhr.send();
  } catch (error) {
    console.error('JSON解析出错', error);
  }
}

async function getSsoTokenKey() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', BASEURLPREFIX + '/tenant/check', false); // 第三个参数设置为 false 表示同步请求
  xhr.send();
  if (xhr.status === 200) {
    try {
      const responseText = JSON.parse(xhr.responseText);
      if (responseText && responseText.Status === 'OK') {
        getFaviconUrl(responseText.themeConfig);
        SSOTICKETKEY = responseText.ssoTicketKey || '';
        AUTHTYPE = responseText.authType || '';
        ISNEEDAUTH = responseText.isNeedAuth || false;
        if (responseText.commercialModuleSet && responseText.commercialModuleSet.length > 0) {
          COMMERCIAL_MODULES.push(...responseText.commercialModuleSet);
        }
        if (ISNEEDAUTH) {
          getDirectUrl();
        }
      } else if (responseText && responseText.Status !== 'OK') {
        window.location.href = '/404.html';
      }
    } catch (error) {
      console.error('configjs', error);
    }
  } else if (xhr.status === 500) {
    window.location.href = '/404.html';
  } else if (xhr.status === 550) {
    window.location.href = '/licenseIllegal.html';
  } else {
    console.error(xhr.status + ' ' + xhr.statusText);
  }
}
getSsoTokenKey();
function getBaseUrl() {
  // 获取租户域名
  const protocal = location.protocol;
  const host = location.host;
  return protocal + '//' + host;
}
function getFaviconUrl(themeConfig) {
  if (themeConfig && themeConfig.light && themeConfig.dark){
    //网站图标
    var url = '';
    var favicon = '';
    let temList = themeConfig.light;
    if (localStorage.themeClass === 'theme-dark') {
      // 默认主题模式
      temList = themeConfig.dark;
    }
    temList && temList instanceof Array && temList.forEach(v => {
      if (v.param === 'favicon') {
        if (v.value) {
          favicon = v.value;
        }
      }
    });
    if (favicon) {
      url = HOME + '/api/binary/image/download?id=' + favicon;
    } else {
      url = '/resource/img/common/tsfavicon.png';
    }
    var link = document.querySelector("link[rel*='icon']");
    link.href = url;
  }
}
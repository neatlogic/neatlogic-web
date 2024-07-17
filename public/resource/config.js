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
var MINIMUM_CHROMEBROWSERVERSION = 95; // 谷歌浏览器版本号
var MINIMUM_FIREFOXBROWSERVERSION = 0; // 火狐浏览器版本号

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
        SSOTICKETKEY = responseText.ssoTicketKey || '';
        AUTHTYPE = responseText.authType || '';
        ISNEEDAUTH = responseText.isNeedAuth || false;
        MINIMUM_CHROMEBROWSERVERSION = (responseText.minimumChromeBrowserVersion ? Number(responseText.minimumChromeBrowserVersion) : 95) || 95;
        MINIMUM_FIREFOXBROWSERVERSION = (responseText.minimumFirefoxBrowserVersion ? Number(responseText.minimumFirefoxBrowserVersion) : 0) || 0;
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
  } else {
    console.error(xhr.status + ' ' + xhr.statusText);
  }
}
getSsoTokenKey();
function getBrowserVersion() {
  // 判断是否是Chrome浏览器，且版本号大于等于95
  const userAgent = navigator.userAgent;
  // 检查是否包含Chrome标识
  if (userAgent.includes('Chrome')) {
    // 使用正则表达式匹配Chrome版本号
    const chromeVersionMatch = userAgent.match(/Chrome\/(\S+)/);
    if (chromeVersionMatch && chromeVersionMatch.length > 1) {
      // 提取版本号
      const chromeVersion = chromeVersionMatch[1];
      const versionParts = chromeVersion.split('.').map(Number);
      const majorVersion = versionParts[0];
      if (majorVersion >= MINIMUM_CHROMEBROWSERVERSION) {
        return true;
      }
    }
  } else if (userAgent.includes('Firefox')) {
    // 使用正则表达式匹配Firefox版本号
    const firefoxVersionMatch = userAgent.match(/Firefox\/(\d+)/);
    if (firefoxVersionMatch && firefoxVersionMatch.length > 1) {
      const firefoxVersion = parseInt(firefoxVersionMatch[1], 10);
      if (firefoxVersion >= MINIMUM_FIREFOXBROWSERVERSION) {
        return true;
      }
    }
  }
  return false;
}
function getProtocalIpPortDomain(isNeedTenantName = true) {
  // 获取ip协议端口域名，例如：http://127.0.0.1:8080/develop
  var urlParts = location.href.split('//'); // 拿到协议
  if (urlParts.length > 1) {
    var prefixUrl = urlParts[1].split('/'); // 获取域名
    var fullUrl = urlParts[0] + '//' + prefixUrl[0];
    if (isNeedTenantName) {
      fullUrl = fullUrl + '/' + prefixUrl[1];
    }
    return fullUrl + '/brower-version-tips.html?version=' + (MINIMUM_FIREFOXBROWSERVERSION > 0 ? MINIMUM_FIREFOXBROWSERVERSION : MINIMUM_CHROMEBROWSERVERSION);
  }
  return location.href;
}

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

var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
var isIE = userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1; //判断是否IE<11浏览器
if (isIE) {
  var reIE = new RegExp('MSIE (\\d+\\.\\d+);');
  reIE.test(userAgent);
  var fIEVersion = parseFloat(RegExp['$1']);
  if (fIEVersion * 1 < 10) {
    window.location.href = '/iealert.html';
  }
}

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
function getDirectUrl() {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', BASEURLPREFIX + '/api/rest/init/config/get', false);

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
  const currentUrl = location.href;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', BASEURLPREFIX + '/tenant/check', false); // 第三个参数设置为 false 表示同步请求
  xhr.send();

  if (xhr.status === 200) {
    try {
      var responseText = JSON.parse(xhr.responseText);
      if (responseText && responseText.Status === 'OK') {
        SSOTICKETKEY = responseText.ssoTicketKey || '';
        AUTHTYPE = responseText.authType || '';
        ISNEEDAUTH = responseText.isNeedAuth || false;
        if (SSOTICKETKEY && currentUrl && currentUrl.includes(SSOTICKETKEY)) {
          const queryString = currentUrl.split(SSOTICKETKEY + '=')[1];
          if (queryString) {
            SSOTICKETVALUE = queryString.split('&')[0];
          }
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

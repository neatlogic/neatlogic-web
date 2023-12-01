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
var SSOTICKETKEY = ''; // 单点登录key值
var SSOTICKETVALUE = ''; // 单点登录value值
const COMMERCIAL_MODULES = []; //已激活的商业模块

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

function getDirectUrl() {
  // 获取页面重定向地址
  fetch(BASEURLPREFIX + '/api/rest/init/config/get', {
    headers: {
      AuthType: SSOTICKETKEY,
      AuthValue: SSOTICKETVALUE || getCookie(SSOTICKETKEY)
    }
  })
    .then(response => {
      if (response.status === 522) {
        return response.json().then(responseText => {
          removeCookie('neatlogic_authorization');
          if (responseText.Status === 'FAILED' && responseText.DirectUrl) {
            const directUrl = responseText.DirectUrl.startsWith('http') ? responseText.DirectUrl : 'http://' + responseText.DirectUrl;
            window.open(directUrl, '_self');
          }
        });
      } else if (response.status === 200) {
        return response.json().then(data => {
          if (data.Return.commercialModuleSet && data.Return.commercialModuleSet.length > 0) {
            COMMERCIAL_MODULES.push(...data.Return.commercialModuleSet);
          }
        });
      }
    })
    .catch(error => {
      console.error(error);
    });
}
function getSsoTokenKey() {
  // 获取ssoTokenKey
  const currentUrl = location.href;
  fetch(BASEURLPREFIX + '/tenant/check')
    .then(response => {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 500) {
        window.location.href = '/404.html';
      }
    })
    .then(responseText => {
      if (responseText && responseText.Status === 'OK' && responseText.ssoTicketKey) {
        SSOTICKETKEY = responseText.ssoTicketKey || '';
        if (SSOTICKETKEY && currentUrl && currentUrl.includes(SSOTICKETKEY)) {
          const queryString = currentUrl.split(SSOTICKETKEY + '=')[1];
          if (queryString) {
            SSOTICKETVALUE = queryString.split('&')[0];
          }
        }
      } else if (responseText && responseText.Status !== 'OK') {
        window.location.href = '/404.html';
      }
    })
    .catch(error => {
      console.error(error);
    });
}
getSsoTokenKey();
getDirectUrl();

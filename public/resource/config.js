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
var BASELANGUAGES = 'zh';
var MODULEID = '';
var MENULIST = [];
var MENUTYPE = {};
var SSOTICKETKEY = ''; // 单点登录key值
var SSOTICKETVALUE = ''; // 单点登录value值

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

function getDirectUrl() {
  // 获取页面重定向地址
  var xhr = new XMLHttpRequest();
  xhr.open('GET', BASEURLPREFIX + '/api/rest/init/config/get', false);
  if(SSOTICKETKEY && SSOTICKETVALUE) {
    xhr.setRequestHeader('AuthType', SSOTICKETKEY);
    xhr.setRequestHeader('AuthValue', SSOTICKETVALUE);
  }
  xhr.send();
  if(xhr.readyState == 4) {
    if(xhr.status == 522){
      var responseText = xhr.responseText ? JSON.parse(xhr.responseText) : '';
      if(responseText && responseText.Status == 'FAILED' && responseText.DirectUrl) {
        if(responseText.DirectUrl.indexOf('http://') == -1 || responseText.DirectUrl.indexOf('https://') == -1) {
          window.open('http://' + responseText.DirectUrl,'_self');
        } else {
          window.open(responseText.DirectUrl,'_self');
        }
      }
    }
  }
}
function getSsoTokenKey() {
  // 获取ssoTokenKey
  var currentUrl = location.href;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', BASEURLPREFIX + '/tenant/check', false);
  xhr.send();
  if(xhr.readyState == 4) {
    if(xhr.status == 200){
      var responseText = xhr.responseText ? JSON.parse(xhr.responseText) : '';
      if(responseText && responseText.Status == 'OK' && responseText.ssoTicketKey) {
        SSOTICKETKEY = responseText.ssoTicketKey;
        if(SSOTICKETKEY && currentUrl && currentUrl.split(SSOTICKETKEY + '=')) {
          var token = currentUrl.split(SSOTICKETKEY + '=')[1];
          if (token) {
            SSOTICKETVALUE = token.split('&')[0]; //post请求头
          }
        }
      } else if(responseText && responseText.Status != 'OK') {
        window.location.href = '/404.html';
      }
    } else if(xhr.status == 500) {
      window.location.href = '/404.html';
    }
  }
}
getSsoTokenKey();
getDirectUrl();

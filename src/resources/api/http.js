import Vue from 'vue';
import axios from 'axios';
import ViewUI from 'neatlogic-ui/iview/index.js';
import utils from '@/resources/assets/js/util';
import { $t } from '@/resources/init.js';

Vue.prototype.$axios = axios;
const tip = (msg, onClose, name, title, type = 'error') => {
  let config = {
    title: title || '接口异常',
    desc: msg
  };
  onClose &&
    Object.assign(config, {
      onClose: onClose
    });
  name &&
    Object.assign(config, {
      name: name + new Date().getTime()
    });
  ViewUI.Notice[type](config);
};

const preLang = (text, value) => {
  //在json里面对语言进行预处理，主要是为了处理接口返回过来的文案，有些文案不需要转换
  let arr = typeof text == 'string' ? text.split('.') : [];
  let text1 = $t(text, value);
  if (!(arr.length < 1 || text1 == text)) {
    text = text1;
  }
  return text;
};

var instance = Vue.prototype.$axios.create({
  //创建axios实例
  //timeout: 1000 * 20,
  //headers: {'Authorization': utils.getCookie('neatlogic_authorization') ? utils.getCookie('neatlogic_authorization') : ''}
});
instance.defaults.headers.post['Content-Type'] = 'application/json'; //post请求头
instance.defaults.baseURL = BASEURLPREFIX; //默认接口前缀
instance.CancelToken = axios.CancelToken;

if ((AUTHTYPE || SSOTICKETKEY) && SSOTICKETVALUE) {
  instance.defaults.headers.post['AuthType'] = AUTHTYPE || SSOTICKETKEY; //post请求头
  instance.defaults.headers.post['AuthValue'] = SSOTICKETVALUE; //post请求头
}

//sessionStorage.setItem('neatlogic_authorization'
/**
 * 跳转登录页
 * 携带当前页面路由，以期在登录页面完成登录后返回当前页面
 */
const toLogin = (url, status) => {
  let splitParam = '';
  let queryParam = '';
  if (status) {
    splitParam = `&httpresponsestatuscode=${status}`;
    queryParam = `?httpresponsestatuscode=${status}`;
  }
  if (url) {
    window.location.href = handleUrl(url, splitParam, queryParam);
  } else {
    try {
      let path = Vue.prototype.$tsrouter.currentRoute.fullPath == '/' ? window.location.href.split(MODULEID + '.html#')[1] : Vue.prototype.$tsrouter.currentRoute.fullPath;
      window.location.href = HOME + '/login.html#?tenant=' + TENANT + splitParam + '&redirect=' + MODULEID + '.html#' + path;
    } catch (e) {
      console.log(e);
      window.location.href = HOME + '/login.html#?tenant=' + TENANT + splitParam;
    }
  }
};
const handleUrl = (url, splitParam, queryParam) => {
  // 处理url后面带？还有不带？的情况
  if (splitParam && url) {
    return `${url}${url.includes('?') ? splitParam : queryParam}`;
  }
  return url;
};
//调用接口
instance.interceptors.request.use(config => {
  //每次调用接口时把cookie更新为当前环境的时区，按照+8:00的格式
  const offset = new Date().getTimezoneOffset();
  let f = '';
  f += offset <= 0 ? '+' : '-';
  const h = Math.floor(Math.abs(offset) / 60);
  const m = Math.abs(offset) - h * 60;
  const timezone = f + h + ':' + (m >= 10 ? m : '0' + m);
  utils.removeCookie('neatlogic_timezone');
  utils.setCookie('neatlogic_timezone', timezone);
  // neatlogic_timezone
  if (config.method === 'post' && config.contentType != 'multipart/form-data') {
    config.data = JSON.stringify(config.data || {});
  }
  return config;
});

//返回数据
instance.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    // const token = utils.getCookie('neatlogic_authorization');
    // if (!token || token == null) {
    //   toLogin();
    // }
    let res = response.request.responseType ? response : response.data;
    return Promise.resolve(res);
  },
  error => {
    if (error && error.response) {
      if (error.response.config && error.response.config.headers.unConsole) {
        //请求时多携带{unConsole: 1}默认为异常不需要用通用类的异常抛出
        //console.log(error.response.data.Message || error.response.data);
      } else if (error.response.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          const data = JSON.parse(reader.result);
          errorHandle({ ...error.response, data });
        };
        reader.readAsText(error.response.data, 'utf-8');
      } else {
        errorHandle(error.response);
      }
      return Promise.reject(error);
    } else if (!error) {
      if (!window.navigator.onLine) {
        tip('网络连接失败');
      } else {
        return Promise.reject(error);
      }
    }
  }
);
/**
 * 请求失败后的错误统一处理
 */
const errorHandle = res => {
  let status = res.status;
  let other = preLang(res.data.Message, res.data.Param);
  let rejectSource = '';
  if (res.data.Return) {
    if (res.data.Return.rejectSource == 'tenant') {
      rejectSource = '系统繁忙，租户接口访问量限制为每秒' + res.data.Return.tenantRate + '次';
    } else if (res.data.Return.rejectSource == 'api') {
      rejectSource = '系统繁忙，当前接口访问量限制为每秒' + res.data.Return.apiRate + '次';
    }
  }
  // 状态码判断
  switch (status) {
    case 401:
      toLogin();
      break;
    case 403:
      tip($t('message.sessionexpired'), () => {
        Vue.prototype.$utils.removeCookie('neatlogic_authorization');
        toLogin();
      });
      break;
    case 404:
      console.log($t('message.urlnotfound', { target: res.config.url }));
      break;
    case 429:
      // 接口设置访问次数限制
      tip(rejectSource, null, res.config.url, '提示', 'info');
      throw rejectSource;
    case 500:
      //未知的接口问题
      tip('服务器错误');
      throw res.data.Message; //把后端返回的错误信息抛出到页面中，这样页面可以catch这些错误做一些处理
    case 502:
      //已知的接口问题
      //后端没有主动设置该状态码，可能是Bad Gateway/错误的网关
      window.location.href = '/500.html';
      // 跳到服务器错误页面
      break;
    case 521:
      //租户问题，需要跳出系统重新输入租户
      Vue.prototype.$utils.removeCookie('neatlogic_authorization');
      window.location.href = '/404.html';
      break;
    case 522:
      // 认证类型失败
      Vue.prototype.$utils.removeCookie('neatlogic_authorization');
      toLogin(res.data && res.data.directUrl ? res.data.directUrl : null, status);
      break;
    case 523: // 没有资源权限
    case 526: // 对象不存在
      //用户权限不足，跳回每一个路由的404页面提示无访问权限
      Vue.prototype.$tsrouter.replace({
        path: '/no-authority',
        query: {
          des: res.data && res.data.Message ? res.data.Message : $t('message.noauth')
        }
      });
      break;
    case 520: // 运行已知错误
    case 524: // 重复提交表单
    case 525: // 认证类型不存在
    case 550: // license 认证失败
      tip(other, null, res.config.url, '提示', 'info');
      throw res;
    case 527:
      //会话已超时或已被终止,重新登录
      Vue.prototype.$utils.removeCookie('neatlogic_authorization');
      toLogin(res.data && res.data.directUrl ? res.data.directUrl : null);
      break;
    case 530:
      //接口参数不符合规范
      throw res.data.Message; //把后端返回的校验信息抛出到页面中
    default:
      console.error($t('message.urlnotfound', { target: res.config.url }) + '，原因：' + (res.data.Message ? res.data.Message : res.data));
  }
};
Vue.prototype.$https = instance;
export default instance;

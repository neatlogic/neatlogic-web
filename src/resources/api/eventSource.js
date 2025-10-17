import { EventSourcePolyfill } from 'event-source-polyfill';

const creatEventSourcePolyfill = (url, params) => {
  let queryString = '';
  if (params) {
    queryString = '?' + Object.keys(params).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key])).join('&');
  }
  const href = BASEURLPREFIX + url + queryString;
  console.log(href);
  const es = new EventSourcePolyfill(href, {
    heartbeatTimeout: 300000, //设置重连时间
    headers: {
      'source': 'pc',
      'Content-Type': 'text/event-stream'
    }
  });
  es.onopen = () => {
    console.log('连接成功');
  };
  es.onerror = (err) => {
    console.log('连接错误', err);
  };
  return es;
};

export default creatEventSourcePolyfill;


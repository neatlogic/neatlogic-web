import utils from '@/resources/assets/js/util';


let timer = null;
// 是否有用户新行为
let dirty = true;

// 需要保持引用，避免 removeEventListener 失效
let throttledHandler = null;

/**
 * 用户活跃标记
 */
function markUserActive() {
  dirty = true;
}

/**
 * 初始化用户行为监听
 */
const ACTIVE_EVENTS = [
  'mousedown',
  'wheel',
  'scroll'
];
const ACTIVE_EVENT_OPTIONS = { passive:true, capture:true };

function initActiveListener() {
  if (throttledHandler) return; // 避免重复注册

  throttledHandler = utils.throttle(markUserActive, 5000);

  ACTIVE_EVENTS.forEach(evt => {
     window.addEventListener(evt, throttledHandler, ACTIVE_EVENT_OPTIONS);
  });

  // 页面加载 & 激活 都算活跃
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) markUserActive();
  });

  markUserActive();
}

function removeActiveListener() {
  if (!throttledHandler) return;

  ACTIVE_EVENTS.forEach(evt => {
    window.removeEventListener(evt, throttledHandler, ACTIVE_EVENT_OPTIONS);
  });

  throttledHandler = null;
}

/**
 * 发送心跳
 */
function sendHeartbeat() {
  const tokenHash = sessionStorage.getItem('neatlogic_tokenHash');
  if (!tokenHash) {
    console.error('tokenHash不存在');
    return;
  };
  const xhr = new XMLHttpRequest();
  xhr.open('POST', BASEURLPREFIX + '/api/rest/heartbeat', true);
  xhr.setRequestHeader('Content-Type','application/json');
  xhr.send(JSON.stringify({
    tokenHash: tokenHash
  }));
}

/**
 * 启动心跳（登录后调用）
 */
function start(heartbeatInterval) {
  if (timer) return;
  initActiveListener();

  timer = utils.setInterval(() => {
    const now = Date.now();
    if (document.hidden) return; // 后台不续期
    if (dirty) {
      sendHeartbeat();
      dirty = false;
    }
  }, heartbeatInterval);
}

/**
 * 停止心跳（退出登录）
 */
function stop() {
  clearInterval(timer);
  timer = null;
  dirty = false;
  removeActiveListener();
}

export default {
  start,
  stop,
  markUserActive
};

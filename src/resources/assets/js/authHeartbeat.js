import utils from '@/resources/assets/js/util';

const HEARTBEAT_INTERVAL = 60 * 1000; // 60s

let lastActiveAt = Date.now();
let timer = null;
let idleTimeout = 0;

/**
 * 用户活跃标记
 */
function markUserActive() {
  lastActiveAt = Date.now();
}

/**
 * 初始化用户行为监听
 */
function initActiveListener() {
  ['mousedown', 'wheel', 'touchstart', 'keydown'].forEach(evt => {
    window.addEventListener(
      evt,
      utils.throttle(markUserActive, 5000),
      { passive: true }
    );
  });

  // 页面加载视为一次活跃
  markUserActive();
}

/**
 * 发送心跳
 */
function sendHeartbeat() {
  const tokenHash = sessionStorage.getItem('neatlogic_tokenHash');
  if (!tokenHash) return;
  const xhr = new XMLHttpRequest();
  xhr.open('POST', BASEURLPREFIX + '/api/rest/heartbeat', true);
  xhr.send(JSON.stringify({
    tokenHash: tokenHash
  }));
}

/**
 * 启动心跳（登录后调用）
 */
function start(timeout) {
  if (timer) return;

  idleTimeout = timeout;
  initActiveListener();

  timer = utils.setInterval(() => {
    const now = Date.now();
    if (now - lastActiveAt < idleTimeout) {
      sendHeartbeat();
    }
  }, HEARTBEAT_INTERVAL);
}

/**
 * 停止心跳（退出登录）
 */
function stop() {
  clearInterval(timer);
  timer = null;
  idleTimeout = 0;
}

export default {
  start,
  stop,
  markUserActive
};

import utils from '@/resources/assets/js/util';

let timer = null;
let warningTimer = null;
let countdownTimer = null;
// 是否有用户新行为
let dirty = true;
// 按服务端返回时间换算出的本机绝对截止时间，避免逐秒递减产生累计误差。
let sessionExpireAt = null;
let titleBeforeCountdown = '';
let countdownTitle = null;
let storageHandler = null;
let countdownVisibilityHandler = null;

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
const ACTIVE_EVENT_OPTIONS = { passive: true, capture: true };
// 仅在会话退出前最后 5 分钟展示标题提醒。
const WARNING_TIME = 5 * 60 * 1000;
const COUNTDOWN_INTERVAL = 1000;

function getSessionExpireStorageKey() {
  // 只按租户隔离同步数据，不存储 token、Cookie 等认证信息。
  return `neatlogic_session_expire_${typeof TENANT === 'undefined' ? '' : TENANT}`;
}

function restoreTitle() {
  if (countdownTitle !== null && document.title === countdownTitle) {
    document.title = titleBeforeCountdown;
  }
  countdownTitle = null;
  titleBeforeCountdown = '';
}

function clearCountdownTimer() {
  if (warningTimer) {
    clearTimeout(warningTimer);
    warningTimer = null;
  }
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

function formatCountdown(remainingTime) {
  // 向上取整，避免仍有不足一秒时提前显示 00:00。
  const totalSeconds = Math.max(0, Math.ceil(remainingTime / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function updateCountdownTitle() {
  if (!sessionExpireAt) return;
  // 每次根据绝对截止时间重新计算；定时器延迟时允许跳秒，以保证时间准确。
  const remainingTime = sessionExpireAt - Date.now();
  if (remainingTime <= 0) {
    clearCountdownTimer();
    restoreTitle();
    return;
  }
  if (remainingTime > WARNING_TIME) {
    scheduleCountdown();
    return;
  }
  if (countdownTitle === null) {
    titleBeforeCountdown = document.title;
  } else if (document.title !== countdownTitle) {
    // 倒计时期间业务页面更新了标题，保留最新业务标题。
    titleBeforeCountdown = document.title;
  }
  const countdown = formatCountdown(remainingTime);
  const tip = typeof BASELANGUAGES !== 'undefined' && BASELANGUAGES === 'en'
    ? `Sign out in ${countdown}`
    : `${countdown} 后退出`;
  countdownTitle = `${tip} | ${titleBeforeCountdown}`;
  document.title = countdownTitle;
}

function scheduleCountdown() {
  clearCountdownTimer();
  if (!sessionExpireAt) return;
  const remainingTime = sessionExpireAt - Date.now();
  if (remainingTime <= 0) {
    restoreTitle();
  } else if (remainingTime <= WARNING_TIME) {
    updateCountdownTitle();
    countdownTimer = setInterval(updateCountdownTitle, COUNTDOWN_INTERVAL);
  } else {
    restoreTitle();
    // 五分钟之前不做每秒轮询，仅预约进入提醒窗口的时间点。
    warningTimer = setTimeout(scheduleCountdown, remainingTime - WARNING_TIME);
  }
}

function updateSessionExpireAt(expireAt, isSync = false) {
  if (!Number.isFinite(expireAt) || expireAt <= Date.now()) return;
  sessionExpireAt = expireAt;
  scheduleCountdown();
  if (isSync) {
    try {
      localStorage.setItem(getSessionExpireStorageKey(), JSON.stringify({ expireAt }));
    } catch (e) {
      // localStorage 不可用时只影响多 Tab 同步，不影响当前 Tab 提醒。
    }
  }
}

function handleHeartbeatResponse(xhr) {
  if (xhr.status < 200 || xhr.status >= 300 || !xhr.responseText) return;
  try {
    const response = JSON.parse(xhr.responseText);
    const data = response && response.Return;
    const serverTime = Number(data && data.serverTime);
    const expireTime = Number(data && data.expireTime);
    // 先计算服务端剩余时长，再换算成本机截止时间，规避客户端时钟不准。
    const remainingTime = expireTime - serverTime;
    if (Number.isFinite(remainingTime) && remainingTime > 0) {
      updateSessionExpireAt(Date.now() + remainingTime, true);
    }
  } catch (e) {
    // 兼容未返回会话时间的旧后端，继续保留原心跳能力。
  }
}

function initCountdownListener() {
  if (!storageHandler) {
    // 同租户其他 Tab 心跳成功后，只同步新的截止时间。
    storageHandler = event => {
      if (event.key !== getSessionExpireStorageKey() || !event.newValue) return;
      try {
        const data = JSON.parse(event.newValue);
        updateSessionExpireAt(Number(data && data.expireAt));
      } catch (e) {
        // 忽略无效的同步数据。
      }
    };
    window.addEventListener('storage', storageHandler);
  }
  if (!countdownVisibilityHandler) {
    // 后台定时器可能被浏览器节流，恢复可见时立即按绝对时间校准。
    countdownVisibilityHandler = () => {
      if (!document.hidden) scheduleCountdown();
    };
    document.addEventListener('visibilitychange', countdownVisibilityHandler);
  }
}

function removeCountdownListener() {
  if (storageHandler) {
    window.removeEventListener('storage', storageHandler);
    storageHandler = null;
  }
  if (countdownVisibilityHandler) {
    document.removeEventListener('visibilitychange', countdownVisibilityHandler);
    countdownVisibilityHandler = null;
  }
}

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
function sendHeartbeat(tokenHash) {
  if (!tokenHash) {
    console.error('tokenHash不存在');
    return;
  }
  const xhr = new XMLHttpRequest();
  xhr.open('POST', BASEURLPREFIX + '/api/rest/heartbeat', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = () => handleHeartbeatResponse(xhr);
  xhr.send(JSON.stringify({
    tokenHash: tokenHash
  }));
}

/**
 * 启动心跳（登录后调用）
 */
function start(tokenHash) {
  if (timer) return;
  initActiveListener();
  initCountdownListener();
  timer = utils.setInterval(() => {
    if (document.hidden) return; // 后台不续期
    if (dirty) {
      sendHeartbeat(tokenHash);
      dirty = false;
    }
  }, 60000);
}

/**
 * 停止心跳（退出登录）
 */
function stop() {
  // utils.setInterval 返回可清理对象，不能使用原生 clearInterval。
  if (timer) timer.clear();
  timer = null;
  dirty = false;
  removeActiveListener();
  removeCountdownListener();
  clearCountdownTimer();
  restoreTitle();
  sessionExpireAt = null;
}

export default {
  start,
  stop,
  markUserActive
};

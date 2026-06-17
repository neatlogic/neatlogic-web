const FEATURE_USAGE_AUDIT_URL = '/api/rest/feature/usage/audit/save';

// 当前正在统计的功能访问记录；路由切换或页面隐藏时会结算并清空。
let currentFeatureUsage = null;
// 翻译函数由 init.js 注入，避免本文件反向依赖 init.js。
let translate = value => value;

// 仅统计真实业务页面，排除无权限页和强制重置密码页等非功能页面。
function isFeatureUsageTrackable(route) {
  if (!route || !route.path || !MODULEID) {
    return false;
  }
  return route.path !== '/no-authority' && !route.path.startsWith('/reset-password');
}

// 模块名称优先取当前用户有权限的模块配置，取不到时用全局 MODULEID 兜底。
function getModuleName(store) {
  const currentModule = store && store.getters && store.getters.currentModule;
  return (currentModule && currentModule.moduleName) || MODULEID;
}

// 功能名称优先使用路由 title，动态路由没有 title 时退回 name/path。
function getFeatureMenuName(route) {
  const title = route && route.meta && route.meta.title;
  if (title) {
    return translate(title) || title;
  }
  return (route && (route.name || route.path)) || '';
}

// 创建一次功能访问的起始快照，结束时间和停留时长在 flush 时计算。
function buildFeatureUsage(route, store) {
  const now = Date.now();
  return {
    moduleId: MODULEID,
    moduleName: getModuleName(store),
    menuPath: route.path,
    menuName: getFeatureMenuName(route),
    url: route.fullPath || route.path,
    startTime: now
  };
}

// 页面关闭阶段普通异步请求不可靠，优先使用 sendBeacon，SSO 场景则用同步 XHR 带认证头兜底。
function sendFeatureUsageByBeacon(payload) {
  const url = BASEURLPREFIX + FEATURE_USAGE_AUDIT_URL;
  const data = JSON.stringify(payload);
  if (!(AUTHTYPE || SSOTICKETKEY) && navigator && navigator.sendBeacon) {
    const blob = new Blob([data], { type: 'application/json' });
    return navigator.sendBeacon(url, blob);
  }
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, false);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('source', 'pc');
  if ((AUTHTYPE || SSOTICKETKEY) && SSOTICKETVALUE) {
    xhr.setRequestHeader('AuthType', AUTHTYPE || SSOTICKETKEY);
    xhr.setRequestHeader('AuthValue', SSOTICKETVALUE);
  }
  xhr.send(data);
  return true;
}

// 正常路由切换走 axios，关闭页面等立即结算场景走 beacon/XHR；失败静默，不影响用户操作。
function submitFeatureUsage(payload, immediate = false) {
  if (immediate) {
    try {
      sendFeatureUsageByBeacon(payload);
    } catch (e) {
      // 审计上报失败不阻断页面关闭或跳转。
    }
    return;
  }
  import('@/resources/api/common').then(({ default: commonApi }) => {
    commonApi.saveFeatureUsageAudit(payload).catch(() => {});
  }).catch(() => {});
}

// 结算当前功能的停留时长，并提交给后端保存。
export function flushFeatureUsage(immediate = false) {
  if (!currentFeatureUsage) {
    return;
  }
  const usage = currentFeatureUsage;
  currentFeatureUsage = null;
  const endTime = Date.now();
  const duration = endTime - usage.startTime;
  if (duration <= 0) {
    return;
  }
  submitFeatureUsage({
    ...usage,
    endTime,
    duration
  }, immediate);
}

// 进入可统计路由时开始计时；浏览器后台状态下不重新开始，避免重复记录。
export function startFeatureUsage(route, store) {
  if (!isFeatureUsageTrackable(route) || document.hidden) {
    return;
  }
  currentFeatureUsage = buildFeatureUsage(route, store);
}

// 注册全局页面生命周期监听：隐藏时结算，恢复可见时从当前路由重新开始，关闭前尽量补报。
export function initFeatureUsageAudit(router, store, translateFn) {
  translate = translateFn || translate;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      flushFeatureUsage();
    } else {
      startFeatureUsage(router.currentRoute, store);
    }
  });
  window.addEventListener('beforeunload', () => {
    flushFeatureUsage(true);
  });
}

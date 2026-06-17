const FEATURE_USAGE_AUDIT_URL = '/api/rest/feature/usage/audit/save';

let currentFeatureUsage = null;
let translate = value => value;

function isFeatureUsageTrackable(route) {
  if (!route || !route.path || !MODULEID) {
    return false;
  }
  return route.path !== '/no-authority' && !route.path.startsWith('/reset-password');
}

function getModuleName(store) {
  const currentModule = store && store.getters && store.getters.currentModule;
  return (currentModule && currentModule.moduleName) || MODULEID;
}

function getFeatureMenuName(route) {
  const title = route && route.meta && route.meta.title;
  if (title) {
    return translate(title) || title;
  }
  return (route && (route.name || route.path)) || '';
}

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

function submitFeatureUsage(payload, immediate = false) {
  if (immediate) {
    try {
      sendFeatureUsageByBeacon(payload);
    } catch (e) {
      // ignore audit failures
    }
    return;
  }
  import('@/resources/api/common').then(({ default: commonApi }) => {
    commonApi.saveFeatureUsageAudit(payload).catch(() => {});
  }).catch(() => {});
}

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

export function startFeatureUsage(route, store) {
  if (!isFeatureUsageTrackable(route) || document.hidden) {
    return;
  }
  currentFeatureUsage = buildFeatureUsage(route, store);
}

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

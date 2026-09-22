const listeners = new Set();

// 商业请求失败时通知当前容器复查能力，避免依赖翻译后的错误文本。
export function notifyEventRequestFailure() { listeners.forEach(listener => listener()); }

// 容器销毁时解除订阅，避免旧应用响应影响后续页面。
export function subscribeEventRequestFailure(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

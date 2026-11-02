/**
 * 应用模块请求队列：跨翻页和刷新共用并发上限，失效后的旧响应不写入会话缓存。
 */
export function createModuleLoader(request, limit = 4) {
  const cache = new Map();
  const versions = new Map();
  const queue = [];
  let active = 0;
  let epoch = 0;
  let disposed = false;

  function version(id) {
    return `${epoch}:${versions.get(id) || 0}`;
  }

  function pump() {
    if (disposed) {
      return;
    }
    while (active < limit && queue.length) {
      const task = queue.shift();
      if (!task.isCurrent() || task.version !== version(task.id)) {
        task.resolve(undefined);
        continue;
      }
      active++;
      Promise.resolve().then(() => request(task.id)).then(result => {
        if (!disposed && task.version === version(task.id)) {
          cache.set(task.id, result);
        }
        task.resolve(result);
      }, task.reject).finally(() => {
        active--;
        pump();
      });
    }
  }

  return {
    /** 缓存只保存成功结果；已离开页面的排队请求不再发送。 */
    load(id, isCurrent) {
      if (disposed) {
        return Promise.resolve(undefined);
      }
      if (cache.has(id)) {
        return Promise.resolve(cache.get(id));
      }
      return new Promise((resolve, reject) => {
        queue.push({ id, isCurrent, resolve, reject, version: version(id) });
        pump();
      });
    },
    /** 变更应用或模块后显式失效，不允许在途旧请求重新填充缓存。 */
    invalidate(id) {
      versions.set(id, (versions.get(id) || 0) + 1);
      cache.delete(id);
    },
    clear() {
      epoch++;
      cache.clear();
    },
    dispose() {
      disposed = true;
      queue.splice(0).forEach(task => task.resolve(undefined));
      cache.clear();
    }
  };
}

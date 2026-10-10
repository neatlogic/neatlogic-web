// 使用完整调用路径归组，忽略源码行号但保留 native 标记及线程状态。
export function stackSignature(thread) {
  return JSON.stringify((thread.stackTrace || []).map(frame => [frame.className, frame.methodName, !!frame.nativeMethod]));
}

// 聚合相同状态和堆栈的线程，保留代表堆栈供页面展示。
export function buildStackGroups(snapshot) {
  const groups = new Map();
  (snapshot?.threads || []).forEach(thread => {
    const id = JSON.stringify([thread.state, stackSignature(thread)]);
    if (!groups.has(id)) {
      groups.set(id, { id, state: thread.state, count: 0, threadIds: [], stackTrace: thread.stackTrace || [], firstBusinessFrame: thread.firstBusinessFrame, waitType: thread.waitType });
    }
    const group = groups.get(id);
    group.threadIds.push(thread.id);
    group.count++;
  });
  return [...groups.values()].sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
}

// 锁关系保留完整快照中的持有者，租户筛选不裁剪诊断上下文。
export function buildLockGroups(snapshot) {
  const threads = snapshot?.threads || [];
  const byId = new Map(threads.map(thread => [thread.id, thread]));
  const groups = new Map();
  threads.forEach(thread => {
    if (!['BLOCKED', 'WAITING', 'TIMED_WAITING'].includes(thread.state) || !thread.lockName || !thread.lockOwnerId) return;
    const id = JSON.stringify([thread.lockOwnerId, thread.lockName]);
    if (!groups.has(id)) {
      groups.set(id, { id, ownerId: thread.lockOwnerId, ownerName: thread.lockOwnerName, lockName: thread.lockName, threadIds: [], count: 0, owner: byId.get(thread.lockOwnerId) || null });
    }
    const group = groups.get(id);
    group.threadIds.push(thread.id);
    group.count++;
  });
  return [...groups.values()].sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
}

// ID、名称及线程属性一致时才比较；已退出后重新出现的记录不跨越缺失样本关联。
function sameThread(a, b) {
  return a.id === b.id && a.name === b.name && a.daemon === b.daemon && a.priority === b.priority;
}

// 每次连续采样只在同一 JVM 的单调时间线上比较，累计 CPU 时间不作为使用率。
export function compareSnapshots(samples = []) {
  const result = { compatible: true, reason: null, intervals: [], cpuMetrics: [], persistentBlocked: [], queueTrend: [] };
  if (!samples.length) return result;
  const first = samples[0];
  if (samples.some(sample => !sample.processInstanceId || sample.processInstanceId !== first.processInstanceId || sample.serverId !== first.serverId)) {
    return { ...result, compatible: false, reason: 'processChanged' };
  }
  if (samples.some((sample, index) => index > 0 && (!Number.isFinite(sample.monotonicTimeMs) || !Number.isFinite(samples[index - 1].monotonicTimeMs) || sample.monotonicTimeMs <= samples[index - 1].monotonicTimeMs))) {
    return { ...result, compatible: false, reason: 'invalidTime' };
  }
  result.queueTrend = samples.map(sample => ({ snapshotId: sample.snapshotId, capturedAt: sample.capturedAt, queueSize: sample.threadPool?.mainQueueSize ?? 0, activeCount: sample.threadPool?.mainActiveCount ?? 0, maxThreadCount: sample.threadPool?.maxThreadCount ?? 0 }));
  for (let index = 1; index < samples.length; index++) {
    const previous = samples[index - 1];
    const current = samples[index];
    const before = new Map((previous.threads || []).map(thread => [thread.id, thread]));
    const after = new Map((current.threads || []).map(thread => [thread.id, thread]));
    const elapsedMs = current.monotonicTimeMs - previous.monotonicTimeMs;
    const interval = { fromSnapshotId: previous.snapshotId, toSnapshotId: current.snapshotId, elapsedMs, added: [], exited: [], changes: [], cpuMetrics: [] };
    after.forEach(thread => {
      const old = before.get(thread.id);
      if (!old || !sameThread(old, thread)) {
        interval.added.push(thread);
        return;
      }
      const stateChanged = old.state !== thread.state;
      const stackChanged = stackSignature(old) !== stackSignature(thread);
      if (stateChanged || stackChanged) interval.changes.push({ id: thread.id, name: thread.name, fromState: old.state, toState: thread.state, stateChanged, stackChanged });
      // 不把 null、负值或统计回退转换为有效的 CPU 指标。
      if (previous.cpuTimeEnabled && current.cpuTimeEnabled && Number.isFinite(old.cpuTimeMs) && Number.isFinite(thread.cpuTimeMs) && old.cpuTimeMs >= 0 && thread.cpuTimeMs >= old.cpuTimeMs) {
        const cpuDeltaMs = thread.cpuTimeMs - old.cpuTimeMs;
        interval.cpuMetrics.push({ id: thread.id, name: thread.name, cpuDeltaMs, cpuPercent: cpuDeltaMs / elapsedMs * 100 });
      }
    });
    before.forEach(thread => {
      const newer = after.get(thread.id);
      if (!newer || !sameThread(thread, newer)) interval.exited.push(thread);
    });
    interval.cpuMetrics.sort((a, b) => b.cpuDeltaMs - a.cpuDeltaMs || a.id.localeCompare(b.id));
    result.intervals.push(interval);
  }
  result.cpuMetrics = result.intervals[result.intervals.length - 1]?.cpuMetrics || [];
  // 三个样本中的同一阻塞关系只是本次窗口的线索，不推断此前的阻塞时长。
  if (samples.length === 3) {
    const maps = samples.map(sample => new Map((sample.threads || []).map(thread => [thread.id, thread])));
    (samples[2].threads || []).forEach(thread => {
      if (thread.state !== 'BLOCKED' || !thread.lockName || !thread.lockOwnerId) return;
      if (maps.every(map => {
        const candidate = map.get(thread.id);
        return candidate && sameThread(candidate, thread) && candidate.state === 'BLOCKED' && candidate.lockName === thread.lockName && candidate.lockOwnerId === thread.lockOwnerId;
      })) result.persistentBlocked.push({ id: thread.id, name: thread.name, lockName: thread.lockName, ownerId: thread.lockOwnerId });
    });
  }
  return result;
}

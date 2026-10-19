export function parseSseEvent(rawEvent) {
  let eventName = 'message';
  let id = '';
  const dataLines = [];
  for (const line of rawEvent.split(/\r?\n/)) {
    if (line.startsWith('id:')) {
      id = line.slice(3).trim();
    } else if (line.startsWith('event:')) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }
  const dataStr = dataLines.join('\n');
  let payload = {};
  if (dataStr) {
    try {
      payload = JSON.parse(dataStr);
    } catch (e) {
      payload = { d: dataStr };
    }
  }
  return {
    eventName,
    id,
    payload,
    dataStr
  };
}

// 可选活动通知只针对完整业务帧或注释心跳，旧调用方保持原事件语义。
export function createSseParser(onEvent, onActivity) {
  let pending = '';
  return {
    reset() {
      pending = '';
    },
    consume(chunk) {
      pending += chunk;
      while (true) {
        let sepIndex = pending.indexOf('\n\n');
        let sepLen = 2;
        const crlfIndex = pending.indexOf('\r\n\r\n');
        // 混合换行时始终消费最早的分隔符，避免吞并相邻事件。
        if (crlfIndex !== -1 && (sepIndex === -1 || crlfIndex < sepIndex)) {
          sepIndex = crlfIndex;
          sepLen = 4;
        }
        if (sepIndex === -1) {
          break;
        }
        const rawEvent = pending.slice(0, sepIndex);
        pending = pending.slice(sepIndex + sepLen);
        // 注释心跳与空帧不产生业务事件。
        if (/^(?:event|data):/m.test(rawEvent)) {
          if (onActivity) onActivity();
          onEvent(parseSseEvent(rawEvent));
        } else if (/^:/m.test(rawEvent) && onActivity) onActivity();
      }
    }
  };
}

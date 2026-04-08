export function parseSseEvent(rawEvent) {
  let eventName = 'message';
  const dataLines = [];
  for (const line of rawEvent.split(/\r?\n/)) {
    if (line.startsWith('event:')) {
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
    payload,
    dataStr
  };
}

export function createSseParser(onEvent) {
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
        if (sepIndex === -1) {
          sepIndex = pending.indexOf('\r\n\r\n');
          sepLen = 4;
        }
        if (sepIndex === -1) {
          break;
        }
        const rawEvent = pending.slice(0, sepIndex);
        pending = pending.slice(sepIndex + sepLen);
        onEvent(parseSseEvent(rawEvent));
      }
    }
  };
}

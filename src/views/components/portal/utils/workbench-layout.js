export function createWorkbenchWidget(definition, option = {}) {
  const defaultLayout = (definition && definition.defaultLayout) || {};
  const i = option.i || option.uuid || '';
  const minW = Math.max(getNumber(option.minW, defaultLayout.minW, 2), getNumber(defaultLayout.minW, 0, 0));
  const minH = Math.max(getNumber(option.minH, defaultLayout.minH, 4), getNumber(defaultLayout.minH, 0, 0));
  return {
    uuid: i,
    i,
    type: definition ? definition.type : option.type,
    name: option.name || (definition && definition.title) || '',
    x: getNumber(option.x, defaultLayout.x, 0),
    y: getNumber(option.y, defaultLayout.y, 0),
    w: Math.max(getNumber(option.w, defaultLayout.w, 4), minW),
    h: Math.max(getNumber(option.h, defaultLayout.h, 6), minH),
    minW,
    minH,
    padding: getNumber(option.padding, 0, 0),
    showTitle: option.showTitle === 0 ? 0 : 1,
    config: {
      ...((definition && definition.config) || {}),
      ...(option.config || {})
    }
  };
}

export function resolveWorkbenchLayout(widgetList) {
  const placedList = [];
  const sortedList = (widgetList || []).map(widget => {
    const minW = clampNumber(widget.minW, 1, 12);
    const minH = Math.max(getNumber(widget.minH, 1, 1), 1);
    return {
      ...widget,
      minW,
      minH,
      x: clampNumber(widget.x, 0, 11),
      y: getNumber(widget.y, 0, 0),
      w: Math.max(clampNumber(widget.w, 1, 12), minW),
      h: Math.max(getNumber(widget.h, 4, 4), minH)
    };
  }).sort((a, b) => {
    if (a.y !== b.y) {
      return a.y - b.y;
    }
    return a.x - b.x;
  });
  sortedList.forEach(widget => {
    if (widget.x + widget.w > 12) {
      widget.x = Math.max(0, 12 - widget.w);
    }
    moveBelowCollision(widget, placedList);
    placedList.push(widget);
  });
  return placedList;
}

export function getWorkbenchBottom(widgetList) {
  return (widgetList || []).reduce((max, widget) => {
    return Math.max(max, getNumber(widget.y, 0, 0) + getNumber(widget.h, 0, 0));
  }, 0);
}

export function isWorkbenchWidgetListComplete(widgetList, widgetDefinitions = []) {
  if (!Array.isArray(widgetList)) {
    return false;
  }
  const typeSet = new Set((widgetDefinitions || []).map(item => item.type));
  const uuidSet = new Set();
  return widgetList.every(widget => {
    if (!isWorkbenchWidgetComplete(widget, typeSet) || uuidSet.has(widget.uuid)) {
      return false;
    }
    uuidSet.add(widget.uuid);
    return true;
  });
}

export function filterValidWorkbenchWidgetList(widgetList, widgetDefinitions = []) {
  if (!Array.isArray(widgetList)) {
    return [];
  }
  const typeSet = new Set((widgetDefinitions || []).map(item => item.type));
  const uuidSet = new Set();
  return widgetList.filter(widget => {
    if (!isWorkbenchWidgetComplete(widget, typeSet) || uuidSet.has(widget.uuid)) {
      return false;
    }
    uuidSet.add(widget.uuid);
    return true;
  });
}

export function isWorkbenchWidgetComplete(widget, typeSet) {
  if (!widget || !widget.i || !widget.uuid || widget.i !== widget.uuid) {
    return false;
  }
  if (typeSet && typeSet.size > 0 && !typeSet.has(widget.type)) {
    return false;
  }
  const isInteger = key => Number.isInteger(widget[key]);
  if (!['x', 'y', 'w', 'h'].every(isInteger)) {
    return false;
  }
  return widget.x >= 0 && widget.y >= 0 && widget.w > 0 && widget.h > 0 && widget.x + widget.w <= 12;
}

function moveBelowCollision(widget, placedList) {
  let collision = placedList.find(item => isLayoutCollision(widget, item));
  while (collision) {
    widget.y = collision.y + collision.h;
    collision = placedList.find(item => isLayoutCollision(widget, item));
  }
}

function isLayoutCollision(a, b) {
  if (!a || !b || a.i === b.i) {
    return false;
  }
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function getNumber(value, fallback, defaultValue) {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof fallback === 'number') {
    return fallback;
  }
  return defaultValue;
}

function clampNumber(value, min, max) {
  const number = getNumber(value, min, min);
  return Math.min(Math.max(number, min), max);
}

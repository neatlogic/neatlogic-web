export const PROCESS_TASK_SEARCH_HANDLER = 'process.processTaskSearch';
export const PROCESS_TASK_THEAD_HANDLER = 'process.processTaskTheadList';
export const PROCESS_TASK_CONDITION_HANDLER = 'process.processTaskSearchCondition';
export const PROCESS_TASK_WIDGET_NAME = 'processTaskSearch';
export const PROCESS_TASK_WORKCENTER_UUID = 'allProcessTask';
export const PROCESS_TASK_PAGE_SIZE_LIST = [5, 10, 20, 30];

const THeadPersistKeyList = [
  'name',
  'displayName',
  'isShow',
  'sort',
  'type',
  'config',
  'className',
  'disabled',
  'isSortable'
];

function cloneValue(value) {
  if (value === undefined || value === null) {
    return value;
  }
  return JSON.parse(JSON.stringify(value));
}

function getSortValue(value, fallback) {
  const sort = Number(value);
  return Number.isFinite(sort) ? sort : fallback;
}

function isSelectableThead(item) {
  if (!item || (!item.name && !item.key)) {
    return false;
  }
  return item.disabled !== 1 && item.disabled !== '1' && item.disabled !== true;
}

export function createDefaultConditionConfig() {
  return {
    handlerType: 'simple',
    conditionGroupList: [],
    conditionGroupRelList: [],
    keywordConditionList: [],
    startTimeCondition: null
  };
}

export function normalizePageSize(value) {
  const pageSize = Number(value);
  return PROCESS_TASK_PAGE_SIZE_LIST.includes(pageSize) ? pageSize : 10;
}

export function extractTheadList(data) {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && Array.isArray(data.theadList)) {
    return data.theadList;
  }
  return [];
}

export function normalizeTheadList(list = []) {
  return list
    .filter(isSelectableThead)
    .map((item, index) => {
      const name = item.name || item.key;
      return {
        ...cloneValue(item),
        name,
        displayName: item.displayName || item.title || name,
        isShow: name === 'title' ? 1 : (item.isShow === 0 || item.isShow === false ? 0 : 1),
        sort: getSortValue(item.sort, index + 1)
      };
    })
    .sort((a, b) => a.sort - b.sort)
    .map((item, index) => ({
      ...item,
      sort: index + 1
    }));
}

export function mergeTheadList(availableList = [], savedList = []) {
  const availableTheadList = normalizeTheadList(availableList);
  const savedTheadList = normalizeTheadList(savedList);
  if (!savedTheadList.length) {
    return availableTheadList;
  }

  const availableMap = new Map(availableTheadList.map(item => [item.name, item]));
  const mergedList = [];
  savedTheadList.forEach(savedItem => {
    const availableItem = availableMap.get(savedItem.name);
    if (availableItem) {
      mergedList.push({
        ...availableItem,
        ...savedItem,
        displayName: availableItem.displayName || savedItem.displayName
      });
      availableMap.delete(savedItem.name);
    }
  });
  availableTheadList.forEach(item => {
    if (availableMap.has(item.name)) {
      mergedList.push(item);
    }
  });
  return normalizeTheadList(mergedList);
}

export function serializeTheadList(list = []) {
  const orderedList = list
    .filter(isSelectableThead)
    .map((item, index) => ({
      ...cloneValue(item),
      sort: index + 1
    }));
  return normalizeTheadList(orderedList).map((item, index) => {
    const result = {};
    THeadPersistKeyList.forEach(key => {
      if (item[key] !== undefined) {
        result[key] = cloneValue(item[key]);
      }
    });
    result.sort = index + 1;
    return result;
  });
}

export function toTableTheadList(list = []) {
  return normalizeTheadList(list)
    .filter(item => item.isShow !== 0 && item.name !== '_')
    .map(item => ({
      title: item.displayName,
      key: item.name,
      type: item.type,
      className: item.className,
      isSortable: item.isSortable,
      config: cloneValue(item.config)
    }));
}

export function hasRequiredThead(list = []) {
  const normalizedList = normalizeTheadList(list);
  return normalizedList.some(item => item.isShow !== 0) &&
    normalizedList.some(item => item.name === 'title' && item.isShow !== 0);
}

export function createProcessTaskSearchParam(config = {}, currentPage = 1) {
  return {
    conditionConfig: cloneValue(config.conditionConfig || createDefaultConditionConfig()),
    theadList: serializeTheadList(config.theadList || []),
    pageSize: normalizePageSize(config.pageSize),
    currentPage: Math.max(1, Number(currentPage) || 1)
  };
}

export function getProcessTaskExpireConfig(timeList = [], currentTime = Date.now()) {
  if (!Array.isArray(timeList) || !timeList.length) {
    return {
      expireStatus: 'no-expired-time',
      expireConfig: {
        timeLeftMin: null,
        expireTimeMin: null,
        expiredSlaName: null,
        willOverTimeMin: null,
        willOverSlaName: null
      }
    };
  }
  const expiredTimeList = timeList.filter(item => item && Object.prototype.hasOwnProperty.call(item, 'expireTime'));
  const willOverTimeList = timeList.filter(item => item && Object.prototype.hasOwnProperty.call(item, 'timeLeft'));
  let expireTimeMin = Math.min(...expiredTimeList.map(item => item.expireTime));
  let willOverTimeMin = Math.min(...willOverTimeList.map(item => item.timeLeft));
  let expiredSlaName = null;
  let willOverSlaName = null;
  let timeLeftMin = null;
  if (expireTimeMin === Infinity) {
    expireTimeMin = null;
  } else {
    const expiredTimeItem = expiredTimeList.find(item => item.expireTime === expireTimeMin);
    expiredSlaName = expiredTimeItem && expiredTimeItem.slaName;
    if (expiredTimeItem && expiredTimeItem.slaTimeDisplayMode === 'naturalTime') {
      timeLeftMin = expireTimeMin - currentTime;
    } else if (expiredTimeItem && expiredTimeItem.slaTimeDisplayMode === 'workTime') {
      timeLeftMin = Math.abs(expiredTimeItem.timeLeft || 0);
    }
  }
  if (willOverTimeMin === Infinity) {
    willOverTimeMin = null;
  } else {
    const willOverTimeItem = willOverTimeList.find(item => item.timeLeft === willOverTimeMin);
    willOverSlaName = willOverTimeItem && willOverTimeItem.slaName;
  }
  let expireStatus = 'no-expired-time';
  if (expireTimeMin) {
    if (currentTime > expireTimeMin) {
      expireStatus = 'is-expired';
    } else if (willOverTimeMin && willOverTimeMin < expireTimeMin) {
      expireStatus = currentTime > willOverTimeMin ? 'will-be-expired' : 'not-expired';
    } else {
      expireStatus = 'not-expired';
    }
  }
  return {
    expireStatus,
    expireConfig: {
      timeLeftMin,
      expireTimeMin,
      expiredSlaName,
      willOverTimeMin,
      willOverSlaName
    }
  };
}

export function normalizeProcessTaskRowList(list = [], currentTime = Date.now()) {
  return (Array.isArray(list) ? list : []).map(item => ({
    ...item,
    ...getProcessTaskExpireConfig(item && item.expiretime, currentTime),
    get rowClassName() {
      return this.isShow === 0 ? 'hide-task' : this.expireStatus;
    }
  }));
}

export function serializeProcessTaskSearchConfig(config = {}) {
  return {
    conditionConfig: cloneValue(config.conditionConfig || createDefaultConditionConfig()),
    theadList: serializeTheadList(config.theadList || []),
    pageSize: normalizePageSize(config.pageSize)
  };
}

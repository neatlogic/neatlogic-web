const HANDLERS = ['formcientityselector', 'formcientitymodify'];

export function formComponentList(items) {
  return (items || []).filter(item => item && HANDLERS.includes(item.handler) && item.uuid && item.key);
}

export function selectedValues(uuidList = [], keyList = []) {
  const keys = Array.isArray(keyList) ? keyList : [];
  return (Array.isArray(uuidList) ? uuidList : []).map((uuid, index) => keys[index] || uuid);
}

export function selectedReferences(values, items, uuidList = [], keyList = []) {
  const components = formComponentList(items);
  const previousKeys = Array.isArray(keyList) ? keyList : [];
  const previousValues = selectedValues(uuidList, previousKeys);
  const references = (values || []).map(value => {
    const index = previousValues.indexOf(value);
    if (index >= 0) return {uuid: uuidList[index], key: previousKeys[index] || ''};
    const matches = components.filter(item => item.key === value);
    if (matches.length === 1) return {uuid: matches[0].uuid, key: value};
    return {uuid: '', key: value};
  });
  return {
    uuidList: references.map(item => item.uuid),
    keyList: references.map(item => item.key)
  };
}

export function validReferences(uuidList, keyList, items) {
  if (!Array.isArray(uuidList) || !uuidList.length || !Array.isArray(keyList) || uuidList.length !== keyList.length) return false;
  const components = formComponentList(items);
  return uuidList.every((uuid, index) => {
    const matches = components.filter(item => item.key === keyList[index]);
    return matches.length === 1 && matches[0].uuid === uuid;
  });
}

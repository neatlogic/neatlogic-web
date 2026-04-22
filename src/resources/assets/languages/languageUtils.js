function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge(target, source) {
  if (!isPlainObject(target)) {
    return isPlainObject(source) ? { ...source } : source;
  }
  if (!isPlainObject(source)) {
    return source === undefined ? { ...target } : source;
  }
  const result = { ...target };
  Object.keys(source).forEach(key => {
    const sourceValue = source[key];
    const targetValue = result[key];
    result[key] = isPlainObject(targetValue) && isPlainObject(sourceValue) ? deepMerge(targetValue, sourceValue) : sourceValue;
  });
  return result;
}

function getCategoryName(path, languageCode) {
  const langIndex = path.indexOf('languages/');
  if (langIndex === -1) return null;
  const jsonIndex = path.indexOf(`/${languageCode}.json`, langIndex);
  if (jsonIndex === -1) return null;
  return path.substring(langIndex + 10, jsonIndex);
}

function mergeByKey(targetCategory, key, value) {
  targetCategory[key] = deepMerge(targetCategory[key], value);
}

function handleLanguageConfig(languagesCategoryConfig, languagesConfig, languagePath, languageCode) {
  const pathParts = languagePath.split('/');
  const moduleName = pathParts[1]?.split('-')?.pop() ?? pathParts[1];
  const category = getCategoryName(languagePath, languageCode);
  const exportValue = languagesConfig(languagePath) ?? {};
  if (!category || !isPlainObject(exportValue)) {
    return;
  }

  if (!languagesCategoryConfig[category]) {
    languagesCategoryConfig[category] = {};
  }

  const targetCategory = languagesCategoryConfig[category];
  const exportKeys = Object.keys(exportValue);

  if (Object.prototype.hasOwnProperty.call(exportValue, moduleName)) {
    mergeByKey(targetCategory, moduleName, exportValue[moduleName]);
    return;
  }

  const matchedKeys = exportKeys.filter(key => Object.prototype.hasOwnProperty.call(targetCategory, key));
  if (matchedKeys.length > 0) {
    matchedKeys.forEach(key => {
      mergeByKey(targetCategory, key, exportValue[key]);
    });
    return;
  }

  mergeByKey(targetCategory, moduleName, exportValue);
}

function loadModuleLanguages(languagesCategoryConfig, languagesConfig, languageCode) {
  languagesConfig.keys().forEach(languagePath => {
    if (languagePath) {
      handleLanguageConfig(languagesCategoryConfig, languagesConfig, languagePath, languageCode);
    }
  });
}

export function createLanguageConfig(baseCategoryConfig, languageCode, languageContexts = []) {
  const languagesCategoryConfig = { ...baseCategoryConfig };

  try {
    languageContexts.forEach(languagesConfig => {
      loadModuleLanguages(languagesCategoryConfig, languagesConfig, languageCode);
    });
  } catch (error) {
    console.error(`${languageCode}.json`, error);
  }

  return languagesCategoryConfig;
}

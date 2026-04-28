/**
 * 判断传入值是否为普通对象，排除数组和空值。
 * @param {*} value 待判断的值
 * @returns {boolean} 是否为普通对象
 */
function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 递归合并两个对象，source 中的值会覆盖 target 中的同名值。
 * @param {*} target 目标对象
 * @param {*} source 来源对象
 * @returns {*} 合并后的结果
 */
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

/**
 * 根据语言文件路径提取语言分类名称。
 * @param {string} path 语言文件路径
 * @param {string} languageCode 语言编码
 * @returns {string|null} 分类名称，未匹配时返回 null
 */
function getCategoryName(path, languageCode) {
  const langIndex = path.indexOf('languages/');
  if (langIndex === -1) return null;
  const jsonIndex = path.indexOf(`/${languageCode}.json`, langIndex);
  if (jsonIndex === -1) return null;
  return path.substring(langIndex + 10, jsonIndex);
}

/**
 * 按指定 key 将语言内容合并到目标分类中。
 * @param {Object} targetCategory 目标分类对象
 * @param {string} key 分类下的键名
 * @param {*} value 待合并的值
 */
function mergeByKey(targetCategory, key, value) {
  targetCategory[key] = deepMerge(targetCategory[key], value);
}

const ROOT_MERGE_CATEGORY_SET = new Set(['title', 'group', 'description']);

/**
 * 处理单个语言文件，并按分类及模块名写入最终语言配置。
 * @param {Object} languagesCategoryConfig 最终语言分类配置
 * @param {Function} languagesConfig 语言文件上下文加载函数
 * @param {string} languagePath 当前语言文件路径
 * @param {string} languageCode 语言编码
 */
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

  if (ROOT_MERGE_CATEGORY_SET.has(category)) {
    languagesCategoryConfig[category] = deepMerge(targetCategory, exportValue);
    return;
  }

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

/**
 * 遍历指定上下文中的全部语言文件并依次加载。
 * @param {Object} languagesCategoryConfig 最终语言分类配置
 * @param {Function} languagesConfig 语言文件上下文加载函数
 * @param {string} languageCode 语言编码
 */
function loadModuleLanguages(languagesCategoryConfig, languagesConfig, languageCode) {
  languagesConfig.keys().forEach(languagePath => {
    if (languagePath) {
      handleLanguageConfig(languagesCategoryConfig, languagesConfig, languagePath, languageCode);
    }
  });
}

/**
 * 创建最终的语言配置，并合并多个模块中的同语言资源。
 * @param {Object} baseCategoryConfig 基础语言分类配置
 * @param {string} languageCode 语言编码
 * @param {Function[]} languageContexts 语言文件上下文列表
 * @returns {Object} 合并后的语言配置
 */
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

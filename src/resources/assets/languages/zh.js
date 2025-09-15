import page from '@/resources/assets/languages/page/zh.json';
import form from '@/resources/assets/languages/form/zh.json';
import dialog from '@/resources/assets/languages/dialog/zh.json';
import message from '@/resources/assets/languages/message/zh.json';
import router from '@/resources/assets/languages/router/zh.json';
import term from '@/resources/assets/languages/term/zh.json';
let languagesCategoryConfig = {
  page: page,
  form: form,
  dialog: dialog,
  message: message,
  router: router,
  term: term
};
try {
  // 导入定制模块多语言
  let languagesConfig = require.context('@/community-module', true, /zh.json$/);
  languagesConfig.keys().forEach(languagePath => {
    if (languagePath) {
      handleLanguageConfig(languagesConfig, languagePath);
    }
  });
  languagesConfig = require.context('@/commercial-module', true, /zh.json$/);
  languagesConfig.keys().forEach(languagePath => {
    if (languagePath) {
      handleLanguageConfig(languagesConfig, languagePath);
    }
  });
  function getCategoryName(path) {
    const langIndex = path.indexOf('languages/');
    if (langIndex === -1) return null;
    const jsonIndex = path.indexOf('/zh.json', langIndex);
    if (jsonIndex === -1) return null;
    return path.substring(langIndex + 10, jsonIndex);
  }
  function handleLanguageConfig(languagesConfig, languagePath) {
    const pathParts = languagePath.split('/');
    const moduleName = pathParts[1]?.split('-')?.pop() ?? pathParts[1];
    const category = getCategoryName(languagePath);
    const exportValue = languagesConfig(languagePath) ?? {};

    // 确保类别存在
    if (!languagesCategoryConfig[category]) {
      languagesCategoryConfig[category] = {};
    }

    let targetCategory = languagesCategoryConfig[category];
    const childCategoryList = Object.keys(targetCategory) || [];
    if (targetCategory[moduleName]) {
      // 合并现有配置和新配置
      targetCategory[moduleName] = { ...targetCategory[moduleName], ...exportValue };
    } else {
      // 创建新模块配置
      if (childCategoryList && childCategoryList.length > 0) {
        // 如果存在子类别，将新模块配置添加到子类别中
        targetCategory[moduleName] = exportValue;
      } else {
        // 如果不存在子类别，将新模块配置添加到根类别中
        languagesCategoryConfig[category] = exportValue;
      }
    }
  }
} catch (error) {
  console.error('zh.json抛出异常', error);
}
export default {
  ...languagesCategoryConfig
};

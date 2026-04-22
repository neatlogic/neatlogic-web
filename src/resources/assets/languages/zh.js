import page from '@/resources/assets/languages/page/zh.json';
import form from '@/resources/assets/languages/form/zh.json';
import dialog from '@/resources/assets/languages/dialog/zh.json';
import message from '@/resources/assets/languages/message/zh.json';
import router from '@/resources/assets/languages/router/zh.json';
import term from '@/resources/assets/languages/term/zh.json';
import { createLanguageConfig } from '@/resources/assets/languages/languageUtils';

const baseCategoryConfig = {
  page: page,
  form: form,
  dialog: dialog,
  message: message,
  router: router,
  term: term
};

const languagesCategoryConfig = createLanguageConfig(baseCategoryConfig, 'zh', [
  require.context('@/community-module', true, /zh\.json$/),
  require.context('@/commercial-module', true, /zh\.json$/)
]);

export default {
  ...languagesCategoryConfig
};

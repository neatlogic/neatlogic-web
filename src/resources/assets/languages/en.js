import page from '@/resources/assets/languages/page/en.json';
import form from '@/resources/assets/languages/form/en.json';
import dialog from '@/resources/assets/languages/dialog/en.json';
import message from '@/resources/assets/languages/message/en.json';
import router from '@/resources/assets/languages/router/en.json';
import term from '@/resources/assets/languages/term/en.json';
import { createLanguageConfig } from '@/resources/assets/languages/languageUtils';

const baseCategoryConfig = {
  page: page,
  form: form,
  dialog: dialog,
  message: message,
  router: router,
  term: term
};

const languagesCategoryConfig = createLanguageConfig(baseCategoryConfig, 'en', [
  require.context('@/community-module', true, /en\.json$/),
  require.context('@/commercial-module', true, /en\.json$/)
]);

export default {
  ...languagesCategoryConfig
};

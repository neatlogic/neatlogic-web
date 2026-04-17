import {$t} from '@/resources/init.js';
export const config = {
  module: 'framework',
  menuType: {
    user: $t('router.framework.user'),
    message: $t('router.framework.message'),
    integration: $t('router.framework.integration'),
    notify: $t('router.framework.notify'),
    agent: $t('router.framework.agent'),
    others: $t('router.framework.others'),
    healthcheck: $t('router.framework.healthcheck'),
    ai: '人工智能',
    license: $t('router.framework.license')
  }
};

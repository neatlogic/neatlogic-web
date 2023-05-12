import {$t} from '@/resources/init.js';
export const config = { 
  module: 'framework', 
  menuType: { 
    user: $t('router.framework.user'), 
    message: $t('router.framework.message'),  
    integration: $t('router.framework.integration'), 
    notify: $t('router.framework.notify'), 
    job: $t('router.framework.job'), 
    others: $t('router.framework.others'), 
    healthcheck: $t('router.framework.healthcheck'), 
    license: $t('router.framework.license') 
  } 
};

import {$t} from '@/resources/init.js';
export const config = { 
  module: 'process', 
  menuType: { 
    task: $t('term.process.task'), 
    collection: '工单集合',
    catalog: $t('term.process.catalog'), 
    flow: $t('router.process.flowmanage'), 
    form: $t('page.form'), 
    event: $t('page.event'), 
    others: $t('page.others')
  } 
};

import { $t } from '@/resources/init.js';

export default {
  name: 'time',
  label: $t('page.currenttime'),
  type: 'time',
  icon: 'tsfont-formtime',
  widgetType: 'other',
  hasCustomConfig: true,
  width: 5,
  height: 3,
  padding: 5,
  needData: false,
  fields: [{ name: 'text', label: $t('page.copywriting'), type: ['text', 'number', 'datetime', 'time', 'date'], isRequired: true }],
  config: { align: 'left', backgroundColor: '', backgroundImage: '', fontsize: 12, color: '' }
};

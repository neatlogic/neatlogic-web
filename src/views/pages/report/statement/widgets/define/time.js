import { $t } from '@/resources/init.js';

export default {
  name: 'time',
  label: '时间',
  type: 'time',
  icon: 'tsfont-formtime',
  widgetType: 'basic',
  hasCustomConfig: true,
  width: 300,
  height: 100,
  padding: 5,
  needData: false,
  fields: [{ name: 'text', label: $t('page.copywriting'), type: ['text', 'number', 'datetime', 'time', 'date'], isRequired: true }],
  config: { align: 'left', backgroundColor: '', backgroundImage: '', fontsize: 12, color: '' }
};

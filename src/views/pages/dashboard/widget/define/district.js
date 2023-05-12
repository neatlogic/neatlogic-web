import {$t} from '@/resources/init.js';

export default { 
  name: 'district', 
  label: $t('term.report.district'), 
  type: 'district', 
  icon: 'tsfont-location-o', 
  widgetType: 'geography', 
  width: 5, 
  height: 2, 
  padding: 10, 
  hasCustomConfig: false, 
  needData: false 
};

import {$t} from '@/resources/init.js';

export default { 
  name: 'district', 
  label: $t('term.report.district'), 
  type: 'district', 
  icon: 'tsfont-location-o', 
  widgetType: 'geography', 
  width: 500, 
  height: 500, 
  padding: 5, 
  hasCustomConfig: false, 
  needData: false 
};

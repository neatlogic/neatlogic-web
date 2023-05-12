import {$t} from '@/resources/init.js';

export default { 
  name: 'map', 
  label: $t('page.map'), 
  type: 'map', 
  icon: 'tsfont-location', 
  widgetType: 'geography', 
  width: 500, 
  height: 500, 
  padding: 5, 
  hasCustomConfig: false, 
  needData: false 
};

import {$t} from '@/resources/init.js';

export default { 
  name: 'image', 
  label: $t('page.image'), 
  type: 'image', 
  icon: 'tsfont-image-s', 
  widgetType: 'basic', 
  hasCustomConfig: true, 
  width: 200, 
  height: 200, 
  padding: 5, 
  needData: false, 
  config: { align: 'left', autoFit: false, imageUrl: '' } 
};

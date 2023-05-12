import {$t} from '@/resources/init.js';

export default { 
  name: 'point', 
  label: $t('term.report.chartsetting.pointchart'), 
  type: 'point', 
  widgetType: 'other', 
  width: 200, 
  height: 200, 
  padding: 5, 
  config: { 
    background: { 
      color: { 
        value: '' 
      } 
    }, 
    particles: { 
      move: { 
        enable: true 
      }, 
      number: { 
        value: 10 
      }, 
      size: { 
        value: 10, 
        random: true, 
        animation: { 
          enable: true, 
          speed: 20, 
          minimumValue: 0.1, 
          sync: false 
        } 
      }, 
      opacity: { 
        value: 1, 
        random: true, 
        animation: { 
          enable: true, 
          speed: 5, 
          minimumValue: 0.1, 
          sync: false 
        } 
      }, 
      links: { 
        isRandomColor: true, 
        enable: false, 
        distance: 100, 
        color: { value: 'random' }, 
        opacity: 0.4, 
        width: 1 
      }, 
      isRandomColor: true, 
      color: { value: 'random' } 
    } 
  }, 
  hasCustomConfig: true, 
  needData: false 
};

import {$t} from '@/resources/init.js';

export default { 
  name: 'maparea', 
  label: $t('term.report.chartsetting.areafill'), 
  type: 'maparea', 
  icon: 'tsfont-location', 
  widgetType: 'geography', 
  width: 5, 
  height: 5, 
  padding: 10, 
  hasCustomConfig: true, 
  needData: false, 
  config: { 
    map: { 
      type: 'mapbox', 
      style: 'blank', 
      pitch: 0 
    }, 
    color: { 
      field: 'adcode', 
      value: ['rgb(239,243,255)', 'rgb(189,215,231)', 'rgb(107,174,214)', 'rgb(49,130,189)', 'rgb(8,81,156)'], 
      scale: { type: 'cat' } 
    }, 
    viewLevel: { 
      level: 'country', 
      adcode: 100000 
    }, 
    style: { 
      opacity: 1, 
      stroke: '#ccc', 
      lineWidth: 0.6, 
      lineOpacity: 1 
    }, 
    label: { 
      visible: true, 
      field: 'name', 
      style: { 
        fill: '#000', 
        opacity: 0.8, 
        fontSize: 10, 
        stroke: '#fff', 
        strokeWidth: 1, 
        textAllowOverlap: false, 
        padding: [5, 5] 
      } 
    } 
  } 
};

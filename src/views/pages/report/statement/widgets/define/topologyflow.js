import { $t } from '@/resources/init.js';

export default {
  name: 'topologyflow',
  label: $t('term.report.topologyflow'),
  type: 'topologyflow',
  icon: 'tsfont-topo',
  widgetType: 'effect',
  hasCustomConfig: true,
  supportAppearanceColor: true,
  width: 520,
  height: 280,
  padding: 0,
  color: '#00e5ff',
  accentColor: '#00ffa8',
  needData: false,
  config: {
    renderMode: 'normal',
    preset: 'ops',
    enabled: true,
    speed: 8,
    direction: 'forward',
    lineWidth: 2,
    lineStyle: 'solid',
    lineCap: 'round',
    flowLength: 10,
    flowDensity: 1,
    baseOpacity: 0.24,
    showNodes: true,
    nodeSize: 4,
    nodeStyle: 'dot',
    nodeOpacity: 1,
    lowPerformance: false
  }
};
